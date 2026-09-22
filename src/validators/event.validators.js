import { z } from "zod";

export const createEventSchema = z.object({
    userId: z.number().int().positive(),
    type: z
        .string()
        .trim()
        .min(1)
        .max(50)
        .regex(/^[a-z0-9_.-]+$/, " may only conatin lowercase letters, digits, _ . and -"),
    title: z.string().trim().min(1).max(150),
    body: z.string().trim().min(1).max(2000),
    data: z.record(z.string(), z.unknown()).optional(),
});