import { ConvexError, v } from "convex/values";
import { internal } from "./_generated/api";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    stripeSessionId: v.string(),
    customerEmail: v.string(),
    items: v.array(
      v.object({
        productId: v.optional(v.id("products")),
        slug: v.string(),
        name: v.string(),
        price: v.number(),
        size: v.string(),
        quantity: v.number(),
      }),
    ),
    total: v.number(),
    currency: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("orders")
      .withIndex("by_session", (q) => q.eq("stripeSessionId", args.stripeSessionId))
      .first();
    if (existing) return existing._id;

    const email = args.customerEmail.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("Invalid customer email");
    }
    if (!Array.isArray(args.items) || args.items.length === 0) {
      throw new Error("Order must contain at least one item");
    }
    for (const item of args.items) {
      if (!item.productId || !item.slug || !item.name || !item.size) {
        throw new Error("Invalid order item");
      }
      if (typeof item.price !== "number" || item.price < 0) {
        throw new Error("Invalid item price");
      }
      if (typeof item.quantity !== "number" || item.quantity < 1) {
        throw new Error("Invalid item quantity");
      }
    }
    if (typeof args.total !== "number" || args.total < 0) {
      throw new Error("Invalid order total");
    }
    if (args.currency !== "eur") {
      throw new Error("Unsupported currency");
    }

    return await ctx.db.insert("orders", { ...args, customerEmail: email, status: "pending" });
  },
});

export const fulfill = mutation({
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

    // Reject oversell before marking the order paid so we never commit a payment
    // against inventory we cannot fulfill (stock is validated again atomically in
    // decrementSizeStock as a safety net).
    for (const item of order.items) {
      if (!item.productId) continue;
      const product = await ctx.db.get(item.productId);
      if (!product) continue;
      const current = product.sizeStock?.[item.size] ?? 0;
      if (current < item.quantity) {
        throw new ConvexError(`Insufficient stock for ${item.name} (size ${item.size})`);
      }
    }

    await ctx.db.patch(order._id, {
      status: "paid",
      stripePaymentIntentId: args.stripePaymentIntentId,
      customerEmail: args.customerEmail ?? order.customerEmail,
      shippingAddress: args.shippingAddress,
    });
    for (const item of order.items) {
      if (item.productId) {
        await ctx.runMutation(internal.products.decrementSizeStock, {
          id: item.productId,
          size: item.size,
          quantity: item.quantity,
        });
      }
    }
    // Coupon consumption is atomic with fulfillment so a retry can never double-use it.
    if (args.couponId) {
      const coupon = await ctx.db.get(args.couponId);
      if (coupon) {
        await ctx.db.patch(args.couponId, { usedCount: coupon.usedCount + 1 });
      }
    }
    // Send confirmation email
    if (args.customerEmail) {
      await ctx.scheduler.runAfter(0, internal.emails.sendOrderConfirmation, {
        customerEmail: args.customerEmail,
        orderItems: order.items.map((i) => ({
          name: i.name,
          size: i.size,
          price: i.price,
          quantity: i.quantity,
        })),
        total: order.total,
      });
    }
    return order._id;
  },
});

export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("orders")
      .withIndex("by_email", (q) => q.eq("customerEmail", args.email.trim()))
      .collect();
  },
});
