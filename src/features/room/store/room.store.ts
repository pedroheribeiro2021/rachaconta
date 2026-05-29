import { create } from "zustand";

import type { Item } from "@/features/items/types/item.types";
import type { Participant } from "@/features/participants/types/participant.types";
import type { Room } from "@/features/room/types/room.types";

interface RoomState {
  room: Room | null;

  participants: Participant[];

  items: Item[];

  setRoom: (room: Room) => void;

  setParticipants: (participants: Participant[]) => void;

  setItems: (items: Item[]) => void;

  addItem: (item: Item) => void;

  toggleConsumer: (itemId: string, participantId: string) => void;
}

export const useRoomStore = create<RoomState>((set) => ({
  room: null,

  participants: [],

  items: [],

  setRoom: (room) => set({ room }),

  setParticipants: (participants) => set({ participants }),

  setItems: (items) => set({ items }),

  addItem: (item) =>
    set((state) => ({
      items: [...state.items, item],
    })),

  toggleConsumer: (itemId, participantId) =>
    set((state) => ({
      items: state.items.map((item) => {
        if (item.id !== itemId) {
          return item;
        }

        const alreadySelected = item.consumers.includes(participantId);

        return {
          ...item,

          consumers: alreadySelected
            ? item.consumers.filter((id) => id !== participantId)
            : [...item.consumers, participantId],
        };
      }),
    })),
}));
