import "../src/config/env.js"
import pool from "../src/config/db.js";
import { createRedisConnection } from "../src/config/redis.js";

const redis = createRedisConnection({ maxRetriesPerRequest: 1, retryStrategy: () => null });

try {
  await pool.query("SELECT 1");
  console.log("Postgres: OK");
  console.log("Redis:", await redis.ping()); // PONG
} catch (err) {
  console.error("Connection check failed:", err.message);
  process.exitCode = 1;
} finally {
  await pool.end();
  redis.disconnect();
}