import "./src/config/env.js"
import http from "node:http";
import app  from "./src/app.js"
import pool from "./src/config/db.js";
import { createRedisConnection } from "./src/config/redis.js";
import logger from "./src/utils/logger.js";
import { notificationQueue } from "./src/queues/notification.queue.js";

const server = http.createServer(app);
const port = process.env.PORT || 4001;

async function start(){
    try {
        await pool.query("SELECT 1");
        logger.info("Postgres connected");

        const redis = createRedisConnection({ maxRetriesPerRequest: 1, retryStrategy: () => null });
        await redis.ping();
        redis.disconnect();
        logger.info("redis Connected");
        server.listen(port, () => logger.info(`API listening on port ${port}`));

    } catch (err) {
        logger.error({ err }, "Failed to start");
        process.exit(1);
    }
}

function shutdown(signal) {
  logger.info({ signal }, "Shutting down");
  server.close(async () => {
    await notificationQueue.close();
    await pool.end();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

start();