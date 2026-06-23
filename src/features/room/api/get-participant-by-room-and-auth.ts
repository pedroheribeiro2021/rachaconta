import { supabase } from "@/lib/supabase/client";

export async function getParticipantByRoomAndAuth(
  roomId: string,
  authId: string,
) {
  const { data, error } = await supabase
    .from("participants")
    .select("*")
    .eq("room_id", roomId)
    .eq("auth_id", authId)
    .order("created_at")
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}
