import { supabase } from "@/lib/supabase/client";

export async function fetchRoomSnapshot(roomId: string) {
  const [roomResult, participantsResult, itemsResult, consumersResult] =
    await Promise.all([
      supabase.from("rooms").select("*").eq("id", roomId).single(),

      supabase.from("participants").select("*").eq("room_id", roomId),

      supabase.from("items").select("*").eq("room_id", roomId),

      supabase
        .from("item_consumers")
        .select("item_id, participant_id"),
    ]);

  if (roomResult.error) {
    throw roomResult.error;
  }

  if (participantsResult.error) {
    throw participantsResult.error;
  }

  if (itemsResult.error) {
    throw itemsResult.error;
  }

  if (consumersResult.error) {
    throw consumersResult.error;
  }

  return {
    room: roomResult.data,

    participants: participantsResult.data ?? [],

    items: itemsResult.data ?? [],

    itemConsumers: consumersResult.data ?? [],
  };
}