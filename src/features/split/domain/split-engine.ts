import { splitCentsEvenly } from "./rounding";

interface ItemInput {
  priceCents: number;

  consumers: string[];
}

export function calculateParticipantTotals(
  items: ItemInput[],
): Record<string, number> {
  const totals: Record<string, number> = {};

  for (const item of items) {
    if (item.consumers.length === 0) {
      continue;
    }

    const splitValues = splitCentsEvenly(
      item.priceCents,
      item.consumers.length,
    );

    item.consumers.forEach((participantId, index) => {
      totals[participantId] ??= 0;

      totals[participantId] += splitValues[index];
    });
  }

  return totals;
}
