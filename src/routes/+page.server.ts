import { PRODUCTS } from "$lib/data/products";
import { SITE } from "$lib/data/site";
import type { PageServerLoad } from "./$types";

export const prerender = true;

export const load: PageServerLoad = () => {
  return { products: PRODUCTS, site: SITE };
};
