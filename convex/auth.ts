import { v } from "convex/values";
import { query, internalQuery, internalMutation } from "./_generated/server";

export const getAdminByEmail = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.query("admins").withIndex("by_email", (q) => q.eq("email", args.email)).first();
  },
});

export const createSession = internalMutation({
  args: { adminId: v.id("admins"), token: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.insert("adminSessions", {
      adminId: args.adminId,
      token: args.token,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    });
  },
});

export const validateSession = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db.query("adminSessions").withIndex("by_token", (q) => q.eq("token", args.token)).first();
    if (!session || Date.now() > session.expiresAt) return null;
    const admin = await ctx.db.get(session.adminId);
    if (!admin) return null;
    return { email: admin.email, name: admin.name };
  },
});

export const insertAdmin = internalMutation({
  args: { email: v.string(), passwordHash: v.string(), name: v.string() },
  handler: async (ctx, args) => { await ctx.db.insert("admins", args); },
});

export const updateAdminHash = internalMutation({
  args: { id: v.id("admins"), passwordHash: v.string() },
  handler: async (ctx, args) => { await ctx.db.patch(args.id, { passwordHash: args.passwordHash }); },
});
