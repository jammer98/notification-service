import rateLimit from "express-rate-limit";
import { AppError } from "../utils/AppError.js";

// Send 429s through our error handler so the response stays { "error": "..." }
const handler = (req, res, next, options) =>
  next(new AppError(options.message, options.statusCode));

const base = { standardHeaders: "draft-7", legacyHeaders: false, handler };

export const globalLimiter = rateLimit({
  ...base,
  windowMs: 15 * 60 * 1000,
  limit: 300,
  message: "Too many requests, please try again later",
});

// Login/register: tight, and only failed attempts count
export const authLimiter = rateLimit({
  ...base,
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  message: "Too many failed attempts, please try again in 15 minutes",
});

// Producers are services, not browsers, so they get a per-API-key budget instead of a per-IP one
export const producerLimiter = rateLimit({
  ...base,
  windowMs: 60 * 1000,
  limit: 300,
  keyGenerator: (req) => `producer-${req.producer.id}`,
  message: "Rate limit exceeded for this API key",
});