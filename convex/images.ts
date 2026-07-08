import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const images = await ctx.db.query("images").collect();
    const map: Record<string, string> = {};
    for (const img of images) {
      map[img.key] = img.url;
    }
    return map;
  },
});

export const seed = mutation({
  args: { images: v.array(v.object({ key: v.string(), url: v.string() })) },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("images").first();
    if (existing) return "Already seeded";
    for (const img of args.images) {
      await ctx.db.insert("images", img);
    }
    return `Seeded ${args.images.length} images`;
  },
});
