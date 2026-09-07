import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  products: defineTable({
    slug: v.string(),
    num: v.string(),
    name: v.string(),
    price: v.number(),
    category: v.string(),
    material: v.string(),
    origin: v.string(),
    desc: v.string(),
    sizes: v.array(v.string()),
    // Per-size stock: { "S": 5, "M": 10, "L": 3 }
    sizeStock: v.optional(v.record(v.string(), v.number())),
    // Image references: either a key (legacy) or a Convex storage ID
    img: v.string(),
    img2: v.optional(v.string()),
    active: v.boolean(),
  }).index("by_slug", ["slug"]),

  orders: defineTable({
    stripeSessionId: v.string(),
    stripePaymentIntentId: v.optional(v.string()),
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
    discount: v.optional(v.number()),
    currency: v.string(),
    status: v.union(v.literal("pending"), v.literal("paid"), v.literal("failed")),
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
    subject: v.string(),
    message: v.string(),
    read: v.boolean(),
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
