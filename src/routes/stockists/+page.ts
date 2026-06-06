import type { PageLoad } from './$types';
import { getStockists } from '$lib/utils/convex';

export const prerender = true;

export const load: PageLoad = async () => {
  const stockists = await getStockists();
  return { stockists };
};