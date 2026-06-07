import type { PageServerLoad } from './$types';
import { getProducts } from '$lib/utils/convex';
import { SITE } from '$lib/data/site';

export const prerender = true;

export const load: PageServerLoad = async () => {
  const products = await getProducts();
  return { products, site: SITE };
};