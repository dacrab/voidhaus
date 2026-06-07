import type { PageServerLoad } from './$types';
import { getProducts, getImages, SHARED_DETAILS } from '$lib/utils/convex';
import { error } from '@sveltejs/kit';

export const prerender = true;

export const load: PageServerLoad = async ({ params }) => {
  const [products, images] = await Promise.all([getProducts(), getImages()]);
  const product = products.find((p: any) => p.slug === params.slug);
  if (!product) throw error(404, 'Product not found');
  return { product, allProducts: products, sharedDetails: SHARED_DETAILS, images };
};