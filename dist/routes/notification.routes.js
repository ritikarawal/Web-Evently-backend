"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authorized_middleware_1 = require("../middlewares/authorized.middleware");
const notification_controller_1 = require("../controllers/notification.controller");
const router = (0, express_1.Router)();
const notificationController = new notification_controller_1.NotificationController();
router.use(authorized_middleware_1.authorizedMiddleware);
router.get("/", notificationController.getUserNotifications);
router.get("/unread-count", notificationController.getUnreadCount);
router.put("/:notificationId/read", notificationController.markAsRead);
router.put("/mark-all-read", notificationController.markAllAsRead);
router.delete("/:notificationId", notificationController.deleteNotification);
exports.default = router;
//# sourceMappingURL=notification.routes.js.map