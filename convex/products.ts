import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";

function totalStock(stock: Record<string, number>): number {
  return Object.values(stock).reduce((sum, n) => sum + n, 0);
}

// Runtime read required by the checkout endpoint (api/checkout) for live
// inventory/stock checks; the storefront catalog itself is served from the
// static $lib/data/products module so it is not prerender-dependent.
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const product = await ctx.db
      .query("products")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    if (!product) return null;
    // Resolve image URLs if stored in Convex
    let imgUrl: string | null = null;
    let img2Url: string | null = null;
    if (product.imgStorageId) {
      imgUrl = await ctx.storage.getUrl(product.imgStorageId);
    }
    if (product.img2StorageId) {
      img2Url = await ctx.storage.getUrl(product.img2StorageId);
    }
    // sizeStock is retained for server-side inventory checks (checkout).
    const { stock, _creationTime, ...rest } = product;
    return { ...rest, imgUrl, img2Url };
  },
});

export const decrementSizeStock = internalMutation({
  args: { id: v.id("products"), size: v.string(), quantity: v.number() },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.id);
    if (!product) return;
    const sizeStock = { ...product.sizeStock };
    const current = sizeStock[args.size] ?? 0;
    sizeStock[args.size] = Math.max(0, current - args.quantity);
    const stock = totalStock(sizeStock);
    await ctx.db.patch(args.id, { sizeStock, stock });
  },
});
