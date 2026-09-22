import pool  from  "../config/db.js";
import logger from "../utils/logger.js";
import { AppError } from "../utils/AppError.js";
import { enqueueNotification } from "../queues/notification.queue.js";

const ALL_CHANNELS = ["in_app","email"];

async function getEnabledChannels(userId, type){
    const { rows } = await pool.query(
        `SELECT channel FROM notification_preferences
        WHERE user_id = $1 AND type = $2 AND enabled = FALSE`,[userId,type]);

        const disabled = new Set(rows.map((r) => r.channel));
        return ALL_CHANNELS.filter((c) => !disabled.has(c));
    }

async function insertNotification ({ producer, event, idempotencyKey, channels }){
        const client = await pool.connect();

        try{
            await client.query("BEGIN");

            const { rows } = await client.query(
                `INSERT INTO notifications (user_id, api_key_id, type, title, body, data, idempotency_key)
                VALUES ($1, $2, $3, $4, $5, $6, $7) 
                ON CONFLICT (api_key_id, idempotency_key) DO NOTHING
                RETURNING id `,
                [
                    event.userId,
                    producer.id,
                    event.type,
                    event.title,
                    event.body,
                    event.data ?? {},
                    idempotencyKey ?? null,
                ]
            );

            if(rows.length === 0){
                await client.query("ROLLBACK");
                return null;
            }

            const id = rows[0].id;
            await client.query(
                `INSERT INTO deliveries (notification_id, channel)
                SELECT $1, unnest($2::notification_channel[])`,
                [id, channels]
            );

            await client.query("COMMIT");
            return id;
        }
        catch (error){
            await client.query("ROLLBACK");
            throw error;
        }
        finally{
            client.release();
        }
    }

    async function safeEnqueue(notificationId){
        try {
            await enqueueNotification(notificationId);
        } catch (err) {
            logger.error({err, notificationId}, "Failed to ensure notification ");
            throw new AppError(
                "notification saved but could not be queued, retry with the same idempotency-Key",
                503
            );
        }
    }

 async function handleReplay({ producer, event, idempotencyKey }){
    const { rows } = await pool.query(
        `SELECT id, user_id, type FROM notifications
            WHERE api_key_id = $1 AND idempotency_key = $2`,
            [producer.id, idempotencyKey]
    );

    const existing = rows[0];

    if(existing.user_id !== event.userId || existing.type !== event.type){
        throw new AppError("This Idempotency-key was already usedfor a different event",409);
    }

    const { rows:deliveries } = await pool.query(
        "SELECT channel, status FROM deliveries WHERE notification_id = $1",
        [existing.id]
    );

    if(deliveries.some((d) => d.status === "pending")){
        await safeEnqueue(existing.id);
    }

    return {
        status : "queued",
        notificationId: existing.id,
        channel: deliveries.map((d) => d.channel),
        duplicate: true,
    };
 }

 export async function ingestEvent ({ producer, event, idempotencyKey }){
    const { rows: users } = await pool.query("SELECT id FROM users WHERE id = $1",[event.userId]);
    if(!users[0]) throw new AppError("Recipient user not found", 404);

    const channels = await getEnabledChannels(event.userId, event.type);
    if(channels.length === 0){
        logger.info({ userId: event.userId, type: event.type }, "Event suppressed: all channel opted out");
        return { status: "suppressed", notificationId:null, channels:[], duplicate: false};
    }

    const notificationId = await insertNotification({ producer, event, idempotencyKey, channels});
    if(notificationId === null){
        return handleReplay({ producer, event, idempotencyKey})
    }

    await safeEnqueue(notificationId);
    logger.info({ notificationId, producer:producer.name, channels }, "Event accepted");

    return { status: "queued", notificationId, channels, duplicate: false};
 }