import { v } from "convex/values";
import { mutation } from "./_generated/server";

import { PRODUCTS as SEED_PRODUCTS } from "../src/lib/data/products";

const PRODUCTS = SEED_PRODUCTS.map((p) => {
  const stock = 10;
  const sizeStock: Record<string, number> = {};
  for (const size of p.sizes) {
    sizeStock[size] = Math.max(1, Math.round(stock / p.sizes.length));
  }
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
      await ctx.db.insert("products", { ...p, sizeStock: p.sizeStock as unknown as Record<string, number>, active: true });
    }
    return `Seeded ${PRODUCTS.length} products`;
  },
});


