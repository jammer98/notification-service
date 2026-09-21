import dotenv from "dotenv";
import { z } from "zod";

dotenv.config({ quiet: true });

const schema = z.object({
  DATABASE_URI: z.string().min(1, "is required"),
  // Upstash shows both a REST URL (https://...) and a TCP URL (rediss://...). BullMQ needs the TCP one.
  REDIS_URL: z
    .string()
    .refine(
      (v) => /^rediss?:\/\//.test(v),
      "must be the TCP connection string (redis:// or rediss://), not the REST URL"
    ),
  JWT_SECRET: z.string().min(16, "must be at least 16 characters"),
});

const result = schema.safeParse(process.env);
if (!result.success) {
  console.error("Invalid environment configuration:");
  for (const issue of result.error.issues) {
    console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
  }
  process.exit(1);
}