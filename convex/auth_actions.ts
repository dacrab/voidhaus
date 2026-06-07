"use node";

import { v } from "convex/values";
import { action, internalAction } from "./_generated/server";
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
