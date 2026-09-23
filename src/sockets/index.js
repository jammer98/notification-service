import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { createAdapter } from "@socket.io/redis-adapter";
import { createRedisConnection } from "../config/redis.js";
import logger from "../utils/logger.js";

export async function initSockts(httpServer){
    const allowedOrigins = (process.env.CORS_ORIGIN || "")
    .split(",")
    .map((O) => O.trim())
    .filter(Boolean);

    const io = new Server(httpServer, {
        cors: { origin: allowedOrigins },
    });

    const pubClient = createRedisConnection();
    const subClient = createRedisConnection();
    pubClient.on("error", (err) => logger.error({ err: err.message},"Socket pub client error"));
    subClient.on("error", (err) => logger.error({ err: err.message},"Socket sub client error"));

    io.adapter(createAdapter(pubClient, subClient));

    io.use((socket, next) =>{
        const token = socket.handshake.auth?.token;
        if(!token) return next(new Error("Not authenticated"));

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.userId = decoded.id;
            next();
        } catch{
            next(new Error("Invalid or expired token"));
        }
    });

    io.on("connection", (socket) => {
        const room = `user:${socket.userId}`;
        socket.join(room);
        logger.info({ userId: socket.userId, socketId: socket.id}, "Socket connected");

        socket.on("disconnected", (reason) => {
            logger.info({ userId:socket.userId, socketId: socket.id, reason }, "Socket disconnected");
        });
    });

    logger.info("Socket.IO server ready");

    async function close(){
        await io.close();
        pubClient.disconnect();
        subClient.disconnect();
    }

    return { io, close };
}