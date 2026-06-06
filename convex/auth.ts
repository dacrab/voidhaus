import { v } from "convex/values";
import { query, action, internalQuery, internalMutation, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";

function generateToken(): string {
  return crypto.randomBytes(48).toString("hex");
}

export const login = action({
  args: { email: v.string(), password: v.string() },
  handler: async (ctx, args): Promise<{ error?: string; token?: string; name?: string }> => {
    const admin = await ctx.runQuery(internal.auth.getAdminByEmail, { email: args.email });
    if (!admin) return { error: "Invalid credentials" };

    const valid = await bcrypt.compare(args.password, admin.passwordHash);
    if (!valid) return { error: "Invalid credentials" };

    const token = generateToken();
    await ctx.runMutation(internal.auth.createSession, { adminId: admin._id, token });
    return { token, name: admin.name };
  },
});

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

// Internal only — run via CLI: bunx convex run auth:createAdmin '{...}'
export const createAdmin = internalAction({
  args: { email: v.string(), password: v.string(), name: v.string() },
  handler: async (ctx, args): Promise<string> => {
    const existing = await ctx.runQuery(internal.auth.getAdminByEmail, { email: args.email });
    const passwordHash = await bcrypt.hash(args.password, 12);
    if (existing) {
      await ctx.runMutation(internal.auth.updateAdminHash, { id: existing._id, passwordHash });
      return "Admin password updated";
    }
    await ctx.runMutation(internal.auth.insertAdmin, { email: args.email, passwordHash, name: args.name });
    return "Admin created";
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
