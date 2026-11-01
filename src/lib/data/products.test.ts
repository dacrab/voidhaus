import { describe, expect, it } from "vitest";
import { CATEGORIES, getProduct, PRODUCT_DETAILS, PRODUCTS, requireProduct, SITE_IMAGES } from "./products";

describe("product catalog", () => {
  it("has unique, non-empty slugs", () => {
    const slugs = PRODUCTS.map((product) => product.slug);
    expect(slugs.every((slug) => slug.length > 0)).toBe(true);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("keeps every product within the known categories", () => {
    for (const product of PRODUCTS) {
      expect(CATEGORIES).toContain(product.category);
    }
  });

  it("has valid pricing, images, and a non-empty size run", () => {
    for (const product of PRODUCTS) {
      expect(product.price).toBeGreaterThan(0);
      expect(product.img.startsWith("/img/")).toBe(true);
      expect(product.sizes.length).toBeGreaterThan(0);
    }
  });

  it("resolves products by slug", () => {
    expect(getProduct("obsidian-coat")?.name).toBe("Obsidian Coat");
    expect(getProduct("missing")).toBeUndefined();
    expect(() => requireProduct("missing")).toThrow("Unknown product");
  });

  it("exposes shared detail rows as label/value pairs", () => {
    expect(PRODUCT_DETAILS.length).toBeGreaterThan(0);
    for (const [label, value] of PRODUCT_DETAILS) {
      expect(label.length).toBeGreaterThan(0);
      expect(value.length).toBeGreaterThan(0);
    }
  });

  it("keeps site images on local paths", () => {
    for (const path of Object.values(SITE_IMAGES)) {
      expect(path.startsWith("/img/")).toBe(true);
    }
  });
});
