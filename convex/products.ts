import { v } from "convex/values";
import { query } from "./_generated/server";

// Runtime read required by the checkout endpoint for live inventory checks.
export const getStockBySlugs = query({
  args: { slugs: v.array(v.string()) },
  handler: async (ctx, args) => {
    const result: Record<string, Record<string, number>> = {};

    for (const slug of args.slugs) {
      const product = await ctx.db
        .query("products")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .first();
      if (product) result[slug] = product.sizeStock;
    }

    return result;
  },
});
