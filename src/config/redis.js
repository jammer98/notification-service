import IORedis from "ioredis";

// A function, not one shared instance. A connection in subscriber mode can't run normal
// commands, so the queue, the worker, and pub/sub each need their own connection.
// maxRetriesPerRequest: null is required by BullMQ's blocking commands.
export function createRedisConnection(overrides = {}) {
  return new IORedis(process.env.REDIS_URL || "redis://localhost:6379", {
    maxRetriesPerRequest: null,
    ...overrides,
  });
}