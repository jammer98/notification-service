import pool from "../config/db.js";
import { AppError } from "../utils/AppError.js";

export async function listNotifications(userId, { unread, page, limit }){
    const pageNum = Math.max(parseInt(page) || 1,1);
    const limitNum = Math.min(Math.max(parseInt(limit) || 20, 1), 50);
    const offset = (pageNum - 1) * limitNum;

    const conditions = ["user_id = $1"];
    const values = [userId];
    if(unread === "true") conditions.push("read_at IS NULL");
    const where = conditions.join(" AND ");

    const { rows } = await pool.query(
        `SELECT id, type, body, data, read_at, created_at
        FROM notifications WHERE ${where}
        ORDER BY created_at DESC
        LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
        [...values, limitNum, offset]
    );

    const { rows: countRows } = await pool.query(
        `SELECT COUNT(*) :: int AS total FROM notifications WHERE ${where}`,
        values
    );
    const total = countRows[0].total;

    return { notifications: rows, page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total/ limitNum)};
}

export async function getUnreadCount(userId) {
  const { rows } = await pool.query(
    "SELECT COUNT(*)::int AS count FROM notifications WHERE user_id = $1 AND read_at IS NULL",
    [userId]
  );
  return rows[0].count;
}

export async function markAsRead(userId, notificationId){
    const { rows } = await pool.query(
        `UPDATE notifications SET read_at = NOW()
        WHERE id = $1 AND user_id = $2 AND read_at IS NULL
        RETURNING id, read_at `,
        [notificationId, userId]  
        );
    if(rows[0]) return rows[0];   
    
    
    const { rows:existing } = await pool.query(
        "SELECT id,read_at FROM notifications WHERE id = $1 AND user_id = $2",
        [notificationId, userId]
    );
    if(!existing[0]) throw new AppError("Notification not found", 404);
    return existing[0]; 
}

export async function markAllAsRead(userId) {
    const { rowCount } = await pool.query(
        "UPDATE notifications SET read_at = NOW() WHERE user_id = $1 AND read_at is NULL",
        [userId]
    );

    return rowCount;
}