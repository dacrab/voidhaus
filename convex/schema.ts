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
    // Legacy total stock (computed from sizeStock)
    stock: v.number(),
    // Image references: either a key (legacy) or a Convex storage ID
    img: v.string(),
    img2: v.optional(v.string()),
    imgStorageId: v.optional(v.id("_storage")),
    img2StorageId: v.optional(v.id("_storage")),
    active: v.boolean(),
  })
    .index("by_slug", ["slug"])
    .index("by_category", ["category"])
    .index("by_active", ["active"]),

  orders: defineTable({
    stripeSessionId: v.string(),
    stripePaymentIntentId: v.optional(v.string()),
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
    status: v.string(),
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
  })
    .index("by_session", ["stripeSessionId"])
    .index("by_status", ["status"])
    .index("by_email", ["customerEmail"]),

  messages: defineTable({
    name: v.string(),
    email: v.string(),
    subject: v.string(),
    message: v.string(),
    read: v.boolean(),
  }).index("by_read", ["read"]),

  coupons: defineTable({
    code: v.string(),
    type: v.string(),
    value: v.number(),
    minOrder: v.optional(v.number()),
    maxUses: v.optional(v.number()),
    usedCount: v.number(),
    active: v.boolean(),
    expiresAt: v.optional(v.number()),
  })
    .index("by_code", ["code"])
    .index("by_active", ["active"]),

  // Admin users for Convex Auth
  admins: defineTable({
    email: v.string(),
    passwordHash: v.string(),
    name: v.string(),
  }).index("by_email", ["email"]),

  // Admin sessions
  adminSessions: defineTable({
    adminId: v.id("admins"),
    token: v.string(),
    expiresAt: v.number(),
  }).index("by_token", ["token"]),
});
