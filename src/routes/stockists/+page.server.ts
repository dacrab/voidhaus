import type { PageServerLoad } from './$types';
import { getStockists } from '$lib/utils/convex';

export const prerender = true;

export const load: PageServerLoad = async () => {
  const stockists = await getStockists();
  return { stockists };
};