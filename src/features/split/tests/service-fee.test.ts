import { expect, it } from "vitest";

import { applyServiceFee } from "../domain/service-fee";

it("should apply service fee correctly", () => {
  expect(applyServiceFee(10000, 10)).toBe(11000);
});

it("should return the subtotal unchanged when fee is zero", () => {
  expect(applyServiceFee(1000, 0)).toBe(1000);
});
