export const CART_KEY = "vh-cart";

export interface CartItem {
  slug: string;
  name: string;
  price: number;
  size: string;
  img: string;
  num: string;
}

export function isValidCartItem(v: unknown): v is CartItem {
  return (
    typeof v === "object" &&
    v !== null &&
    typeof (v as CartItem).slug === "string" &&
    typeof (v as CartItem).name === "string" &&
    typeof (v as CartItem).price === "number" &&
    (v as CartItem).price >= 0 &&
    typeof (v as CartItem).size === "string" &&
    typeof (v as CartItem).img === "string" &&
    typeof (v as CartItem).num === "string"
  );
}

function isValidCartItemArray(v: unknown): v is CartItem[] {
  return Array.isArray(v) && v.every(isValidCartItem);
}

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = JSON.parse(localStorage.getItem(CART_KEY) ?? "[]");
    return isValidCartItemArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("vh:cart-updated"));
}

export function formatPrice(num: number) {
  return num.toLocaleString("en-US", { minimumFractionDigits: 0 });
}
