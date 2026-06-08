import { supabase } from "@/lib/supabase/client";

interface Input {
  itemId: string;
  participantId: string;
  selected: boolean;
}

export async function toggleItemConsumer(input: Input) {
  if (input.selected) {
    const { error } = await supabase
      .from("item_consumers")
      .delete()
      .eq("item_id", input.itemId)
      .eq("participant_id", input.participantId);

    if (error) {
      throw error;
    }

    return;
  }

  const { error } = await supabase.from("item_consumers").insert({
    item_id: input.itemId,
    participant_id: input.participantId,
  });

  if (error) {
    throw error;
  }
}
