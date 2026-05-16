import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("coupons").order("desc").collect();
  },
});

export const validate = query({
  args: { code: v.string(), orderTotal: v.number() },
  handler: async (ctx, args) => {
    const coupon = await ctx.db
      .query("coupons")
      .withIndex("by_code", (q) => q.eq("code", args.code.toUpperCase()))
      .first();
    if (!coupon) return { valid: false, error: "Invalid code" };
    if (!coupon.active) return { valid: false, error: "Code expired" };
    if (coupon.expiresAt && Date.now() > coupon.expiresAt)
      return { valid: false, error: "Code expired" };
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses)
      return { valid: false, error: "Code fully redeemed" };
    if (coupon.minOrder && args.orderTotal < coupon.minOrder)
      return { valid: false, error: `Minimum order €${coupon.minOrder}` };

    const discount =
      coupon.type === "percent"
        ? Math.round(args.orderTotal * (coupon.value / 100))
        : coupon.value;

    return { valid: true, discount, type: coupon.type, value: coupon.value, couponId: coupon._id };
  },
});

export const use = mutation({
  args: { id: v.id("coupons") },
  handler: async (ctx, args) => {
    const coupon = await ctx.db.get(args.id);
    if (!coupon) return;
    await ctx.db.patch(args.id, { usedCount: coupon.usedCount + 1 });
  },
});

export const create = mutation({
  args: {
    code: v.string(),
    type: v.string(),
    value: v.number(),
    minOrder: v.optional(v.number()),
    maxUses: v.optional(v.number()),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("coupons", {
      ...args,
      code: args.code.toUpperCase(),
      usedCount: 0,
      active: true,
    });
  },
});

export const deactivate = mutation({
  args: { id: v.id("coupons") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { active: false });
  },
});
