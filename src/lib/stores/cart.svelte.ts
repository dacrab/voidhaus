import { CART_STORAGE_KEY, type CartItem, cartItemKey, readCart, writeCart } from "#lib/utils/cart.js";
import { browser } from "$app/env";

class CartStore {
  items = $state<CartItem[]>([]);
  open = $state(false);
  #initialized = false;

  get count(): number {
    return this.items.length;
  }

  init(): void {
    if (!browser || this.#initialized) return;
    this.#initialized = true;
    this.items = readCart();
    window.addEventListener("storage", (event) => {
      if (event.key === CART_STORAGE_KEY) this.items = readCart();
    });
  }

  add(item: CartItem): void {
    if (this.items.some((existing) => cartItemKey(existing) === cartItemKey(item))) return;
    this.items = [...this.items, item];
    this.#persist();
  }

  remove(slug: string, size: string): void {
    this.items = this.items.filter((item) => !(item.slug === slug && item.size === size));
    this.#persist();
  }

  clear(): void {
    this.items = [];
    this.#persist();
  }

  openPanel(): void {
    this.open = true;
  }

  closePanel(): void {
    this.open = false;
  }

  #persist(): void {
    writeCart(this.items);
  }
}

export const cart = new CartStore();
