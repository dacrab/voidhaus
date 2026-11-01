import { ConvexError, type Infer, v } from "convex/values";
import { isValidEmail } from "../src/lib/data/limits";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { internalMutation, type MutationCtx, query } from "./_generated/server";

const orderItemValidator = v.object({
  slug: v.string(),
  name: v.string(),
  price: v.number(),
  size: v.string(),
  quantity: v.number(),
});

const shippingAddressValidator = v.object({
  name: v.string(),
  line1: v.string(),
  line2: v.optional(v.string()),
  city: v.string(),
  state: v.optional(v.string()),
  postalCode: v.string(),
  country: v.string(),
});

type OrderItem = Infer<typeof orderItemValidator>;

const fulfillmentArgs = {
  stripeSessionId: v.string(),
  stripePaymentIntentId: v.string(),
  customerEmail: v.string(),
  items: v.array(orderItemValidator),
  total: v.number(),
  discount: v.number(),
  couponId: v.optional(v.id("coupons")),
  shippingAddress: v.optional(shippingAddressValidator),
};

function validateItems(items: OrderItem[]): void {
  if (items.length === 0) throw new ConvexError("Order must contain at least one item");

  for (const item of items) {
    if (!(item.slug && item.name && item.size)) throw new ConvexError("Invalid order item");
    if (!Number.isInteger(item.price) || item.price < 0) throw new ConvexError("Invalid order item price");
    if (!Number.isInteger(item.quantity) || item.quantity < 1) throw new ConvexError("Invalid order item quantity");
  }
}

async function findProduct(ctx: MutationCtx, slug: string) {
  return ctx.db
    .query("products")
    .withIndex("by_slug", (q) => q.eq("slug", slug))
    .first();
}

/** Names of order items whose per-size stock can no longer cover them. */
async function findOversoldItems(ctx: MutationCtx, items: OrderItem[]): Promise<string[]> {
  const soldOut: string[] = [];

  for (const item of items) {
    const product = await findProduct(ctx, item.slug);
    if ((product?.sizeStock[item.size] ?? 0) < item.quantity) {
      soldOut.push(`${item.name} (${item.size})`);
    }
  }

  return soldOut;
}

async function decrementStock(ctx: MutationCtx, items: OrderItem[]): Promise<void> {
  for (const item of items) {
    const product = await findProduct(ctx, item.slug);
    if (!product) continue;

    await ctx.db.patch(product._id, {
      sizeStock: {
        ...product.sizeStock,
        [item.size]: (product.sizeStock[item.size] ?? 0) - item.quantity,
      },
    });
  }
}

async function consumeCoupon(ctx: MutationCtx, couponId: Id<"coupons"> | undefined): Promise<void> {
  if (!couponId) return;

  const coupon = await ctx.db.get(couponId);
  if (!coupon?.active) return;

  const expired = coupon.expiresAt ? Date.now() > coupon.expiresAt : false;
  const exhausted = coupon.maxUses ? coupon.usedCount >= coupon.maxUses : false;
  if (!(expired || exhausted)) {
    await ctx.db.patch(coupon._id, { usedCount: coupon.usedCount + 1 });
  }
}

/**
 * Internal: only callable from the Stripe webhook pipeline, which is gated by a
 * signature-verified server route and a shared secret. Idempotent per checkout
 * session. On oversell the order is recorded as `failed` instead of throwing,
 * so Stripe retries stop and the payment can be refunded against a durable record.
 */
export const fulfill = internalMutation({
  args: fulfillmentArgs,
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("orders")
      .withIndex("by_session", (q) => q.eq("stripeSessionId", args.stripeSessionId))
      .first();
    if (existing) return existing._id;

    const customerEmail = args.customerEmail.trim();
    if (!isValidEmail(customerEmail)) throw new ConvexError("Invalid customer email");
    validateItems(args.items);
    if (!Number.isInteger(args.total) || args.total < 0) throw new ConvexError("Invalid order total");
    if (!Number.isInteger(args.discount) || args.discount < 0) throw new ConvexError("Invalid discount");

    const order = {
      stripeSessionId: args.stripeSessionId,
      stripePaymentIntentId: args.stripePaymentIntentId,
      customerEmail,
      ...(args.couponId ? { couponId: args.couponId } : {}),
      items: args.items,
      total: args.total,
      discount: args.discount,
      currency: "eur" as const,
      ...(args.shippingAddress ? { shippingAddress: args.shippingAddress } : {}),
    };

    const soldOut = await findOversoldItems(ctx, args.items);
    if (soldOut.length > 0) {
      // biome-ignore lint/suspicious/noConsole: oversell refunds need a durable record in server logs
      console.error(`Order ${args.stripeSessionId} failed, oversell — refund required: ${soldOut.join(", ")}`);
      return ctx.db.insert("orders", { ...order, status: "failed" });
    }

    await decrementStock(ctx, args.items);
    await consumeCoupon(ctx, args.couponId);

    const orderId = await ctx.db.insert("orders", { ...order, status: "paid" });

    await ctx.scheduler.runAfter(0, internal.emails.sendOrderConfirmation, {
      customerEmail,
      orderItems: args.items.map((item) => ({
        name: item.name,
        size: item.size,
        price: item.price,
        quantity: item.quantity,
      })),
      // Item prices are already net of the checkout-time discount, so this is
      // exactly what the customer paid.
      total: args.total,
    });

    return orderId;
  },
});

// Public but capability-gated: callers must know the Stripe checkout session id,
// which is only revealed to the payer post-redirect.
export const getBySession = query({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_session", (q) => q.eq("stripeSessionId", args.sessionId))
      .collect();

    return orders.map((order) => ({
      id: order._id,
      items: order.items,
      total: order.total,
      discount: order.discount,
      currency: order.currency,
      status: order.status,
      createdAt: order._creationTime,
    }));
  },
});
