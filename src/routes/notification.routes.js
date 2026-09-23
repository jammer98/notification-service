import { Router } from "express";
import { catchAsync } from "../utils/catchAsync.js";
import { protect } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { listNotificationQuerySchema } from "../validators/notification.validator.js";
import {
    listNotifications, 
    unreadCount,
    markRead,
    markAllRead,
} from "../controllers/notification.controller.js"

const router = Router();

router.get("/", protect, validate(listNotificationQuerySchema, "query"),catchAsync(listNotifications));
router.get("/unread-count", protect, catchAsync(unreadCount));
router.patch("/read-all", protect, catchAsync(markAllRead));
router.patch("/:id/read", protect, catchAsync(markRead));

export default router;
