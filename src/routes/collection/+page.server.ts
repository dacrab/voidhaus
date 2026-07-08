import { CATEGORIES, getProducts } from "$lib/utils/convex";
import type { PageServerLoad } from "./$types";

export const prerender = true;

export const load: PageServerLoad = async () => {
  const products = await getProducts();
  return { products, categories: CATEGORIES };
};
