import { expect, it } from "vitest";
import { calculateParticipantTotals } from "../domain/split-engine";

it("should apply service fee correctly", () => {
  const totals = calculateParticipantTotals(
    [
      {
        priceCents: 10000,
        consumers: ["a"],
      },
    ],
    10,
  );

  expect(totals.a).toBe(11000);
});
