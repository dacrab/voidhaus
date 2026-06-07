import type { PageServerLoad } from './$types';
import { getProducts, CATEGORIES } from '$lib/utils/convex';

export const prerender = true;

export const load: PageServerLoad = async () => {
  const products = await getProducts();
  return { products, categories: CATEGORIES };
};