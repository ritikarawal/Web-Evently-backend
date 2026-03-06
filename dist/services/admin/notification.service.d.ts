import { INotification } from "../../domain/entities/notification.model";
export declare class NotificationService {
    createNotification(userId: string, title: string, message: string, type: 'event_approved' | 'event_declined' | 'event_updated' | 'general', eventId?: string): Promise<INotification>;
    getUserNotifications(userId: string, limit?: number): Promise<INotification[]>;
    markAsRead(notificationId: string, userId: string): Promise<INotification | null>;
    markAllAsRead(userId: string): Promise<number>;
    getUnreadCount(userId: string): Promise<number>;
    deleteNotification(notificationId: string, userId: string): Promise<boolean>;
}
//# sourceMappingURL=notification.service.d.ts.map