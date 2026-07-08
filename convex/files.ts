import { v } from "convex/values";
import { api } from "./_generated/api";
import { mutation, query } from "./_generated/server";

export const generateUploadUrl = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const valid = await ctx.runQuery(api.auth.validateSession, { token: args.token });
    if (!valid) throw new Error("Unauthorized");
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
    const valid = await ctx.runQuery(api.auth.validateSession, { token: args.token });
    if (!valid) throw new Error("Unauthorized");
    await ctx.storage.delete(args.storageId);
  },
});
