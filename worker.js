import "./src/config/env.js"
import { Worker } from "bullmq"
import { createRedisConnection } from "./src/config/redis.js"
import { QUEUE_NAME } from "./src/queues/notification.queue.js"
import { processNotificationJob } from "./src/workers/notification.worker.js"
import { verifyMailer } from "./src/config/mailer.js"
import pool from "./src/config/db.js"
import logger from "./src/utils/logger.js"


let worker;

async function handleJobFailed(job, err) {
    logger.error(
        { jobId: job.id, attemptsMade: job.attemptsMade, err: err.message },
        "JOb attempt failed"
    );

    if(job.attemptsMade >= job.opts.attempts) {
        await pool.query(
            `UPDATE deliveries SET status = 'failed' WHERE notification_id = $1 AND status != 'sent'`,
            [job.data.notificationId]
        );
        logger.error({ notificationId: job.data.notificationId }, "Notification permanently failed");
    }
}

async function start (){
    try {
        await pool.query("SELECT 1");
        logger.info("Postgress connected");

        const redis = createRedisConnection({ maxRetriesPerRequest: 1, retryStategy: () => null});
        await redis.ping();
        redis.disconnect();
        logger.info("Redis Connected");

        await verifyMailer();
        logger.info("SMTP connected");

        worker = new Worker(QUEUE_NAME, processNotificationJob, {
            connection: createRedisConnection(),
            concurrency: 5,
        });

        worker.on("completed", (job) => logger.info({ jobId:job.id }, "Job completed"));
        worker.on("failed", handleJobFailed);
        worker.on("error", (err) => logger.error({ err:err.message},"Worker error"));

        logger.info("Worker started , waiting for the jobs");

    } catch (err) {
        logger.error({ err }, "Worker failed to start");
        process.exit(1);
    }
}

async function shutdown(signal) {
    logger.info({ signal }, "Worker Shutting down");
    if(worker) await worker.close();
    await pool.end();
    process.exit(0);
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

start();