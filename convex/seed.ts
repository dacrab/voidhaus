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
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("products").first();
    if (existing) return "Already seeded";
    for (const p of PRODUCTS) {
      await ctx.db.insert("products", { ...p, sizeStock: p.sizeStock as unknown as Record<string, number>, active: true });
    }
    return `Seeded ${PRODUCTS.length} products`;
  },
});


