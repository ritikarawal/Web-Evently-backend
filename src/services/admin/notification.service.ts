import { NotificationModel, INotification } from "../../domain/entities/notification.model";

export class NotificationService {
    async createNotification(
        userId: string,
        title: string,
        message: string,
        type: 'event_approved' | 'event_declined' | 'event_updated' | 'general',
        eventId?: string
    ): Promise<INotification> {
        try {
            const notification = new NotificationModel({
                user: userId,
                title,
                message,
                type,
                eventId: eventId ? eventId : undefined,
            });

            await notification.save();
            return notification;
        } catch (error: any) {
            throw {
                statusCode: 500,
                message: error.message || "Failed to create notification",
            };
        }
    }

    async getUserNotifications(userId: string, limit: number = 50): Promise<INotification[]> {
        try {
            const notifications = await NotificationModel.find({ user: userId })
                .sort({ createdAt: -1 })
                .limit(limit)
                .populate('eventId', 'title');

            return notifications;
        } catch (error: any) {
            throw {
                statusCode: 500,
                message: error.message || "Failed to fetch notifications",
            };
        }
    }

    async markAsRead(notificationId: string, userId: string): Promise<INotification | null> {
        try {
            const notification = await NotificationModel.findOneAndUpdate(
                { _id: notificationId, user: userId },
                { isRead: true },
                { new: true }
            );

            return notification;
        } catch (error: any) {
            throw {
                statusCode: 500,
                message: error.message || "Failed to mark notification as read",
            };
        }
    }

    async markAllAsRead(userId: string): Promise<number> {
        try {
            const result = await NotificationModel.updateMany(
                { user: userId, isRead: false },
                { isRead: true }
            );

            return result.modifiedCount;
        } catch (error: any) {
            throw {
                statusCode: 500,
                message: error.message || "Failed to mark notifications as read",
            };
        }
    }

    async getUnreadCount(userId: string): Promise<number> {
        try {
            const count = await NotificationModel.countDocuments({
                user: userId,
                isRead: false
            });

            return count;
        } catch (error: any) {
            throw {
                statusCode: 500,
                message: error.message || "Failed to get unread count",
            };
        }
    }

    async deleteNotification(notificationId: string, userId: string): Promise<boolean> {
        try {
            const result = await NotificationModel.findOneAndDelete({
                _id: notificationId,
                user: userId
            });

            return !!result;
        } catch (error: any) {
            throw {
                statusCode: 500,
                message: error.message || "Failed to delete notification",
            };
        }
    }
}