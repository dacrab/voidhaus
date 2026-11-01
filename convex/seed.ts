import { ConvexError, v } from "convex/values";
import { PRODUCTS } from "../src/lib/data/products";
import { mutation } from "./_generated/server";

// The canonical catalog (names, prices, sizes, images) lives in
// src/lib/data/products.ts. This seed mirrors only `slug` and `sizeStock` into
// Convex for checkout/fulfillment. Re-run it when products are added or removed.

function requireAdmin(token: string): void {
  const expected = process.env.ADMIN_TOKEN;
  if (!(expected && token) || token !== expected) {
    throw new ConvexError("Unauthorized");
  }
}

const SEED_STOCK = PRODUCTS.map((product) => {
  const sizeStock: Record<string, number> = {};
  for (const size of product.sizes) {
    sizeStock[size] = Math.max(1, Math.round(10 / product.sizes.length));
  }
  return { slug: product.slug, sizeStock };
});

export const seedStock = mutation({
  args: { token: v.string(), reseed: v.optional(v.boolean()) },
  handler: async (ctx, { token, reseed }) => {
    requireAdmin(token);

    const existing = await ctx.db.query("products").first();
    if (existing && !reseed) return "Already seeded";

    for (const product of await ctx.db.query("products").collect()) {
      await ctx.db.delete(product._id);
    }

    for (const product of SEED_STOCK) {
      await ctx.db.insert("products", product);
    }

    return `Seeded ${SEED_STOCK.length} products`;
  },
});
