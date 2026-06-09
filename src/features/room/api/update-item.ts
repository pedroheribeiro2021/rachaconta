import { supabase } from "@/lib/supabase/client";

interface Input {
  itemId: string;
  name: string;
  priceCents: number;
}

export async function updateItem(input: Input) {
  const { error } = await supabase
    .from("items")
    .update({
      name: input.name,
      price_cents: input.priceCents,
    })
    .eq("id", input.itemId);

  if (error) {
    throw error;
  }
}
