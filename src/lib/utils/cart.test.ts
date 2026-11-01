import { describe, expect, it } from "vitest";
import { CART_STORAGE_KEY, type CartItem, cartItemKey, readCart, writeCart } from "./cart";

function memoryStorage(initial?: string) {
  const store = new Map<string, string>();
  if (initial !== undefined) store.set(CART_STORAGE_KEY, initial);
  return {
    get length() {
      return store.size;
    },
    clear: () => store.clear(),
    getItem: (key: string) => store.get(key) ?? null,
    key: (index: number) => [...store.keys()][index] ?? null,
    removeItem: (key: string) => store.delete(key),
    setItem: (key: string, value: string) => store.set(key, value),
  } satisfies Storage;
}

const item: CartItem = {
  slug: "obsidian-coat",
  name: "Obsidian Coat",
  price: 3800,
  size: "M",
  img: "/img/1-primary.jpg",
  num: "001",
};

describe("cart storage", () => {
  it("returns an empty cart when storage is empty", () => {
    expect(readCart(memoryStorage())).toEqual([]);
  });

  it("falls back to an empty cart on corrupted JSON", () => {
    expect(readCart(memoryStorage("{not valid json"))).toEqual([]);
  });

  it("falls back to an empty cart on invalid item shapes", () => {
    expect(readCart(memoryStorage(JSON.stringify([{ slug: "x" }])))).toEqual([]);
  });

  it("round-trips items", () => {
    const storage = memoryStorage();
    writeCart([item], storage);
    expect(readCart(storage)).toEqual([item]);
  });

  it("does nothing without storage", () => {
    expect(readCart(undefined)).toEqual([]);
    expect(() => writeCart([item], undefined)).not.toThrow();
  });
});

describe("cartItemKey", () => {
  it("distinguishes the same product in different sizes", () => {
    expect(cartItemKey({ slug: "coat", size: "M" })).not.toBe(cartItemKey({ slug: "coat", size: "L" }));
  });
});
