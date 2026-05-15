import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { internal } from "./_generated/api";

export const list = query({
  args: { category: v.optional(v.string()), activeOnly: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const products =
      args.activeOnly === false
        ? await ctx.db.query("products").collect()
        : await ctx.db
            .query("products")
            .withIndex("by_active", (q) => q.eq("active", true))
            .collect();
    if (args.category && args.category !== "All") {
      return products.filter((p) => p.category === args.category);
    }
    return products;
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("products")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

export const create = mutation({
  args: {
    slug: v.string(),
    num: v.string(),
    name: v.string(),
    price: v.number(),
    category: v.string(),
    material: v.string(),
    origin: v.string(),
    desc: v.string(),
    sizes: v.array(v.string()),
    img: v.string(),
    img2: v.optional(v.string()),
    stock: v.number(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("products", { ...args, active: true });
    await ctx.scheduler.runAfter(0, internal.emails.triggerRebuild, {});
    return id;
  },
});

export const update = mutation({
  args: {
    id: v.id("products"),
    slug: v.optional(v.string()),
    num: v.optional(v.string()),
    name: v.optional(v.string()),
    price: v.optional(v.number()),
    category: v.optional(v.string()),
    material: v.optional(v.string()),
    origin: v.optional(v.string()),
    desc: v.optional(v.string()),
    sizes: v.optional(v.array(v.string())),
    img: v.optional(v.string()),
    img2: v.optional(v.string()),
    stock: v.optional(v.number()),
    active: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    const updates = Object.fromEntries(
      Object.entries(fields).filter(([, v]) => v !== undefined)
    );
    await ctx.db.patch(id, updates);
    // Trigger rebuild if anything other than stock changed
    const nonStockChange = Object.keys(updates).some((k) => k !== "stock");
    if (nonStockChange) {
      await ctx.scheduler.runAfter(0, internal.emails.triggerRebuild, {});
    }
  },
});

export const remove = mutation({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    await ctx.scheduler.runAfter(0, internal.emails.triggerRebuild, {});
  },
});
