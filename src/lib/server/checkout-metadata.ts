import { z } from "zod";
import { getProduct } from "#lib/data/products.js";
import type { CheckoutOrderItem } from "#lib/utils/schemas.js";

// Stripe caps each metadata value at 500 characters. Encoding items as
// [slug, size, quantity, unitPrice] keeps the whole catalog inside one value.
export const STRIPE_METADATA_MAX = 500;

const EncodedItemsSchema = z
  .array(z.tuple([z.string().min(1), z.string().min(1), z.number().int().positive(), z.number().int().nonnegative()]))
  .min(1);

export function encodeOrderItems(items: readonly CheckoutOrderItem[]): string {
  return JSON.stringify(items.map((item) => [item.slug, item.size, item.quantity, item.price]));
}

export function decodeOrderItems(raw: string): CheckoutOrderItem[] {
  return EncodedItemsSchema.parse(JSON.parse(raw)).map(([slug, size, quantity, price]) => {
    const product = getProduct(slug);
    if (!product) throw new Error(`Unknown product in checkout metadata: ${slug}`);
    return { slug, name: product.name, price, size, quantity };
  });
}
