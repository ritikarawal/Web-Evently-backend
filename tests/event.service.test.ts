import { EventService } from '../src/services/admin/event.service';
import mongoose from 'mongoose';
import { AdminUserService } from '../src/services/admin/user.service';
import { UserModel } from '../src/domain/entities/user.model';
import { EventModel } from '../src/domain/entities/event.model';

describe('EventService', () => {
  let eventService: EventService;
  let adminUserService: AdminUserService;
  let testUser: any;
  let testAdmin: any;

  beforeEach(async () => {
    eventService = new EventService();
    adminUserService = new AdminUserService();

    // Create test users
    testUser = await UserModel.create({
      firstName: 'Test',
      lastName: 'User',
      username: 'testuser',
      email: 'test@example.com',
      password: 'hashedpassword',
      role: 'user'
    });

    testAdmin = await UserModel.create({
      firstName: 'Admin',
      lastName: 'User',
      username: 'admin',
      email: 'admin@example.com',
      password: 'hashedpassword',
      role: 'admin'
    });
  });

  afterEach(async () => {
    await EventModel.deleteMany({});
    await UserModel.deleteMany({});
  });

  describe('createEvent', () => {
    it('should create an event successfully', async () => {
      const eventData = {
        title: 'Test Event',
        description: 'A test event',
        startDate: new Date('2024-12-01'),
        endDate: new Date('2024-12-02'),
        location: 'Test Location',
        category: 'conference',
        capacity: 100,
        ticketPrice: 50,
        proposedBudget: 5000
      };

      const event = await eventService.createEvent(eventData, testUser._id.toString());

      expect(event).toBeDefined();
      expect(event.title).toBe('Test Event');
      expect(event.status).toBe('pending');
      expect(event.budgetStatus).toBe('pending');
      expect(event.organizer.toString()).toBe(testUser._id.toString());
      expect(event.attendees).toContain(testUser._id);
    });

    it('should throw error for invalid data', async () => {
      const invalidData = {
        title: '', // Invalid: empty title
        startDate: new Date('2024-12-01'),
        endDate: new Date('2024-11-01'), // Invalid: end before start
      };

      await expect(eventService.createEvent(invalidData, testUser._id.toString()))
        .rejects.toMatchObject({
          statusCode: 400
        });
    });
  });

  describe('getEventById', () => {
    it('should return event by id', async () => {
      const eventData = {
        title: 'Test Event',
        description: 'A test event',
        startDate: new Date('2024-12-01'),
        endDate: new Date('2024-12-02'),
        location: 'Test Location',
        category: 'conference',
        organizer: testUser._id,
        status: 'pending'
      };

      const createdEvent = await EventModel.create(eventData);
      const foundEvent = await eventService.getEventById(createdEvent._id.toString());

      expect(foundEvent).toBeDefined();
      expect(foundEvent!._id.toString()).toBe(createdEvent._id.toString());
      expect(foundEvent!.title).toBe('Test Event');
    });

    it('should return null for non-existent event', async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      const event = await eventService.getEventById(nonExistentId);

      expect(event).toBeNull();
    });
  });

  describe('updateEventStatus', () => {
    it('should update event status successfully', async () => {
      const eventData = {
        title: 'Test Event',
        description: 'A test event',
        startDate: new Date('2024-12-01'),
        endDate: new Date('2024-12-02'),
        location: 'Test Location',
        category: 'conference',
        organizer: testUser._id,
        status: 'pending'
      };

      const createdEvent = await EventModel.create(eventData);
      const updatedEvent = await eventService.updateEventStatus(
        createdEvent._id.toString(),
        'approved',
        'Approved by admin'
      );

      expect(updatedEvent).toBeDefined();
      expect(updatedEvent!.status).toBe('approved');
      expect(updatedEvent!.adminNotes).toBe('Approved by admin');
    });

    it('should return null for non-existent event', async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      const result = await eventService.updateEventStatus(nonExistentId, 'approved');

      expect(result).toBeNull();
    });
  });
});
