import { supabase } from "@/lib/supabase/client";

export async function getItemConsumers(itemId: string) {
  const { data, error } = await supabase
    .from("item_consumers")
    .select("*")
    .eq("item_id", itemId);

  if (error) {
    throw error;
  }

  return data;
}
