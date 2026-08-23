import { v } from "convex/values";
import { query } from "./_generated/server";

// Runtime read required by the checkout endpoint (api/checkout) for live
// inventory/stock checks; the storefront catalog itself is served from the
// static $lib/data/products module so it is not prerender-dependent.
export const getStockBySlugs = query({
  args: { slugs: v.array(v.string()) },
  handler: async (ctx, args) => {
    const result: Record<string, { id: string; slug: string; sizeStock: Record<string, number> }> = {};
    for (const slug of args.slugs) {
      const product = await ctx.db
        .query("products")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .first();
      if (!product) continue;
      result[slug] = { id: product._id, slug: product.slug, sizeStock: product.sizeStock ?? {} };
    }
    return result;
  },
});
