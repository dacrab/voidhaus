import type { GenericDatabaseWriter } from "convex/server";
import { ConvexError, v } from "convex/values";
import { PRODUCTS as SEED_PRODUCTS } from "../src/lib/data/products";
import { internal } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import { mutation } from "./_generated/server";

// SOURCE OF TRUTH: src/lib/data/products.ts is the canonical catalog (names, prices,
// sizes, images) and is what the storefront renders. This seed mirrors those products
// into Convex solely to track per-size stock (sizeStock) for checkout/fulfillment.
// If a product is added/removed/renamed in products.ts, re-run this seed so the stock
// table matches; the two copies are expected to stay in sync via this seed.

// Function-level gating: admin mutations require a token matching the ADMIN_TOKEN
// deployment env var (no identity provider exists in this app).
function requireAdmin(token?: string) {
  const expected = process.env.ADMIN_TOKEN;
  if (!(expected && token) || token !== expected) {
    throw new ConvexError("Unauthorized");
  }
}

type SeedTable = "products";

async function isEmpty(db: GenericDatabaseWriter<DataModel>, table: SeedTable) {
  return db
    .query(table)
    .first()
    .then((doc) => doc === null);
}

async function clearTable(db: GenericDatabaseWriter<DataModel>, table: SeedTable) {
  for (const doc of await db.query(table).collect()) {
    await db.delete(doc._id);
  }
}

const SEED_PRODUCTS_WITH_STOCK = SEED_PRODUCTS.map((p) => {
  const sizeStock: Record<string, number> = {};
  for (const size of p.sizes) {
    sizeStock[size] = Math.max(1, Math.round(10 / p.sizes.length));
  }
  return { ...p, sizeStock };
});

export const seedProducts = mutation({
  args: { force: v.optional(v.boolean()), token: v.string() },
  handler: async (ctx, { force, token }) => {
    requireAdmin(token);
    if (!((await isEmpty(ctx.db, "products")) || force)) return "Already seeded";
    await clearTable(ctx.db, "products");
    for (const p of SEED_PRODUCTS_WITH_STOCK) {
      await ctx.db.insert("products", { ...p, active: true });
    }
    await ctx.scheduler.runAfter(0, internal.emails.triggerRebuild, {});
    return `Seeded ${SEED_PRODUCTS_WITH_STOCK.length} products`;
  },
});
