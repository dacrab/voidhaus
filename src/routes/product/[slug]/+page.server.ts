import { error } from "@sveltejs/kit";
import { getImages, getProducts, SHARED_DETAILS } from "$lib/utils/convex";
import type { PageServerLoad } from "./$types";

export const prerender = true;

export const load: PageServerLoad = async ({ params }) => {
  const [products, images] = await Promise.all([getProducts(), getImages()]);
  const product = products.find((p) => p.slug === params.slug);
  if (!product) throw error(404, "Product not found");
  return { product, allProducts: products, sharedDetails: SHARED_DETAILS, images };
};
