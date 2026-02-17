
import request from 'supertest';
import { app } from '../src/index';

describe('API Integration Tests', () => {
  // Test data
  const testUser = {
    firstName: 'Test',
    lastName: 'User',
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
    confirmPassword: 'password123'
  };

  const testAdmin = {
    firstName: 'Admin',
    lastName: 'User',
    username: 'adminuser',
    email: 'admin@example.com',
    password: 'admin123',
    confirmPassword: 'admin123',
    role: 'admin'
  };

  const testEvent = {
    title: 'Test Event',
    description: 'This is a test event for integration testing',
    startDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    endDate: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow
    location: 'Test Location',
    category: 'conference',
    capacity: 100,
    ticketPrice: 50
  };

  let userToken: string;
  let adminToken: string;
  let userId: string;
  let eventId: string;

  // Test Case 1: Health Check
  describe('GET /', () => {
    it('should return welcome message', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Welcome to Evently');
    });
  });

  // Test Case 2: User Registration
  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body).toHaveProperty('token');
      expect(response.body.data.email).toBe(testUser.email);
      expect(response.body.data.role).toBe('user');

      userToken = response.body.token;
      userId = response.body.data._id;
    });

    // Test Case 3: Duplicate User Registration
    it('should reject duplicate email registration', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });

    // Test Case 4: Invalid Registration Data
    it('should reject registration with invalid data', async () => {
      const invalidUser = {
        firstName: '',
        email: 'invalid-email',
        password: '123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidUser)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  // Test Case 5: User Login
  describe('POST /api/auth/login', () => {
    it('should login successfully with correct credentials', async () => {
      const loginData = {
        email: testUser.email,
        password: testUser.password
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data.email).toBe(testUser.email);
    });

    // Test Case 6: Invalid Login
    it('should reject login with wrong password', async () => {
      const loginData = {
        email: testUser.email,
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  // Test Case 7: Admin Registration
  describe('Admin Registration', () => {
    it('should register an admin user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testAdmin)
        .expect(201);

      expect(response.body.success).toBe(true);
      adminToken = response.body.token;
    });
  });

  // Test Case 8: Protected Route Access
  describe('GET /api/auth/profile', () => {
    it('should return user profile for authenticated user', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(userId);
      expect(response.body.data.email).toBe(testUser.email);
    });

    // Test Case 9: Unauthorized Access
    it('should reject unauthenticated profile access', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  // Test Case 10: Event Creation
  describe('POST /api/events', () => {
    it('should create a new event for authenticated user', async () => {
      const response = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${userToken}`)
        .send(testEvent)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(testEvent.title);
      expect(response.body.data.organizer).toBe(userId);
      expect(response.body.data.status).toBe('pending');

      eventId = response.body.data._id;
    });

    // Test Case 11: Event Creation Without Auth
    it('should reject event creation without authentication', async () => {
      const response = await request(app)
        .post('/api/events')
        .send(testEvent)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  // Test Case 12: Get User Events
  describe('GET /api/events/user/my-events', () => {
    it('should return user\'s events', async () => {
      const response = await request(app)
        .get('/api/events/user/my-events')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0]._id).toBe(eventId);
    });
  });

  // Test Case 13: Get All Events (Admin)
  describe('GET /api/admin/events', () => {
    it('should return all events for admin', async () => {
      const response = await request(app)
        .get('/api/admin/events')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    // Test Case 14: Non-admin Access to Admin Routes
    it('should reject non-admin access to admin routes', async () => {
      const response = await request(app)
        .get('/api/admin/events')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  // Test Case 15: Event Approval Workflow
  describe('Event Approval', () => {
    it('should approve event successfully', async () => {
      const response = await request(app)
        .put(`/api/admin/events/${eventId}/approve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ adminNotes: 'Approved for testing' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('approved');
    });

    // Test Case 16: Event Decline
    it('should decline event with notes', async () => {
      // First create another event to decline
      const newEvent = { ...testEvent, title: 'Event to Decline' };
      const createResponse = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${userToken}`)
        .send(newEvent)
        .expect(201);

      const declineEventId = createResponse.body.data._id;

      const response = await request(app)
        .put(`/api/admin/events/${declineEventId}/decline`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ adminNotes: 'Not suitable for our platform' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('declined');
      expect(response.body.data.adminNotes).toBe('Not suitable for our platform');
    });
  });

  // Test Case 17: Budget Proposal System
  describe('Budget Negotiation', () => {
    let budgetEventId: string;

    beforeAll(async () => {
      // Create an event for budget testing
      const budgetEvent = { ...testEvent, title: 'Budget Test Event' };
      const response = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${userToken}`)
        .send(budgetEvent);

      budgetEventId = response.body.data._id;
    });

    it('should submit budget proposal', async () => {
      const response = await request(app)
        .put(`/api/admin/events/${budgetEventId}/budget-proposal`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          proposedBudget: 1000,
          message: 'Initial budget proposal'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should allow user to counter-propose budget', async () => {
      const response = await request(app)
        .put(`/api/events/${budgetEventId}/budget-response`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          accepted: false,
          counterProposal: 800,
          message: 'User counter proposal'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.budgetStatus).toBe('negotiating');
    });

    // Test Case 18: Accept Budget Proposal
    it('should accept user budget proposal', async () => {
      const response = await request(app)
        .put(`/api/admin/events/${budgetEventId}/accept-user-budget`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.budgetStatus).toBe('accepted');
      expect(response.body.data.status).toBe('approved');
    });
  });

  // Test Case 19: Notification System
  describe('Notifications', () => {
    it('should get unread notification count', async () => {
      const response = await request(app)
        .get('/api/notifications/unread-count')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('unreadCount');
      expect(typeof response.body.data.unreadCount).toBe('number');
    });

    // Test Case 20: Get User Notifications
    it('should retrieve user notifications', async () => {
      const response = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    // Test Case 21: Mark Notification as Read
    it('should mark notification as read', async () => {
      // First get notifications
      const getResponse = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${userToken}`);

      if (getResponse.body.data.length > 0) {
        const notificationId = getResponse.body.data[0]._id;

        const response = await request(app)
          .put(`/api/notifications/${notificationId}/read`)
          .set('Authorization', `Bearer ${userToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
      }
    });
  });

  // Test Case 22: User Management (Admin)
  describe('User Management', () => {
    it('should get all users as admin', async () => {
      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    // Test Case 23: Update User Role
    it('should update user role', async () => {
      const response = await request(app)
        .put(`/api/admin/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'admin' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.role).toBe('admin');
    });

    // Test Case 24: Delete User
    it('should delete user', async () => {
      // Create a test user to delete
      const deleteUser = {
        firstName: 'Delete',
        lastName: 'Test',
        username: 'deletetest',
        email: 'delete@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      };

      const createResponse = await request(app)
        .post('/api/auth/register')
        .send(deleteUser);

      const deleteUserId = createResponse.body.data._id;

      const response = await request(app)
        .delete(`/api/admin/users/${deleteUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  // Test Case 25: Event Search and Filtering
  describe('Event Search and Filtering', () => {
    it('should search events by category', async () => {
      const response = await request(app)
        .get('/api/events?category=conference')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should filter events by status', async () => {
      const response = await request(app)
        .get('/api/admin/events?status=approved')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should paginate results', async () => {
      const response = await request(app)
        .get('/api/admin/events?page=1&limit=10')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.pagination).toHaveProperty('currentPage');
      expect(response.body.pagination).toHaveProperty('totalPages');
    });
  });

  // Additional Edge Cases and Error Handling
  describe('Error Handling and Edge Cases', () => {
    it('should handle invalid event ID', async () => {
      const response = await request(app)
        .get('/api/events/invalid-id')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should handle non-existent event', async () => {
      const response = await request(app)
        .get('/api/events/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should validate required fields in event creation', async () => {
      const invalidEvent = {
        title: '',
        description: 'Test'
      };

      const response = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${userToken}`)
        .send(invalidEvent)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});