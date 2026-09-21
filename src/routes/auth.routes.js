import { Router } from "express";
import { catchAsync } from "../utils/catchAsync.js";
import { protect } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { registerSchema, loginSchema } from "../validators/auth.validators.js";
import { register, login, me } from "../controllers/auth.controller.js";
import { authLimiter } from "../middlewares/rateLimit.middleware.js";

const router = Router();

router.post("/register", authLimiter, validate(registerSchema), catchAsync(register));
router.post("/login", authLimiter, validate(loginSchema), catchAsync(login));
router.get("/me", protect, catchAsync(me));