import { describe, expect, it } from "vitest";
import { CATEGORIES, PRODUCTS, SHARED_DETAILS } from "./products";

describe("product catalog", () => {
  it("has unique, non-empty slugs", () => {
    const slugs = PRODUCTS.map((p) => p.slug);
    expect(slugs.every((s) => s.length > 0)).toBe(true);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("keeps every product within the known categories", () => {
    for (const p of PRODUCTS) {
      expect(CATEGORIES).toContain(p.category);
    }
  });

  it("has valid pricing and a non-empty size run", () => {
    for (const p of PRODUCTS) {
      expect(p.price).toBeGreaterThan(0);
      expect(Array.isArray(p.sizes)).toBe(true);
      expect(p.sizes.length).toBeGreaterThan(0);
    }
  });

  it("has a primary image for each product", () => {
    for (const p of PRODUCTS) {
      expect(p.img.length).toBeGreaterThan(0);
      expect(p.name.length).toBeGreaterThan(0);
    }
  });

  it("exposes shared detail rows as label/value pairs", () => {
    expect(SHARED_DETAILS.length).toBeGreaterThan(0);
    for (const [label, value] of SHARED_DETAILS) {
      expect(label.length).toBeGreaterThan(0);
      expect(value.length).toBeGreaterThan(0);
    }
  });
});
