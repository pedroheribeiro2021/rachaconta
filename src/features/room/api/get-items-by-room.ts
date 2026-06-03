import { supabase } from "@/lib/supabase/client";

export async function getItemsByRoom(roomId: string) {
  const { data, error } = await supabase
    .from("items")
    .select("*")
    .eq("room_id", roomId)
    .order("created_at");

  if (error) {
    throw error;
  }

  return data;
}
