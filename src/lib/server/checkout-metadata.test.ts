import { describe, expect, it } from "vitest";
import { PRODUCTS, requireProduct } from "../data/products";
import type { CheckoutOrderItem } from "../utils/schemas";
import { decodeOrderItems, encodeOrderItems, STRIPE_METADATA_MAX } from "./checkout-metadata";

describe("checkout metadata", () => {
  it("round-trips order items", () => {
    const product = requireProduct("obsidian-coat");
    const item: CheckoutOrderItem = {
      slug: product.slug,
      name: product.name,
      price: product.price,
      size: "M",
      quantity: 2,
    };

    expect(decodeOrderItems(encodeOrderItems([item]))).toEqual([item]);
  });

  it("fits the full catalog inside Stripe's metadata cap", () => {
    const items: CheckoutOrderItem[] = PRODUCTS.map((product) => ({
      slug: product.slug,
      name: product.name,
      price: product.price,
      size: product.sizes[0],
      quantity: 1,
    }));

    expect(encodeOrderItems(items).length).toBeLessThanOrEqual(STRIPE_METADATA_MAX);
  });

  it("rejects products that are not in the catalog", () => {
    expect(() => decodeOrderItems(JSON.stringify([["missing", "M", 1, 100]]))).toThrow("Unknown product");
  });
});
