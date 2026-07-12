import { v } from "convex/values";
import { PRODUCTS as SEED_PRODUCTS } from "../src/lib/data/products";
import { internal } from "./_generated/api";
import { mutation } from "./_generated/server";

const PRODUCTS = SEED_PRODUCTS.map((p) => {
  const sizeStock: Record<string, number> = {};
  for (const size of p.sizes) {
    sizeStock[size] = Math.max(1, Math.round(10 / p.sizes.length));
  }
  const stock = Object.values(sizeStock).reduce((a, b) => a + b, 0);
  return { ...p, stock, sizeStock, active: true };
});

export const seed = mutation({
  args: { force: v.optional(v.boolean()) },
  handler: async (ctx, { force }) => {
    const existing = await ctx.db.query("products").first();
    if (existing && !force) return "Already seeded";
    if (force) {
      const all = await ctx.db.query("products").collect();
      for (const p of all) await ctx.db.delete(p._id);
    }
    for (const p of PRODUCTS) {
      await ctx.db.insert("products", { ...p, active: true });
    }
    await ctx.scheduler.runAfter(0, internal.emails.triggerRebuild, {});
    return `Seeded ${PRODUCTS.length} products`;
  },
});
