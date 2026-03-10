"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const notification_model_1 = require("../../domain/entities/notification.model");
const event_model_1 = require("../../domain/entities/event.model");
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
    async notifyUsersForNewVenueByCategory(category, venueName) {
        try {
            const normalizedCategory = (category || "").trim();
            if (!normalizedCategory) {
                return 0;
            }
            const escapedCategory = normalizedCategory.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const events = await event_model_1.EventModel.find({
                category: { $regex: `^${escapedCategory}$`, $options: "i" },
            }).select("organizer attendees");
            const userIds = new Set();
            for (const event of events) {
                if (event.organizer) {
                    userIds.add(event.organizer.toString());
                }
                if (Array.isArray(event.attendees)) {
                    for (const attendee of event.attendees) {
                        userIds.add(attendee.toString());
                    }
                }
            }
            let createdCount = 0;
            for (const userId of userIds) {
                await this.createNotification(userId, "New Venue Available", `A new venue "${venueName}" is now available for ${normalizedCategory} events.`, "new_venue_category");
                createdCount += 1;
            }
            return createdCount;
        }
        catch (error) {
            throw {
                statusCode: 500,
                message: error.message || "Failed to send venue category notifications",
            };
        }
    }
}
exports.NotificationService = NotificationService;
//# sourceMappingURL=notification.service.js.map