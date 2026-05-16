import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Upload URL generation — still public mutation but validates session token
export const generateUploadUrl = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db.query("adminSessions").withIndex("by_token", (q) => q.eq("token", args.token)).first();
    if (!session || Date.now() > session.expiresAt) throw new Error("Unauthorized");
    return await ctx.storage.generateUploadUrl();
  },
});

export const getUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

export const remove = mutation({
  args: { token: v.string(), storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    const session = await ctx.db.query("adminSessions").withIndex("by_token", (q) => q.eq("token", args.token)).first();
    if (!session || Date.now() > session.expiresAt) throw new Error("Unauthorized");
    await ctx.storage.delete(args.storageId);
  },
});
