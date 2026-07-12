import { v } from "convex/values";
import { mutation } from "./_generated/server";

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
