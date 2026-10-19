import { error } from "@sveltejs/kit";
import { PRODUCTS } from "#lib/data/products.js";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = ({ params }) => {
  const product = PRODUCTS.find((p) => p.slug === params.slug);
  if (!product) throw error(404, "Product not found");
  return { product };
};
