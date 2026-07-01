import { supabase } from "@/lib/supabase/client";
import { updateServiceFeeSchema } from "@/features/room/schema/update-service-fee.schema";

interface Input {
  roomId: string;
  serviceFeePercent: number;
}

export async function updateRoomServiceFee(input: Input) {
  const { serviceFeePercent } = updateServiceFeeSchema.parse({
    serviceFeePercent: input.serviceFeePercent,
  });

  const { error } = await supabase
    .from("rooms")
    .update({ service_fee_percent: serviceFeePercent })
    .eq("id", input.roomId);

  if (error) {
    throw error;
  }
}
