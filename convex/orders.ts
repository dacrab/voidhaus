import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { internal } from "./_generated/api";

export const list = query({
  args: { status: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.status) {
      return await ctx.db
        .query("orders")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")
        .collect();
    }
    return await ctx.db.query("orders").order("desc").collect();
  },
});

export const getBySession = query({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("orders")
      .withIndex("by_session", (q) => q.eq("stripeSessionId", args.sessionId))
      .first();
  },
});

export const create = mutation({
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
      })
    ),
    total: v.number(),
    currency: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("orders", { ...args, status: "pending" });
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("orders"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status });
  },
});

export const fulfill = mutation({
  args: {
    stripeSessionId: v.string(),
    stripePaymentIntentId: v.string(),
    customerEmail: v.optional(v.string()),
    shippingAddress: v.optional(
      v.object({
        name: v.string(),
        line1: v.string(),
        line2: v.optional(v.string()),
        city: v.string(),
        state: v.optional(v.string()),
        postalCode: v.string(),
        country: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db
      .query("orders")
      .withIndex("by_session", (q) =>
        q.eq("stripeSessionId", args.stripeSessionId)
      )
      .first();
    if (!order) return null;
    await ctx.db.patch(order._id, {
      status: "paid",
      stripePaymentIntentId: args.stripePaymentIntentId,
      customerEmail: args.customerEmail ?? order.customerEmail,
      shippingAddress: args.shippingAddress,
    });
    for (const item of order.items) {
      await ctx.runMutation(internal.products.decrementSizeStock, {
        id: item.productId, size: item.size, quantity: item.quantity,
      });
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
