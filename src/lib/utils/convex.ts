import { IMAGES } from "$lib/data/images";
import type { Product } from "$lib/data/products";
import { CATEGORIES, PRODUCTS, SHARED_DETAILS } from "$lib/data/products";
import type { Region } from "$lib/data/stockists";
import { STOCKISTS } from "$lib/data/stockists";

export function getProducts(): Product[] {
  return PRODUCTS;
}

export function getImages(): Record<string, string> {
  return IMAGES;
}

export function getStockists(): Region[] {
  return STOCKISTS;
}

export { CATEGORIES, SHARED_DETAILS };
