import { describe, expect, it } from "vitest";

import { splitCentsEvenly } from "@/features/split/domain/rounding";

describe("splitCentsEvenly", () => {
  it("should split exact values evenly", () => {
    expect(splitCentsEvenly(6000, 3)).toEqual([2000, 2000, 2000]);
  });

  it("should distribute remainder correctly", () => {
    expect(splitCentsEvenly(5000, 3)).toEqual([1667, 1667, 1666]);
  });

  it("should handle one cent remainder", () => {
    expect(splitCentsEvenly(100, 3)).toEqual([34, 33, 33]);
  });

  it("sum must equal original total", () => {
    const result = splitCentsEvenly(9999, 7);

    const total = result.reduce((acc, value) => acc + value, 0);

    expect(total).toBe(9999);
  });
});
