import { ConvexHttpClient } from 'convex/browser';
import { api } from '$convex/api';
import { PRODUCTS, CATEGORIES, SHARED_DETAILS } from '$lib/data/products';
import { STOCKISTS } from '$lib/data/stockists';
import { IMAGES } from '$lib/data/images';
import type { Product } from '$lib/data/products';
import type { Region } from '$lib/data/stockists';

function getClient() {
  const url = import.meta.env.CONVEX_URL;
  if (!url) return null;
  return new ConvexHttpClient(url);
}

export async function getProducts(): Promise<Product[]> {
  const client = getClient();
  if (!client) return PRODUCTS;
  try {
    const products = await client.query(api.products.list, { activeOnly: true });
    return products.length ? (products as Product[]) : PRODUCTS;
  } catch {
    return PRODUCTS;
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const client = getClient();
  if (!client) return PRODUCTS.find(p => p.slug === slug) ?? null;
  try {
    return await client.query(api.products.getBySlug, { slug });
  } catch {
    return PRODUCTS.find(p => p.slug === slug) ?? null;
  }
}

export async function getImages(): Promise<Record<string, string> | null> {
  const client = getClient();
  if (!client) return null;
  try {
    return await client.query(api.images.list);
  } catch {
    return null;
  }
}

export async function getStockists(): Promise<Region[]> {
  const client = getClient();
  if (!client) return STOCKISTS;
  try {
    const stockists = await client.query(api.stockists.list, {});
    return stockists.length ? (stockists as Region[]) : STOCKISTS;
  } catch {
    return STOCKISTS;
  }
}

export { CATEGORIES, SHARED_DETAILS, PRODUCTS, STOCKISTS, IMAGES };