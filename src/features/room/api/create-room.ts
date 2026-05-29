import { generateRoomCode } from "@/lib/utils/generate-room-code";
import { supabase } from "../../../../supabase/client";

export async function createRoom(nickname: string, authId: string) {
  const roomCode = generateRoomCode();

  const { data: room, error: roomError } = await supabase

    .from("rooms")

    .insert({
      code: roomCode,
      host_auth_id: authId,
    })

    .select()

    .single();

  if (roomError) {
    throw roomError;
  }

  const { data: participant, error: participantError } = await supabase

    .from("participants")

    .insert({
      room_id: room.id,
      auth_id: authId,
      nickname,
    })

    .select()

    .single();

  if (participantError) {
    throw participantError;
  }

  return {
    room,
    participant,
  };
}
