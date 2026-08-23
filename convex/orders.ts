import { ConvexError, v } from "convex/values";
import { isValidEmail } from "../src/lib/data/limits";
import { internal } from "./_generated/api";
import { internalMutation, query } from "./_generated/server";

// Internal: only reachable from the Stripe webhook pipeline (http.ts), which is
// gated by a signature-verified server route and a shared secret.
export const create = internalMutation({
  args: {
    stripeSessionId: v.string(),
    customerEmail: v.string(),
    items: v.array(
      v.object({
        productId: v.id("products"),
        slug: v.string(),
        name: v.string(),
        price: v.number(),
        size: v.string(),
        quantity: v.number(),
      }),
    ),
    total: v.number(),
    discount: v.optional(v.number()),
    currency: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("orders")
      .withIndex("by_session", (q) => q.eq("stripeSessionId", args.stripeSessionId))
      .first();
    if (existing) return existing._id;

    if (!isValidEmail(args.customerEmail)) throw new ConvexError("Invalid customer email");
    if (args.items.length === 0) throw new ConvexError("Order must contain at least one item");
    for (const item of args.items) {
      if (!(item.slug && item.name && item.size) || item.price < 0 || item.quantity < 1) {
        throw new ConvexError("Invalid order item");
      }
    }
    if (args.total < 0 || args.currency !== "eur") throw new ConvexError("Invalid order total");

    return await ctx.db.insert("orders", {
      ...args,
      customerEmail: args.customerEmail.trim(),
      status: "pending",
    });
  },
});

// Internal: only callable from the webhook pipeline. Idempotent on `paid`; on
// oversell the order is marked `failed` instead of throwing, so Stripe retries
// stop and the payment can be refunded manually against a durable record.
export const fulfill = internalMutation({
  args: {
    stripeSessionId: v.string(),
    stripePaymentIntentId: v.string(),
    customerEmail: v.optional(v.string()),
    couponId: v.optional(v.id("coupons")),
    shippingAddress: v.optional(
      v.object({
        name: v.string(),
        line1: v.string(),
        line2: v.optional(v.string()),
        city: v.string(),
        state: v.optional(v.string()),
        postalCode: v.string(),
        country: v.string(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db
      .query("orders")
      .withIndex("by_session", (q) => q.eq("stripeSessionId", args.stripeSessionId))
      .first();
    if (!order) return null;
    // Idempotent: a retried webhook delivery must not re-decrement stock, re-consume
    // a coupon, or re-send the confirmation email once the order is already paid.
    if (order.status === "paid") return order._id;

    const soldOut: string[] = [];
    for (const item of order.items) {
      if (!item.productId) continue;
      const product = await ctx.db.get(item.productId);
      if (!product) continue;
      const current = product.sizeStock?.[item.size] ?? 0;
      if (current < item.quantity) soldOut.push(`${item.name} (${item.size})`);
    }
    if (soldOut.length > 0) {
      console.error(`Order ${order._id} failed, oversell — refund required: ${soldOut.join(", ")}`);
      await ctx.db.patch(order._id, { status: "failed" });
      return null;
    }

    for (const item of order.items) {
      if (!item.productId) continue;
      const product = await ctx.db.get(item.productId);
      if (!product) continue;
      const sizeStock: Record<string, number> = { ...product.sizeStock };
      sizeStock[item.size] = (sizeStock[item.size] ?? 0) - item.quantity;
      await ctx.db.patch(item.productId, {
        sizeStock,
        stock: Object.values(sizeStock).reduce((a: number, b: number) => a + b, 0),
      });
    }

    // Re-check limits at fulfillment: pending checkouts can overshoot maxUses.
    if (args.couponId) {
      const coupon = await ctx.db.get(args.couponId);
      if (
        coupon?.active &&
        !(coupon.expiresAt && Date.now() > coupon.expiresAt) &&
        !(coupon.maxUses && coupon.usedCount >= coupon.maxUses)
      ) {
        await ctx.db.patch(coupon._id, { usedCount: coupon.usedCount + 1 });
      }
    }

    await ctx.db.patch(order._id, {
      status: "paid",
      stripePaymentIntentId: args.stripePaymentIntentId,
      customerEmail: args.customerEmail ?? order.customerEmail,
      shippingAddress: args.shippingAddress,
    });

    const email = args.customerEmail ?? order.customerEmail;
    await ctx.scheduler.runAfter(0, internal.emails.sendOrderConfirmation, {
      customerEmail: email,
      orderItems: order.items.map((i) => ({
        name: i.name,
        size: i.size,
        price: i.price,
        quantity: i.quantity,
      })),
      // Item prices are already net of the checkout-time discount, so this is
      // exactly what the customer paid.
      total: order.total,
    });
    return order._id;
  },
});

// Public but capability-gated: callers must know the Stripe checkout session id
// (only shown to the payer post-redirect). Returns no PII beyond purchased items.
export const getBySession = query({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_session", (q) => q.eq("stripeSessionId", args.sessionId))
      .collect();
    return orders.map((o) => ({
      id: o._id,
      items: o.items,
      total: o.total,
      discount: o.discount ?? 0,
      currency: o.currency,
      status: o.status,
      createdAt: o._creationTime,
    }));
  },
});
