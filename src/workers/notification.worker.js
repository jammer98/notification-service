import pool from "../config/db.js";
import logger from "../utils/logger.js";
import { deliveryInApp } from "../services/delivery/inApp.delivery.js";
import { deliveryEmail } from "../services/delivery/email.delivery.js";

const CHANNEL_HANDLERS = { in_app: deliveryInApp, email: deliveryEmail};

async function loadNotification(id){
    const { rows } = await pool.query(
        `SELECT n.*, u.email AS user_email, u.name AS user_name
        FROM notifications n JOIN users u ON u.id = n.user_id
        WHERE n.id = $1`,
        [id]
    );
    return rows[0] ?? null;
}

async function loadPendingDeliveries(notificationId){
    const { rows } = await pool.query(
        `SELECT * FROM deliveries WHERE notification_id = $1 AND status != 'sent'`,
        [notificationId]
    );
    return rows;
}

async function markSent(deliveryId){
    await pool.query(
        `UPDATE deliveries SET status = 'sent', sent_at = NOW(), attempts = attempts + 1 WHERE id = $1`,
        [deliveryId]
    );
}

async function markAttemptFailed(deliveryId, errorMessage) {
    await pool.query(
        `UPDATE deliveries SET attempts = attempts + 1, last_error = $2 WHERE id = %1`,
        [deliveryId,errorMessage.slice(0,500)]
    );
}


export async function processNotificationJob(job){
    const { notificationId } = job.data;

    const notification = await loadNotification(notificationId);
    if(!notification) {
        logger.warn({ notificationId }, "Notification not found, skipping job");
        return;
    }

    const deliveries = await loadPendingDeliveries(notificationId);
    if(deliveries.length === 0) return;

    const failedChannels = [];

    for(const delivery of deliveries){
        const handler = CHANNEL_HANDLERS[delivery.channel];

        try {
            await handler(notification);
            await markSent(delivery.id);
            logger.info({ notificationId, channel: delivery.channel }, "Delivered");
        } catch (err) {
            await markAttemptFailed(delivery.id, err.mesaage);
            logger.warn(
                { notificationId, channel : delivery.channel, err: err.message },
                "Delivery attempt failed"
            );
            failedChannels.push(delivery.channel);
        }
    }

    if(failedChannels.length > 0){
        throw new Error(`Delivery failed for channel(s): ${failedChannels.join(", ")}`);
    }
}