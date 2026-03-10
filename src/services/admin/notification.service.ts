import { NotificationModel, INotification } from "../../domain/entities/notification.model";
import { EventModel } from "../../domain/entities/event.model";

export class NotificationService {
    async createNotification(
        userId: string,
        title: string,
        message: string,
        type: 'event_approved' | 'event_declined' | 'event_updated' | 'new_venue_category' | 'general',
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

    async notifyUsersForNewVenueByCategory(
        category: string,
        venueName: string
    ): Promise<number> {
        try {
            const normalizedCategory = (category || "").trim();
            if (!normalizedCategory) {
                return 0;
            }

            const escapedCategory = normalizedCategory.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const events = await EventModel.find({
                category: { $regex: `^${escapedCategory}$`, $options: "i" },
            }).select("organizer attendees");

            const userIds = new Set<string>();
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
                await this.createNotification(
                    userId,
                    "New Venue Available",
                    `A new venue "${venueName}" is now available for ${normalizedCategory} events.`,
                    "new_venue_category"
                );
                createdCount += 1;
            }

            return createdCount;
        } catch (error: any) {
            throw {
                statusCode: 500,
                message: error.message || "Failed to send venue category notifications",
            };
        }
    }
}