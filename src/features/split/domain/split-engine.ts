import { splitCentsEvenly } from "./rounding";

import { applyServiceFee } from "./service-fee";

interface ItemInput {
  priceCents: number;

  consumers: string[];
}

export function calculateParticipantTotals(
  items: ItemInput[],
  serviceFeePercent: number,
): Record<string, number> {
  const subtotals: Record<string, number> = {};

  for (const item of items) {
    if (item.consumers.length === 0) {
      continue;
    }

    const splitValues = splitCentsEvenly(
      item.priceCents,
      item.consumers.length,
    );

    item.consumers.forEach((participantId, index) => {
      subtotals[participantId] ??= 0;

      subtotals[participantId] += splitValues[index];
    });
  }

  const totals: Record<string, number> = {};

  Object.entries(subtotals).forEach(([participantId, subtotal]) => {
    totals[participantId] = applyServiceFee(subtotal, serviceFeePercent);
  });

  return totals;
}
