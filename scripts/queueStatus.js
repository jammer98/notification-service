import "../src/config/env.js";
import { notificationQueue } from "../src/queues/notification.queue.js";

console.log(
  await notificationQueue.getJobCounts("waiting", "active", "delayed", "completed", "failed")
);
await notificationQueue.close();