import { afterEach, describe, expect, it, vi } from "vitest";
import { type CartItem, formatPrice, getCart, saveCart } from "./cart";

function mockBrowserStorage() {
  const store = new Map<string, string>();
  const listeners: Array<(e: Event) => void> = [];
  vi.stubGlobal("localStorage", {
    get length() {
      return store.size;
    },
    clear: () => store.clear(),
    getItem: (k: string) => store.get(k) ?? null,
    key: (i: number) => [...store.keys()][i] ?? null,
    removeItem: (k: string) => store.delete(k),
    setItem: (k: string, v: string) => store.set(k, v),
  });
  vi.stubGlobal("window", {
    addEventListener: (_t: string, l: (e: Event) => void) => {
      listeners.push(l);
    },
    dispatchEvent: (e: Event) => {
      listeners.forEach((l) => {
        l(e);
      });
      return true;
    },
  });
  return store;
}

afterEach(() => vi.unstubAllGlobals());

describe("formatPrice", () => {
  it.each([
    [0, "0"],
    [1400, "1,400"],
    [1234, "1,234"],
    [4100, "4,100"],
  ])("formats %i as %s", (n, expected) => {
    expect(formatPrice(n)).toBe(expected);
  });
});

describe("cart persistence", () => {
  it("returns an empty cart when storage is empty", () => {
    mockBrowserStorage();
    expect(getCart()).toEqual([]);
  });

  it("falls back to an empty cart on corrupted JSON", () => {
    const store = mockBrowserStorage();
    store.set("vh-cart", "{not valid json");
    expect(getCart()).toEqual([]);
  });

  it("round-trips saved items", () => {
    mockBrowserStorage();
    const item: CartItem = { slug: "x", name: "X", price: 10, size: "M", img: "i", num: "1" };
    saveCart([item]);
    expect(getCart()).toEqual([item]);
  });
});
