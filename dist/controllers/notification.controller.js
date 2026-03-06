"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const notification_service_1 = require("../services/admin/notification.service");
const notificationService = new notification_service_1.NotificationService();
class NotificationController {
    async getUserNotifications(req, res) {
        try {
            const userId = req.user._id.toString();
            const limit = parseInt(req.query.limit) || 50;
            const notifications = await notificationService.getUserNotifications(userId, limit);
            return res.status(200).json({
                success: true,
                message: "Notifications fetched successfully",
                data: notifications,
            });
        }
        catch (error) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Failed to fetch notifications",
            });
        }
    }
    async markAsRead(req, res) {
        try {
            const userId = req.user._id.toString();
            const { notificationId } = req.params;
            const notification = await notificationService.markAsRead(notificationId, userId);
            if (!notification) {
                return res.status(404).json({
                    success: false,
                    message: "Notification not found",
                });
            }
            return res.status(200).json({
                success: true,
                message: "Notification marked as read",
                data: notification,
            });
        }
        catch (error) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Failed to mark notification as read",
            });
        }
    }
    async markAllAsRead(req, res) {
        try {
            const userId = req.user._id.toString();
            const count = await notificationService.markAllAsRead(userId);
            return res.status(200).json({
                success: true,
                message: `${count} notifications marked as read`,
                data: { markedCount: count },
            });
        }
        catch (error) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Failed to mark notifications as read",
            });
        }
    }
    async getUnreadCount(req, res) {
        try {
            const userId = req.user?._id?.toString();
            console.log('Getting unread count for user:', userId);
            if (!userId) {
                console.error('No user ID found in request');
                return res.status(401).json({
                    success: false,
                    message: "User not authenticated",
                });
            }
            const count = await notificationService.getUnreadCount(userId);
            console.log('Unread count for user', userId, ':', count);
            return res.status(200).json({
                success: true,
                message: "Unread count fetched successfully",
                data: { unreadCount: count },
            });
        }
        catch (error) {
            console.error('Error in getUnreadCount:', error);
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Failed to get unread count",
            });
        }
    }
    async deleteNotification(req, res) {
        try {
            const userId = req.user._id.toString();
            const { notificationId } = req.params;
            const deleted = await notificationService.deleteNotification(notificationId, userId);
            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    message: "Notification not found",
                });
            }
            return res.status(200).json({
                success: true,
                message: "Notification deleted successfully",
            });
        }
        catch (error) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Failed to delete notification",
            });
        }
    }
}
exports.NotificationController = NotificationController;
//# sourceMappingURL=notification.controller.js.map