import { z } from "zod";

export const CART_STORAGE_KEY = "vh-cart";

const CartItemSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  price: z.number().nonnegative(),
  size: z.string().min(1),
  img: z.string().min(1),
  num: z.string().min(1),
});

export type CartItem = z.infer<typeof CartItemSchema>;

const CartItemsSchema = z.array(CartItemSchema);

export function cartItemKey(item: Pick<CartItem, "slug" | "size">): string {
  return `${item.slug}\u0000${item.size}`;
}

function defaultStorage(): Storage | undefined {
  return typeof localStorage === "undefined" ? undefined : localStorage;
}

export function readCart(storage: Storage | undefined = defaultStorage()): CartItem[] {
  if (!storage) return [];
  try {
    const parsed = CartItemsSchema.safeParse(JSON.parse(storage.getItem(CART_STORAGE_KEY) ?? "[]"));
    return parsed.success ? parsed.data : [];
  } catch {
    return [];
  }
}

export function writeCart(items: readonly CartItem[], storage: Storage | undefined = defaultStorage()): void {
  storage?.setItem(CART_STORAGE_KEY, JSON.stringify(items));
}
