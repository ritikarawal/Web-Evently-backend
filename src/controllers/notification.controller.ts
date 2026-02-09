import { Request, Response } from "express";
import { NotificationService } from "../services/admin/notification.service";

const notificationService = new NotificationService();

export class NotificationController {
    async getUserNotifications(req: Request, res: Response) {
        try {
            const userId = (req.user as any)._id.toString();
            const limit = parseInt(req.query.limit as string) || 50;

            const notifications = await notificationService.getUserNotifications(userId, limit);

            return res.status(200).json({
                success: true,
                message: "Notifications fetched successfully",
                data: notifications,
            });
        } catch (error: any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Failed to fetch notifications",
            });
        }
    }

    async markAsRead(req: Request, res: Response) {
        try {
            const userId = (req.user as any)._id.toString();
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
        } catch (error: any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Failed to mark notification as read",
            });
        }
    }

    async markAllAsRead(req: Request, res: Response) {
        try {
            const userId = (req.user as any)._id.toString();

            const count = await notificationService.markAllAsRead(userId);

            return res.status(200).json({
                success: true,
                message: `${count} notifications marked as read`,
                data: { markedCount: count },
            });
        } catch (error: any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Failed to mark notifications as read",
            });
        }
    }

    async getUnreadCount(req: Request, res: Response) {
        try {
            const userId = (req.user as any)._id.toString();

            const count = await notificationService.getUnreadCount(userId);

            return res.status(200).json({
                success: true,
                message: "Unread count fetched successfully",
                data: { unreadCount: count },
            });
        } catch (error: any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Failed to get unread count",
            });
        }
    }

    async deleteNotification(req: Request, res: Response) {
        try {
            const userId = (req.user as any)._id.toString();
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
        } catch (error: any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Failed to delete notification",
            });
        }
    }
}