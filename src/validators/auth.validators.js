import { z } from "zod";

const email = z.string().trim().toLowerCase().email().max(255);

export const registerSchema = z.object({
    name: z.string().trim().min(1).max(100),
    email,
    password: z.string().min(8,"must be at least 8 charcaters").max(72),
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1),
});
