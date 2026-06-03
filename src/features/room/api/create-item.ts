import { supabase } from "@/lib/supabase/client";

interface CreateItemInput {
  roomId: string;
  name: string;
  priceCents: number;
}

export async function createItem(input: CreateItemInput) {
  const { data, error } = await supabase
    .from("items")
    .insert({
      room_id: input.roomId,
      name: input.name,
      price_cents: input.priceCents,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}
