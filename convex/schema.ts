import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Only per-size stock lives in Convex; the catalog itself is static in
  // src/lib/data/products.ts and keyed by `slug`.
  products: defineTable({
    slug: v.string(),
    sizeStock: v.record(v.string(), v.number()),
  }).index("by_slug", ["slug"]),

  orders: defineTable({
    stripeSessionId: v.string(),
    stripePaymentIntentId: v.optional(v.string()),
    customerEmail: v.string(),
    couponId: v.optional(v.id("coupons")),
    items: v.array(
      v.object({
        slug: v.string(),
        name: v.string(),
        price: v.number(),
        size: v.string(),
        quantity: v.number(),
      }),
    ),
    total: v.number(),
    discount: v.number(),
    currency: v.literal("eur"),
    status: v.union(v.literal("paid"), v.literal("failed")),
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
  }).index("by_session", ["stripeSessionId"]),

  messages: defineTable({
    name: v.string(),
    email: v.string(),
    message: v.string(),
  }),

  coupons: defineTable({
    code: v.string(),
    type: v.union(v.literal("percent"), v.literal("fixed")),
    value: v.number(),
    minOrder: v.optional(v.number()),
    maxUses: v.optional(v.number()),
    usedCount: v.number(),
    active: v.boolean(),
    expiresAt: v.optional(v.number()),
  }).index("by_code", ["code"]),
});
