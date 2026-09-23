import * as notificationService from "../services/notification.service.js";
import { parseId } from "../utils/parseId.js"

export async function listNotifications(req, res){
    const result = await notificationService.listNotifications(req.user.id, req.query);
    res.status(200).json(result);
}

export async function unreadCount(req, res){
    const count = await notificationService.getUnreadCount(req.user.id);
    res.status(200).json({ count });
}

export async function markRead(req,res) {
    const notification = await notificationService.markAsRead(
        req.user.id,
        parseId(req.params.id, "notification id")
    );
    res.status(200).json({ notification });
}

export async function markAllRead(req,res){
    const updated = await notificationService.markAllAsRead(req.user.id);
    res.status(200).json({ updated });
}