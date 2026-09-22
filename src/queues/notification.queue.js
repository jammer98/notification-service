import { Queue } from "bullmq";
import { createRedisConnection } from "../config/redis.js";
import logger from "../utils/logger.js";

export const QUEUE_NAME = "notifications";

export const notificationQueue  = new Queue( QUEUE_NAME, {
    connection: createRedisConnection(),
    defaultJobOptions: {
        attempts: 5,
        backoff : { type:"exponential",delay: 2000},
        removeOnComplete: { age:3600, count: 1000},
        removeOnFail : { age : 7* 24 * 3600},
    },
});

notificationQueue.on("error", (err) => logger.error({ err: err.message}, "Queue error"));

export function enqueueNotification(notificationId){
    return notificationQueue.add(
        "deliver",
        { notificationId },
        { jobId: `notification-${notificationId}`}
    );
}