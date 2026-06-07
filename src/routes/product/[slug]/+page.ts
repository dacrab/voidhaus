import type { PageLoad } from './$types';
import { getProducts, SHARED_DETAILS, IMAGES } from '$lib/utils/convex';
import { error } from '@sveltejs/kit';

export const prerender = true;

export const load: PageLoad = async ({ params }) => {
  const products = await getProducts();
  const product = products.find((p: any) => p.slug === params.slug);
  if (!product) throw error(404, 'Product not found');
  return { product, allProducts: products, sharedDetails: SHARED_DETAILS, images: IMAGES };
};