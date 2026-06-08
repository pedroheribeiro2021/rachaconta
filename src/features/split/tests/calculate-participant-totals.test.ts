import { describe, expect, it } from "vitest";

import { calculateParticipantTotals } from "../domain/calculate-participant-totals";

describe("calculateParticipantTotals", () => {
  it("should split item correctly", () => {
    const result = calculateParticipantTotals({
      participants: [
        {
          id: "p1",
          nickname: "Pedro",
        },
        {
          id: "p2",
          nickname: "João",
        },
      ],
      items: [
        {
          id: "i1",
          price_cents: 5000,
        },
      ],
      itemConsumers: [
        {
          item_id: "i1",
          participant_id: "p1",
        },
        {
          item_id: "i1",
          participant_id: "p2",
        },
      ],
      serviceFeePercent: 10,
    });

    expect(result[0].totalCents).toBe(2750);

    expect(result[1].totalCents).toBe(2750);
  });
});
