import logger from "../utils/logger.js";
import { AppError } from "../utils/AppError.js";

export function notFound(req, res, next) {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
}

// Express recognises an error handler by its 4 arguments, so keep all four
export function errorHandler(err, req, res, next) {
  // Known, deliberate errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // Postgres: unique / foreign key / check constraint violations
  if (err.code === "23505") {
    return res.status(409).json({ error: "This record already exists" });
  }
  if (err.code === "23503") {
    return res.status(400).json({ error: "Referenced record does not exist" });
  }
  if (err.code === "23514") {
    return res.status(400).json({ error: "A value violates a database rule" });
  }

  // Request body problems (from express.json)
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Invalid JSON body" });
  }
  if (err.type === "entity.too.large") {
    return res.status(413).json({ error: "Request body too large" });
  }

  // Anything else is a bug: log the details, hide them from the client
  logger.error({ err }, "Unhandled error");
  res.status(500).json({ error: "Internal server error" });
}