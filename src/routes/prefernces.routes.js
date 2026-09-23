import { Router } from "express";
import { catchAsync } from "../utils/catchAsync.js";
import { protect } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { upsertPreferenceSchema } from "../validators/prefernce.validator.js";
import { getPreferences, upsertPreferences } from "../controllers/preferences.controller.js";

const router = Router();

router.get("/", protect, catchAsync(getPreferences));
router.put("/", protect, validate(upsertPreferenceSchema), catchAsync(upsertPreferences));

export default router;