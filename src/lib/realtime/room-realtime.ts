import { supabase } from "../supabase/client";

export function subscribeToRoom(roomId: string, onEvent: () => void) {
  return supabase

    .channel(`room:${roomId}`)

    .on(
      "postgres_changes",

      {
        event: "*",

        schema: "public",

        table: "items",

        filter: `room_id=eq.${roomId}`,
      },

      onEvent,
    )

    .on(
      "postgres_changes",

      {
        event: "*",

        schema: "public",

        table: "item_consumers",
      },

      onEvent,
    )

    .subscribe();
}
