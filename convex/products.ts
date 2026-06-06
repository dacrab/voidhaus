import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";

export const list = query({
  args: { category: v.optional(v.string()), activeOnly: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    if (args.category && args.category !== "All") {
      const products = await ctx.db
        .query("products")
        .withIndex("by_category", (q) => q.eq("category", args.category!))
        .collect();
      return args.activeOnly === false ? products : products.filter((p) => p.active);
    }
    return args.activeOnly === false
      ? await ctx.db.query("products").collect()
      : await ctx.db.query("products").withIndex("by_active", (q) => q.eq("active", true)).collect();
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const product = await ctx.db
      .query("products")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    if (!product) return null;
    // Resolve image URLs if stored in Convex
    let imgUrl: string | null = null;
    let img2Url: string | null = null;
    if (product.imgStorageId) {
      imgUrl = await ctx.storage.getUrl(product.imgStorageId);
    }
    if (product.img2StorageId) {
      img2Url = await ctx.storage.getUrl(product.img2StorageId);
    }
    return { ...product, imgUrl, img2Url };
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
    sizeStock: v.record(v.string(), v.number()),
    img: v.string(),
    img2: v.optional(v.string()),
    imgStorageId: v.optional(v.id("_storage")),
    img2StorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const stock = Object.values(args.sizeStock).reduce((s, n) => s + n, 0);
    const id = await ctx.db.insert("products", { ...args, stock, active: true });
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
    sizeStock: v.optional(v.record(v.string(), v.number())),
    img: v.optional(v.string()),
    img2: v.optional(v.string()),
    imgStorageId: v.optional(v.id("_storage")),
    img2StorageId: v.optional(v.id("_storage")),
    active: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    const updates: Record<string, any> = {};
    for (const [k, val] of Object.entries(fields)) {
      if (val !== undefined) updates[k] = val;
    }
    // Recompute total stock if sizeStock changed
    if (updates.sizeStock) {
      updates.stock = Object.values(updates.sizeStock as Record<string, number>).reduce(
        (s, n) => s + n,
        0
      );
    }
    await ctx.db.patch(id, updates);
    const nonStockChange = Object.keys(updates).some(
      (k) => k !== "stock" && k !== "sizeStock"
    );
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

export const decrementSizeStock = internalMutation({
  args: { id: v.id("products"), size: v.string(), quantity: v.number() },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.id);
    if (!product) return;
    const sizeStock = { ...product.sizeStock };
    const current = sizeStock[args.size] ?? 0;
    sizeStock[args.size] = Math.max(0, current - args.quantity);
    const stock = Object.values(sizeStock).reduce((s, n) => s + n, 0);
    await ctx.db.patch(args.id, { sizeStock, stock });
  },
});


