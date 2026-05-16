import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";

export type Category = 'Outerwear' | 'Tailoring' | 'Ready-to-wear' | 'Knitwear' | 'Tops' | 'Footwear' | 'Accessories';

export type Product = {
  slug: string;
  num: string;
  name: string;
  price: number;
  category: string;
  material: string;
  origin: string;
  desc: string;
  sizes: string[];
  img: string;
  img2?: string;
  stock: number;
  sizeStock?: Record<string, number>;
};

// Fetch products from Convex at build time
const convexUrl = import.meta.env.CONVEX_URL || import.meta.env.PUBLIC_CONVEX_URL || "";
let _products: Product[] | null = null;

export async function getProducts(): Promise<Product[]> {
  if (_products) return _products;
  if (!convexUrl) {
    console.warn("CONVEX_URL not set, returning empty products");
    return [];
  }
  const client = new ConvexHttpClient(convexUrl);
  const raw = await client.query(api.products.list, {});
  _products = raw.map((p) => ({
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
  return _products;
}

export function formatProductPrice(price: number): string {
  return price.toLocaleString('en-US');
}

export const SHARED_DETAILS: [string, string][] = [
  ['Construction', 'Hand-finished seams'],
  ['Care',         'Dry clean only'],
  ['Delivery',     '5–10 business days'],
];

export const CATEGORIES = [
  'All',
  'Outerwear',
  'Tailoring',
  'Ready-to-wear',
  'Knitwear',
  'Tops',
  'Footwear',
  'Accessories',
] as const;
