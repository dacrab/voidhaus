const KEY = 'vh-cart';

export type CartItem = {
  slug: string; name: string; price: string;
  size: string; img: string; num: string;
};

export function getCart(): CartItem[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]');
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]): void {
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event('vh:cart-updated'));
}

export function formatPrice(num: number): string {
  return num.toLocaleString('en-US', { minimumFractionDigits: 0 });
}
