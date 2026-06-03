import { supabase } from "@/lib/supabase/client";

export async function getParticipantsByRoom(roomId: string) {
  const { data, error } = await supabase
    .from("participants")
    .select("*")
    .eq("room_id", roomId)
    .order("created_at");

  if (error) {
    throw error;
  }

  return data;
}
