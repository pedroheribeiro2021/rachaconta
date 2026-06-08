import { supabase } from "@/lib/supabase/client";
import { getRoomByCode } from "./get-room-by-code";

export async function joinRoom(
  roomCode: string,
  nickname: string,
  authId: string,
) {
  const room = await getRoomByCode(roomCode);

  const { data: participant, error } = await supabase
    .from("participants")
    .insert({
      room_id: room.id,
      auth_id: authId,
      nickname,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return {
    room,
    participant,
  };
}
