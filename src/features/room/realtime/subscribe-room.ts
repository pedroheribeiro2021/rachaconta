import { supabase } from "@/lib/supabase/client";

export function subscribeRoom(
  roomId: string,
  onChange: () => void,
) {
  const channel = supabase.channel(`room-${roomId}`);

  channel

    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "participants",
      },
      onChange,
    )

    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "items",
      },
      onChange,
    )

    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "item_consumers",
      },
      onChange,
    )

    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}