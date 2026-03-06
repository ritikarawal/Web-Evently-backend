"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const notification_model_1 = require("../../domain/entities/notification.model");
class NotificationService {
    async createNotification(userId, title, message, type, eventId) {
        try {
            const notification = new notification_model_1.NotificationModel({
                user: userId,
                title,
                message,
                type,
                eventId: eventId ? eventId : undefined,
            });
            await notification.save();
            return notification;
        }
        catch (error) {
            throw {
                statusCode: 500,
                message: error.message || "Failed to create notification",
            };
        }
    }
    async getUserNotifications(userId, limit = 50) {
        try {
            const notifications = await notification_model_1.NotificationModel.find({ user: userId })
                .sort({ createdAt: -1 })
                .limit(limit)
                .populate('eventId', 'title');
            return notifications;
        }
        catch (error) {
            throw {
                statusCode: 500,
                message: error.message || "Failed to fetch notifications",
            };
        }
    }
    async markAsRead(notificationId, userId) {
        try {
            const notification = await notification_model_1.NotificationModel.findOneAndUpdate({ _id: notificationId, user: userId }, { isRead: true }, { new: true });
            return notification;
        }
        catch (error) {
            throw {
                statusCode: 500,
                message: error.message || "Failed to mark notification as read",
            };
        }
    }
    async markAllAsRead(userId) {
        try {
            const result = await notification_model_1.NotificationModel.updateMany({ user: userId, isRead: false }, { isRead: true });
            return result.modifiedCount;
        }
        catch (error) {
            throw {
                statusCode: 500,
                message: error.message || "Failed to mark notifications as read",
            };
        }
    }
    async getUnreadCount(userId) {
        try {
            const count = await notification_model_1.NotificationModel.countDocuments({
                user: userId,
                isRead: false
            });
            return count;
        }
        catch (error) {
            throw {
                statusCode: 500,
                message: error.message || "Failed to get unread count",
            };
        }
    }
    async deleteNotification(notificationId, userId) {
        try {
            const result = await notification_model_1.NotificationModel.findOneAndDelete({
                _id: notificationId,
                user: userId
            });
            return !!result;
        }
        catch (error) {
            throw {
                statusCode: 500,
                message: error.message || "Failed to delete notification",
            };
        }
    }
}
exports.NotificationService = NotificationService;
//# sourceMappingURL=notification.service.js.map