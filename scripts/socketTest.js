import "../src/config/env.js";
import { io } from "socket.io-client";

const token = process.argv[2];
if (!token) {
  console.error("Usage: npm run test:socket -- <jwt>");
  process.exit(1);
}

// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiaWF0IjoxNzkwMTQxMDA0LCJleHAiOjE3OTA3NDU4MDR9._WTJqqcUFdbxV3nLPl05mBgiU9mbTWuivjDEwIJFMS4

const socket = io(`http://localhost:${process.env.PORT || 4001}`, { auth: { token } });

socket.on("connect", () => console.log("Connected:", socket.id));
socket.on("connect_error", (err) => console.error("Connection failed:", err.message));
socket.on("notification:new", (payload) => {
  console.log("\n🔔 New notification received:");
  console.log(JSON.stringify(payload, null, 2));
});
socket.on("disconnect", (reason) => console.log("Disconnected:", reason));