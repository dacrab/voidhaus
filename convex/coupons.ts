import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const validate = query({
  args: { code: v.string(), orderTotal: v.number() },
  handler: async (ctx, args) => {
    const coupon = await ctx.db
      .query("coupons")
      .withIndex("by_code", (q) => q.eq("code", args.code.toUpperCase()))
      .first();
    if (!coupon) return { valid: false, error: "Invalid code" };
    if (!coupon.active) return { valid: false, error: "Code expired" };
    if (coupon.expiresAt && Date.now() > coupon.expiresAt) return { valid: false, error: "Code expired" };
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) return { valid: false, error: "Code fully redeemed" };
    if (coupon.minOrder && args.orderTotal < coupon.minOrder)
      return { valid: false, error: `Minimum order €${coupon.minOrder}` };

    const discount = coupon.type === "percent" ? Math.round(args.orderTotal * (coupon.value / 100)) : coupon.value;

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
