import { splitCentsEvenly } from "./rounding";
import { applyServiceFee } from "./service-fee";

import { ParticipantTotal } from "../types/participant-total";

interface Participant {
  id: string;
  nickname: string;
}

interface Item {
  id: string;
  price_cents: number;
}

interface ItemConsumer {
  item_id: string;
  participant_id: string;
}

interface Input {
  participants: Participant[];
  items: Item[];
  itemConsumers: ItemConsumer[];
  serviceFeePercent: number;
}

export function calculateParticipantTotals(input: Input): ParticipantTotal[] {
  const subtotals = new Map<string, number>();

  for (const participant of input.participants) {
    subtotals.set(participant.id, 0);
  }

  for (const item of input.items) {
    const consumers = input.itemConsumers.filter(
      (consumer) => consumer.item_id === item.id,
    );

    if (consumers.length === 0) {
      continue;
    }

    const shares = splitCentsEvenly(item.price_cents, consumers.length);

    consumers.forEach((consumer, index) => {
      const current = subtotals.get(consumer.participant_id) ?? 0;

      subtotals.set(consumer.participant_id, current + shares[index]);
    });
  }

  return input.participants.map((participant) => {
    const subtotal = subtotals.get(participant.id) ?? 0;

    const total = applyServiceFee(subtotal, input.serviceFeePercent);

    return {
      participantId: participant.id,
      nickname: participant.nickname,
      subtotalCents: subtotal,
      serviceFeeCents: total - subtotal,
      totalCents: total,
    };
  });
}
