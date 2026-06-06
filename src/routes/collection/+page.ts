import type { PageLoad } from './$types';
import { getProducts, CATEGORIES } from '$lib/utils/convex';

export const prerender = true;

export const load: PageLoad = async () => {
  const products = await getProducts();
  return { products, categories: CATEGORIES };
};