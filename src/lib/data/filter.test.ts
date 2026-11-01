import { describe, expect, it } from "vitest";
import { filterProducts } from "./filter";
import { PRODUCTS } from "./products";

describe("filterProducts", () => {
  it("returns all products when category is All and search is empty", () => {
    const result = filterProducts(PRODUCTS, "", "All");
    expect(result).toHaveLength(PRODUCTS.length);
  });

  it("filters by category", () => {
    const result = filterProducts(PRODUCTS, "", "Outerwear");
    expect(result.every((p) => p.category === "Outerwear")).toBe(true);
  });

  it("filters by search term matching name", () => {
    const result = filterProducts(PRODUCTS, "coat", "All");
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((p) => p.name.toLowerCase().includes("coat"))).toBe(true);
  });

  it("filters by search term matching material", () => {
    const result = filterProducts(PRODUCTS, "cashmere", "All");
    expect(result.every((p) => p.material.toLowerCase().includes("cashmere"))).toBe(true);
  });

  it("combines category and search", () => {
    const result = filterProducts(PRODUCTS, "cashmere", "Outerwear");
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((p) => p.category === "Outerwear")).toBe(true);
    expect(result.every((p) => p.material.toLowerCase().includes("cashmere"))).toBe(true);
  });

  it("returns empty array when nothing matches", () => {
    const result = filterProducts(PRODUCTS, "zzzznotathingzzzz", "All");
    expect(result).toHaveLength(0);
  });

  it("trims leading/trailing whitespace from search", () => {
    const result = filterProducts(PRODUCTS, "  coat  ", "All");
    const direct = filterProducts(PRODUCTS, "coat", "All");
    expect(result).toEqual(direct);
  });
});
