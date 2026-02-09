import { Router } from "express";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";
import { NotificationController } from "../controllers/notification.controller";

const router = Router();
const notificationController = new NotificationController();

router.use(authorizedMiddleware);

router.get("/", notificationController.getUserNotifications);
router.get("/unread-count", notificationController.getUnreadCount);
router.put("/:notificationId/read", notificationController.markAsRead);
router.put("/mark-all-read", notificationController.markAllAsRead);
router.delete("/:notificationId", notificationController.deleteNotification);

export default router;