import { describe, expect, it } from "vitest";
import { applyDiscount, type PricedLine } from "./pricing";

const line = (price: number, quantity = 1): PricedLine => ({ price, quantity });

describe("applyDiscount", () => {
  it("leaves the order untouched without a discount", () => {
    const result = applyDiscount([line(100), line(250, 2)], null, null);
    expect(result.discount).toBe(0);
    expect(result.total).toBe(600);
    expect(result.items).toEqual([line(100), line(250, 2)]);
  });

  it("applies a percentage to every line proportionally", () => {
    const result = applyDiscount([line(1000), line(3000)], 10, null);
    expect(result.discount).toBe(400);
    expect(result.total).toBe(3600);
    expect(result.items.map((item) => item.price)).toEqual([900, 2700]);
  });

  it("allocates a fixed discount across lines", () => {
    const result = applyDiscount([line(1000), line(3000)], null, 400);
    expect(result.discount).toBe(400);
    expect(result.total).toBe(3600);
  });

  it("never discounts a line to zero", () => {
    const result = applyDiscount([line(1), line(1)], null, 100);
    expect(result.items.every((item) => item.price >= 1)).toBe(true);
    expect(result.discount).toBeLessThan(2);
  });

  it("caps a fixed discount at the subtotal", () => {
    const result = applyDiscount([line(100)], null, 500);
    expect(result.discount).toBeLessThan(100);
    expect(result.total).toBeGreaterThan(0);
  });

  it("keeps multi-quantity unit prices positive", () => {
    const result = applyDiscount([line(100, 3)], 50, null);
    expect(result.items[0]?.price).toBeGreaterThanOrEqual(1);
    expect(result.total).toBe(150);
  });
});
