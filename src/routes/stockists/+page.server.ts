import { STOCKISTS } from "$lib/data/stockists";
import type { PageServerLoad } from "./$types";

export const prerender = true;

export const load: PageServerLoad = () => {
  return { stockists: STOCKISTS };
};
