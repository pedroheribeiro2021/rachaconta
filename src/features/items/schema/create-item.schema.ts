import { z } from "zod";

export const createItemSchema = z.object({
  name: z.string().trim().min(1).max(60),

  priceCents: z.number().int().positive(),
});
