import { error } from "@sveltejs/kit";
import { getProduct, PRODUCTS } from "#lib/data/products.js";
import type { EntryGenerator, PageLoad } from "./$types";

export const entries: EntryGenerator = () => PRODUCTS.map((product) => ({ slug: product.slug }));

export const load: PageLoad = ({ params }) => {
  const product = getProduct(params.slug);
  if (!product) error(404, "Product not found");
  return { product };
};
