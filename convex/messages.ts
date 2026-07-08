import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// TODO: used by admin UI
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("messages").order("desc").collect();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    subject: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("messages", { ...args, read: false });
  },
});

// TODO: used by admin UI
export const markRead = mutation({
  args: { id: v.id("messages") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { read: true });
  },
});
