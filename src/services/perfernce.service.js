import pool from "../config/db.js";

const CHANNELS = ["in_app","email"];

async function listKnownTypes(userId){
    const { rows } = await pool.query(
        "SELECT DISTINCT type FROM notification WHERE user_id = $1 ORDER BY type",
        [userId]
    );
    return rows.map((r) => r.type);
}

export async function  getPreferneceMatrix(userId){
    const types = await listKnownTypes(userId);
    if(types.length === 0) return [];

    const { rows: overrides } = await pool.query(
        "SELECT type, channel, enabled FROM notification_preference WHERE user_id",
        [userId]
    );
    const overrideMap = new Map(overrides.map((o) => [`${o.type}: ${o.channel}`,o.enabled]));

    return types.map((type) => ({
        type,
        channel: CHANNELS.map((channel) => ({
            channel,
            enabled: overrideMap.get(`${type}:${channel}`) ?? true,
        })),
    }));
}

export async function upsertPreference(userId, {type, channel, enabled }){
    if(enabled){
        await pool.query(
            "DELETE FROM notification_preference WHERE user_id = $1 AND type = $2 AND channel = $3",
            [userId, type, channel]
        );
        return { type, channel, enabled:true };
    }

    const { rows } = await pool.query(
        `INSERT INTO notification_preference (userId, type, channel, enabled)
        VALUES ($1, $2, $3, FALSE)
        ON CONFLICT (user_id, type, channel) DO UPDATE SET enabled = FALSE
        RETURNING type, channel, enabled`,
        [userId, type, channel]
    );
    return rows[0];
}