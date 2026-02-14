import { NotificationModel } from '../src/domain/entities/notification.model';
import { UserModel } from '../src/domain/entities/user.model';
import { NotificationService } from '../src/services/admin/notification.service';

describe('NotificationService', () => {
  let notificationService: NotificationService;
  let testUser: any;

  beforeEach(async () => {
    notificationService = new NotificationService();

    // Create test user
    testUser = await UserModel.create({
      firstName: 'Test',
      lastName: 'User',
      username: 'testuser',
      email: 'test@example.com',
      password: 'hashedpassword',
      role: 'user'
    });
  });

  afterEach(async () => {
    await NotificationModel.deleteMany({});
    await UserModel.deleteMany({});
  });

  describe('createNotification', () => {
    it('should create a notification successfully', async () => {
      const notification = await notificationService.createNotification(
        testUser._id.toString(),
        'Test Title',
        'Test message',
        'general'
      );

      expect(notification).toBeDefined();
      expect(notification.title).toBe('Test Title');
      expect(notification.message).toBe('Test message');
      expect(notification.type).toBe('general');
      expect(notification.user.toString()).toBe(testUser._id.toString());
      expect(notification.isRead).toBe(false);
    });

    it('should create notification with event reference', async () => {
      const eventId = '507f1f77bcf86cd799439011'; // Mock ObjectId

      const notification = await notificationService.createNotification(
        testUser._id.toString(),
        'Event Notification',
        'Your event has been updated',
        'event_updated',
        eventId
      );

      expect(notification).toBeDefined();
      expect(notification.eventId).toBeDefined();
      expect(notification.eventId!.toString()).toBe(eventId);
      expect(notification.type).toBe('event_updated');
    });
  });

  describe('getUserNotifications', () => {
    beforeEach(async () => {
      // Create multiple notifications
      await notificationService.createNotification(
        testUser._id.toString(),
        'Notification 1',
        'Message 1',
        'general'
      );

      await notificationService.createNotification(
        testUser._id.toString(),
        'Notification 2',
        'Message 2',
        'event_approved'
      );

      await notificationService.createNotification(
        testUser._id.toString(),
        'Notification 3',
        'Message 3',
        'general'
      );
    });

    it('should return user notifications with default limit', async () => {
      const notifications = await notificationService.getUserNotifications(testUser._id.toString());

      expect(notifications).toHaveLength(3);
      expect(notifications[0].title).toBe('Notification 3'); // Most recent first
      expect(notifications[1].title).toBe('Notification 2');
      expect(notifications[2].title).toBe('Notification 1');
    });

    it('should respect limit parameter', async () => {
      const notifications = await notificationService.getUserNotifications(testUser._id.toString(), 2);

      expect(notifications).toHaveLength(2);
      expect(notifications[0].title).toBe('Notification 3');
      expect(notifications[1].title).toBe('Notification 2');
    });
  });

  describe('getUnreadCount', () => {
    it('should return zero for user with no notifications', async () => {
      const count = await notificationService.getUnreadCount(testUser._id.toString());

      expect(count).toBe(0);
    });

    it('should return correct unread count', async () => {
      // Create 3 notifications
      await notificationService.createNotification(
        testUser._id.toString(),
        'Notification 1',
        'Message 1',
        'general'
      );

      await notificationService.createNotification(
        testUser._id.toString(),
        'Notification 2',
        'Message 2',
        'event_approved'
      );

      await notificationService.createNotification(
        testUser._id.toString(),
        'Notification 3',
        'Message 3',
        'general'
      );

      const count = await notificationService.getUnreadCount(testUser._id.toString());
      expect(count).toBe(3);
    });

    it('should not count read notifications', async () => {
      // Create notification
      const notification = await notificationService.createNotification(
        testUser._id.toString(),
        'Test Notification',
        'Test message',
        'general'
      );

      // Mark as read
      await notificationService.markAsRead(notification._id.toString(), testUser._id.toString());

      const count = await notificationService.getUnreadCount(testUser._id.toString());
      expect(count).toBe(0);
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      const notification = await notificationService.createNotification(
        testUser._id.toString(),
        'Test Notification',
        'Test message',
        'general'
      );

      const updatedNotification = await notificationService.markAsRead(
        notification._id.toString(),
        testUser._id.toString()
      );

      expect(updatedNotification).toBeDefined();
      expect(updatedNotification!.isRead).toBe(true);
    });

    it('should return null for non-existent notification', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const result = await notificationService.markAsRead(fakeId, testUser._id.toString());

      expect(result).toBeNull();
    });
  });
});