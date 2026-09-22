import { Router } from "express";
import express from "express";
import { catchAsync } from "../utils/catchAsync.js";
import { requireApiKey } from "../middlewares/apiKey.middleware.js";
import { producerLimiter } from "../middlewares/rateLimit.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createEventSchema } from "../validators/event.validators.js";
import { createEvent } from "../controllers/event.controller.js";

const router = Router();

// Lets a producer confirm its key works
router.get("/whoami", requireApiKey, (req, res) => {
  res.status(200).json({ producer: req.producer });
});

// Order matters: who are you → within your budget? → parse the body → is it valid?
router.post(
  "/",
  requireApiKey,
  producerLimiter,
  express.json({ limit: "16kb" }),
  validate(createEventSchema),
  catchAsync(createEvent)
);

export default router;




