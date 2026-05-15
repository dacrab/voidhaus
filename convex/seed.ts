import { mutation } from "./_generated/server";

const PRODUCTS = [
  { slug: "obsidian-coat", num: "001", name: "Obsidian Coat", price: 3200, category: "Outerwear", material: "Virgin wool, silk lining", origin: "Milan, Italy", desc: "Cut from a single weight of virgin wool. Deep, structured, uncompromising.", sizes: ["XS", "S", "M", "L", "XL"], img: "coat-primary", img2: "coat-secondary", stock: 10, sizeStock: { "XS": 2, "S": 2, "M": 3, "L": 2, "XL": 1 } },
  { slug: "void-jacket", num: "002", name: "Void Jacket", price: 2100, category: "Outerwear", material: "Technical gabardine", origin: "Antwerp, Belgium", desc: "Sits on the body like a second skin. Every seam is a decision.", sizes: ["XS", "S", "M", "L"], img: "jacket-primary", img2: "jacket-secondary", stock: 8, sizeStock: { "XS": 2, "S": 2, "M": 2, "L": 2 } },
  { slug: "ash-trousers", num: "003", name: "Ash Trousers", price: 1400, category: "Tailoring", material: "Japanese cotton twill", origin: "Tokyo, Japan", desc: "High-rise, wide-leg. Cut with the discipline of tailoring and the ease of a garment worn for decades.", sizes: ["XS", "S", "M", "L", "XL"], img: "trousers-primary", img2: "trousers-secondary", stock: 12, sizeStock: { "XS": 2, "S": 3, "M": 3, "L": 2, "XL": 2 } },
  { slug: "shadow-dress", num: "004", name: "Shadow Dress", price: 2800, category: "Ready-to-wear", material: "Matte crepe, bias cut", origin: "Paris, France", desc: "Bias cut from matte crepe — falling along the body with absolute intention.", sizes: ["XS", "S", "M", "L"], img: "dress-primary", img2: "dress-secondary", stock: 6, sizeStock: { "XS": 1, "S": 2, "M": 2, "L": 1 } },
  { slug: "bone-shirt", num: "005", name: "Bone Shirt", price: 680, category: "Tops", material: "Egyptian cotton poplin", origin: "Cairo, Egypt", desc: "Off-white. Not white. Oversized collar, dropped shoulders, silence in every thread.", sizes: ["S", "M", "L", "XL"], img: "shirt-primary", img2: "shirt-secondary", stock: 15, sizeStock: { "S": 4, "M": 4, "L": 4, "XL": 3 } },
  { slug: "eclipse-boots", num: "006", name: "Eclipse Boots", price: 1900, category: "Footwear", material: "Full-grain calf leather", origin: "Florence, Italy", desc: "Hand-stitched in Florence. A silhouette that extends the leg.", sizes: ["39", "40", "41", "42", "43", "44"], img: "boots-primary", img2: "boots-secondary", stock: 10, sizeStock: { "39": 1, "40": 2, "41": 2, "42": 2, "43": 2, "44": 1 } },
  { slug: "void-belt", num: "007", name: "Void Belt", price: 420, category: "Accessories", material: "Vegetable-tanned leather", origin: "Florence, Italy", desc: "One strip. Matte hardware. Finishes an outfit the way a full stop finishes a sentence.", sizes: ["70", "75", "80", "85", "90"], img: "belt-primary", img2: "belt-secondary", stock: 20, sizeStock: { "70": 4, "75": 4, "80": 4, "85": 4, "90": 4 } },
  { slug: "cashmere-knit", num: "008", name: "Cashmere Knit", price: 1200, category: "Knitwear", material: "Grade A cashmere, 12-gauge", origin: "Edinburgh, Scotland", desc: "Spun from Grade A Mongolian cashmere at 12-gauge.", sizes: ["XS", "S", "M", "L", "XL"], img: "knit-primary", img2: "knit-secondary", stock: 10, sizeStock: { "XS": 2, "S": 2, "M": 2, "L": 2, "XL": 2 } },
  { slug: "wool-trousers", num: "009", name: "Wool Trousers", price: 1650, category: "Tailoring", material: "Merino wool, unlined", origin: "Milan, Italy", desc: "Straight leg, mid-rise. Unlined, it breathes. Pleated front.", sizes: ["XS", "S", "M", "L", "XL"], img: "wool-trousers-primary", img2: "wool-trousers-secondary", stock: 8, sizeStock: { "XS": 1, "S": 2, "M": 2, "L": 2, "XL": 1 } },
  { slug: "void-tote", num: "010", name: "Void Tote", price: 890, category: "Accessories", material: "Waxed cotton canvas, bridle leather", origin: "Florence, Italy", desc: "Carries everything you need. Nothing it doesn't.", sizes: ["One Size"], img: "tote-primary", img2: "tote-secondary", stock: 14, sizeStock: { "One Size": 14 } },
  { slug: "dark-layer-coat", num: "011", name: "Dark Layer Coat", price: 4100, category: "Outerwear", material: "Boiled wool, cashmere lining", origin: "Edinburgh, Scotland", desc: "The heaviest thing in the room. Boiled wool — cashmere lined.", sizes: ["XS", "S", "M", "L", "XL"], img: "dark-coat-primary", stock: 5, sizeStock: { "XS": 1, "S": 1, "M": 1, "L": 1, "XL": 1 } },
  { slug: "silk-slip", num: "012", name: "Silk Slip", price: 1100, category: "Ready-to-wear", material: "100% silk charmeuse", origin: "Lyon, France", desc: "Woven in Lyon from 100% silk charmeuse. Bias cut, midi length.", sizes: ["XS", "S", "M", "L"], img: "slip-primary", img2: "slip-secondary", stock: 9, sizeStock: { "XS": 2, "S": 3, "M": 2, "L": 2 } },
];

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("products").first();
    if (existing) return "Already seeded";
    for (const p of PRODUCTS) {
      await ctx.db.insert("products", { ...p, active: true } as any);
    }
    return `Seeded ${PRODUCTS.length} products`;
  },
});

// Migration: add sizeStock to existing products that don't have it
export const migrateSizeStock = mutation({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db.query("products").collect();
    let migrated = 0;
    for (const p of products) {
      if (!p.sizeStock) {
        // Distribute stock evenly across sizes
        const perSize = Math.max(1, Math.floor(p.stock / p.sizes.length));
        const sizeStock: Record<string, number> = {};
        let remaining = p.stock;
        for (const size of p.sizes) {
          const qty = Math.min(perSize, remaining);
          sizeStock[size] = qty;
          remaining -= qty;
        }
        // Give remainder to first size
        if (remaining > 0 && p.sizes.length > 0) {
          sizeStock[p.sizes[0]] += remaining;
        }
        await ctx.db.patch(p._id, { sizeStock });
        migrated++;
      }
    }
    return `Migrated ${migrated} products`;
  },
});
