import { getStockists } from "$lib/utils/convex";
import type { PageServerLoad } from "./$types";

export const prerender = true;

export const load: PageServerLoad = async () => {
  const stockists = await getStockists();
  return { stockists };
};
