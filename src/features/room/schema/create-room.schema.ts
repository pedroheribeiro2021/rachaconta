import { z } from "zod";

export const createRoomSchema = z.object({
  nickname: z.string().trim().min(2).max(20),
});
