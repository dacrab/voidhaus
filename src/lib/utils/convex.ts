import { ConvexHttpClient } from "convex/browser";
import { api } from "$convex/api";
import { CONVEX_URL } from "$env/static/private";
import type { Product } from "$lib/data/products";
import type { Region } from "$lib/data/stockists";

let _client: ConvexHttpClient | null = null;

function getClient(): ConvexHttpClient {
  if (_client) return _client;
  _client = new ConvexHttpClient(CONVEX_URL);
  return _client;
}

export async function getProducts(): Promise<Product[]> {
  const client = getClient();
  const products = await client.query(api.products.list, { activeOnly: true });
  return products as Product[];
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const client = getClient();
  return await client.query(api.products.getBySlug, { slug });
}

export async function getImages(): Promise<Record<string, string>> {
  const client = getClient();
  return await client.query(api.images.list);
}

export async function getStockists(): Promise<Region[]> {
  const client = getClient();
  const stockists = await client.query(api.stockists.list, {});
  return stockists as Region[];
}

export { CATEGORIES, SHARED_DETAILS } from "$lib/data/products";
