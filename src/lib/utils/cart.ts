import { z } from "zod";

export const CART_KEY = "vh-cart";

export const CartItemSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  price: z.number().min(0),
  size: z.string().min(1),
  img: z.string().min(1),
  num: z.string().min(1),
});

export type CartItem = z.infer<typeof CartItemSchema>;

const CartItemArraySchema = z.array(CartItemSchema);

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = JSON.parse(localStorage.getItem(CART_KEY) ?? "[]");
    const result = CartItemArraySchema.safeParse(raw);
    return result.success ? result.data : [];
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("vh:cart-updated"));
}

export function formatPrice(num: number): string {
  return num.toLocaleString("en-US", { minimumFractionDigits: 0 });
}
