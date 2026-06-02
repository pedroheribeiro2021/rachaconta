import { supabase } from "@/lib/supabase/client";

export async function getRoomByCode(code: string) {
  const { data: room, error } = await supabase
    .from("rooms")
    .select("*")
    .eq("code", code)
    .single();

  if (error) {
    throw error;
  }

  return room;
}
