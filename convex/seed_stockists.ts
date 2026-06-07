import { v } from "convex/values";
import { mutation } from "./_generated/server";

import { STOCKISTS } from "../src/lib/data/stockists";

export const seed = mutation({
  args: { force: v.optional(v.boolean()) },
  handler: async (ctx, { force }) => {
    const existing = await ctx.db.query("stockists").first();
    if (existing && !force) return "Already seeded";
    if (force) {
      const all = await ctx.db.query("stockists").collect();
      for (const s of all) await ctx.db.delete(s._id);
    }
    for (const r of STOCKISTS) {
      await ctx.db.insert("stockists", r);
    }
    return `Seeded ${STOCKISTS.length} regions`;
  },
});
