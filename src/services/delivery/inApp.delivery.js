import { Emitter } from "@socket.io/redis-emitter";
import { createRedisConnection } from "../../config/redis.js";

const emitter = new Emitter(createRedisConnection());

export async function deliveryInApp(notification) {
    emitter.to(`user:${notification.user_id}`).emit("notification:new", {
        id: notification.id,
        type:notification.type,
        title: notification.title,
        body:notification.body,
        data: notification.data,
        createdAt: notification.createdAt,
    });
}