import { z } from "zod";

export const updateServiceFeeSchema = z.object({
  serviceFeePercent: z.number().int().min(0).max(100),
});
