import { Router } from "express";
import pool from "../config/db.js";
import { createRedisConnection } from "../config/redis.js";
import logger from "../utils/logger.js";
import { catchAsync } from "../utils/catchAsync.js";

const router = Router();

// One long-lived connection for pings. Fail fast so an outage reads as "down", not a hang
const redis = createRedisConnection({ maxRetriesPerRequest: 1 });
redis.on("error", (err) => logger.warn({ err: err.message }, "Redis health connection error"));

router.get(
  "/",
  catchAsync(async (req, res) => {
    const [db, cache] = await Promise.allSettled([pool.query("SELECT 1"), redis.ping()]);
    const dbUp = db.status === "fulfilled";
    const redisUp = cache.status === "fulfilled";
    const healthy = dbUp && redisUp;

    res.status(healthy ? 200 : 503).json({
      status: healthy ? "ok" : "degraded",
      postgres: dbUp ? "up" : "down",
      redis: redisUp ? "up" : "down",
    });
  })
);

export default router;