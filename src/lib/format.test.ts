import { describe, expect, it } from "vitest";
import { formatPrice } from "./format";

describe("formatPrice", () => {
  it.each([
    [0, "0"],
    [1400, "1,400"],
    [1234, "1,234"],
    [4100, "4,100"],
  ])("formats %i as %s", (amount, expected) => {
    expect(formatPrice(amount)).toBe(expected);
  });
});
