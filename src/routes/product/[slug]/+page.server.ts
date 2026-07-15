import { error } from "@sveltejs/kit";
import { IMAGES } from "$lib/data/images";
import { PRODUCTS, SHARED_DETAILS } from "$lib/data/products";
import type { PageServerLoad } from "./$types";

export const prerender = true;

export const load: PageServerLoad = ({ params }) => {
  const product = PRODUCTS.find((p) => p.slug === params.slug);
  if (!product) throw error(404, "Product not found");
  return { product, allProducts: PRODUCTS, sharedDetails: SHARED_DETAILS, images: IMAGES };
};
