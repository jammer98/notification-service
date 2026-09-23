import { z } from "zod";

export const upsertPreferenceSchema = z.object({
  type: z.string().trim().min(1).max(50).regex(/^[a-z0-9_.-]+$/),
  channel: z.enum(["in_app", "email"]),
  enabled: z.boolean(),
});