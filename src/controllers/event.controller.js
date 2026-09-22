import { ingestEvent } from "../services/event.service.js";
import { AppError } from "../utils/AppError.js";

export async function createEvent(req, res) {
  const idempotencyKey = req.get("idempotency-key");
  if (idempotencyKey !== undefined && (idempotencyKey.length < 1 || idempotencyKey.length > 100)) {
    throw new AppError("Idempotency-Key must be between 1 and 100 characters", 400);
  }

  const result = await ingestEvent({
    producer: req.producer,
    event: req.body,
    idempotencyKey,
  });

  // 202 = accepted for processing. Replays and suppressed events did no new work, so 200.
  const isNewWork = result.status === "queued" && !result.duplicate;
  res.status(isNewWork ? 202 : 200).json(result);
}