import { defineCollection, z } from "astro:content";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const products = defineCollection({
  loader: async () => {
    const url = import.meta.env.CONVEX_URL || import.meta.env.PUBLIC_CONVEX_URL;
    if (!url) throw new Error("CONVEX_URL not set");
    const client = new ConvexHttpClient(url);
    const data = await client.query(api.products.list, {});
    return data.map((p) => ({
      id: p.slug,
      slug: p.slug,
      num: p.num,
      name: p.name,
      price: p.price,
      category: p.category,
      material: p.material,
      origin: p.origin,
      desc: p.desc,
      sizes: p.sizes,
      img: p.img,
      img2: p.img2 ?? undefined,
      stock: p.stock,
      sizeStock: p.sizeStock ?? undefined,
    }));
  },
  schema: z.object({
    slug: z.string(),
    num: z.string(),
    name: z.string(),
    price: z.number(),
    category: z.string(),
    material: z.string(),
    origin: z.string(),
    desc: z.string(),
    sizes: z.array(z.string()),
    img: z.string(),
    img2: z.string().optional(),
    stock: z.number(),
    sizeStock: z.record(z.string(), z.number()).optional(),
  }),
});

export const collections = { products };
