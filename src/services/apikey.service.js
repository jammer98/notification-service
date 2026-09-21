import crypto from "node:crypto";
import pool from "../config/db.js";

export const KEY_PREFIX = "nk_";

export function hashKey(key) {
  return crypto.createHash("sha256").update(key).digest("hex"); // 64 hex chars, matches CHAR(64)
}

export async function createApiKey(name) {
  const key = KEY_PREFIX + crypto.randomBytes(32).toString("base64url");

  const { rows } = await pool.query(
    `INSERT INTO api_keys (name, key_prefix, key_hash)
     VALUES ($1, $2, $3) RETURNING id, name, key_prefix, created_at`,
    [name, key.slice(0, 10), hashKey(key)]
  );

  // This return value is the ONLY time the plaintext key exists anywhere
  return { ...rows[0], key };
}

export async function findActiveKey(key) {
  const { rows } = await pool.query(
    "SELECT id, name FROM api_keys WHERE key_hash = $1 AND revoked_at IS NULL",
    [hashKey(key)]
  );
  return rows[0] ?? null;
}