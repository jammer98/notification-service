import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";
import logger from "../utils/logger.js";
import { AppError } from "../utils/AppError.js";

const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", 10);

function signToken(userId){
    return jwt.sign({ id:userId }, process.env.JWT_SECRET,{
        expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });
}

export async function registerUser(  { name, email, password } ){
    const paswordHash = await bcrypt.hash(password, 10);
    try {
        const { rows } = await pool.query(
            `INSERT INTO users (name,email,password_hash)
            VALUES ($1, $2, $3) RETURNING id, name, email,created_at`,
            [name,email,paswordHash]
        );
        const user = rows[0];
        logger.info({ userId: user.id }, "user Regsitered");
        return { user, token: signToken(user.id)};
    } catch (error) {
        if(error.code === "23505") throw new AppError("An account with this email already exists",409);
        throw error;
    }
}

export async function loginUser ({ email, password }){
    const { rows } = await pool.query(
        "SELECT id, name, email, password_hash from users WHERE email = $1",[email]
    );
    const user = rows[0];

    const isValid = await bcrypt.compare(password, user ? user.password_hash : DUMMY_HASH);
    if(!user || !isValid) throw new AppError("Invalid email or password",401);

    logger.info({userId: user.id}, "User logged in");
    delete user.password_hash;
    return { user, token: signToken(user.id) };
}

export async function getUserById(id) {
  const { rows } = await pool.query(
    "SELECT id, name, email, created_at FROM users WHERE id = $1",
    [id]
  );
  // A token can outlive its account, so a valid JWT for a deleted user is still unauthenticated
  if (!rows[0]) throw new AppError("Account no longer exists", 401);
  return rows[0];
}