import { CATEGORIES, PRODUCTS } from "$lib/data/products";
import type { PageServerLoad } from "./$types";

export const prerender = true;

export const load: PageServerLoad = () => {
  return { products: PRODUCTS, categories: CATEGORIES };
};
