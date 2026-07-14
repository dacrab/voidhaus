const KEY = "vh-cart";

export type CartItem = {
  slug: string;
  name: string;
  price: number;
  size: string;
  img: string;
  num: string;
};

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("vh:cart-updated"));
}

export function formatPrice(num: number): string {
  return num.toLocaleString("en-US", { minimumFractionDigits: 0 });
}
