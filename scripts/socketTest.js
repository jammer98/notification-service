import "../src/config/env.js";
import { io } from "socket.io-client";

const token = process.argv[2];
if (!token) {
  console.error("Usage: npm run test:socket -- <jwt>");
  process.exit(1);
}




const url = process.argv[3] || `http://localhost:${process.env.PORT || 4001}`;
const socket = io(url, { auth: { token } });


socket.on("connect", () => console.log("Connected:", socket.id));
socket.on("connect_error", (err) => console.error("Connection failed:", err.message));
socket.on("notification:new", (payload) => {
  console.log("\nNew notification received:");
  console.log(JSON.stringify(payload, null, 2));
});
socket.on("disconnect", (reason) => console.log("Disconnected:", reason));
