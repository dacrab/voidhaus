import { v } from "convex/values";
import { query, mutation, action } from "./_generated/server";

// Simple hash function (in production use bcrypt via an action)
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  // Add salt-like prefix for basic security
  return `vh_${Math.abs(hash).toString(36)}_${str.length}`;
}

function generateToken(): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let token = "";
  for (let i = 0; i < 64; i++) {
    token += chars[Math.floor(Math.random() * chars.length)];
  }
  return token;
}

export const login = mutation({
  args: { email: v.string(), password: v.string() },
  handler: async (ctx, args) => {
    const admin = await ctx.db
      .query("admins")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    if (!admin) return { error: "Invalid credentials" };

    const hash = simpleHash(args.password);
    if (hash !== admin.passwordHash) return { error: "Invalid credentials" };

    // Create session (7 days)
    const token = generateToken();
    await ctx.db.insert("adminSessions", {
      adminId: admin._id,
      token,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    });

    return { token, name: admin.name };
  },
});

export const validateSession = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("adminSessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();
    if (!session) return null;
    if (Date.now() > session.expiresAt) return null;
    const admin = await ctx.db.get(session.adminId);
    if (!admin) return null;
    return { email: admin.email, name: admin.name };
  },
});

export const logout = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("adminSessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();
    if (session) await ctx.db.delete(session._id);
  },
});

// Create initial admin (run once via CLI)
export const createAdmin = mutation({
  args: { email: v.string(), password: v.string(), name: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("admins")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    if (existing) return "Admin already exists";
    await ctx.db.insert("admins", {
      email: args.email,
      passwordHash: simpleHash(args.password),
      name: args.name,
    });
    return "Admin created";
  },
});
