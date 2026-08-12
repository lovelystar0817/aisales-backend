import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Fastify from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { validatorCompiler } from 'fastify-type-provider-zod';
import { Types } from 'mongoose';
import request from 'supertest';
import router from './users.js';
import { ManageUser } from '../../models/ManageUser.js';
import { User } from '../../models/User.js';

// Mock the models
vi.mock('../../models/ManageUser.js', () => ({
  ManageUser: {
    find: vi.fn(),
  },
}));

vi.mock('../../models/User.js', () => ({
  User: {
    find: vi.fn(),
    countDocuments: vi.fn(),
  },
}));

// Mock utility functions
vi.mock('../../utils/manage/index.js', () => ({
  getBulkUserStatistics: vi.fn(),
  getUserPracticeBreakdown: vi.fn(),
  getUserPracticeSummary: vi.fn(),
  getUserProgressData: vi.fn(),
  getUserSessionHistory: vi.fn(),
  getUserStatistics: vi.fn(),
}));

vi.mock('../../utils/manage/shared.js', () => ({
  buildBaseUserFilter: vi.fn(
    (companyId, teams, includeDeleted, skipTesterFilter) => {
      const filter: any = {
        company: companyId,
        isDeleted: { $ne: true },
      };
      // Only add isTester filter if not skipped
      if (!skipTesterFilter) {
        filter.isTester = { $ne: true };
      }
      return filter;
    },
  ),
  validateUserAccess: vi.fn(),
}));

vi.mock('../../utils/prudential-standing.js', () => ({
  shouldUsePrudentialData: vi.fn(() => false),
}));

import { getBulkUserStatistics } from '../../utils/manage/index.js';

// NOTE: The GET /manage/users endpoint has been simplified to only query User collection
// User merge logic (ManageUser + User) is handled by GET /manage/settings/users instead
// These tests are kept but skipped as they test the old merge logic
describe.skip('GET /manage/users - User Merge Logic (DEPRECATED - endpoint only uses User collection now)', () => {
  let app: any;
  const mockCompanyId = new Types.ObjectId();
  const mockTeamId1 = new Types.ObjectId();
  const mockTeamId2 = new Types.ObjectId();

  beforeEach(async () => {
    vi.clearAllMocks();

    // Setup Fastify app
    app = Fastify({ logger: false }).withTypeProvider<ZodTypeProvider>();
    app.setValidatorCompiler(validatorCompiler);

    // Mock auth middleware
    app.decorate('checkAuth0JWT', (req: any, _res: any, next: any) => {
      req.user = {
        company: mockCompanyId,
        role: 'superadmin',
        teams: [],
      };
      next();
    });
    app.decorate('authenticateManage', async (req: any) => {
      req.user = {
        company: mockCompanyId,
        role: 'superadmin',
        teams: [],
      };
    });

    // Register @fastify/express to enable app.use
    await app.register(import('@fastify/express'));

    // Register the router
    await app.register(router, { prefix: '/manage/users' });

    // Start the server
    await app.listen({ port: 0 });
  });

  afterEach(async () => {
    await app.close();
  });

  describe('Edge Case: Invited user role with email not in User collection', () => {
    it('should include invited users from ManageUser who are not in User collection', async () => {
      const invitedUser = {
        _id: new Types.ObjectId(),
        email: 'invited@example.com',
        name: 'Invited User',
        role: 'user',
        status: 'invited',
        teams: [{ _id: mockTeamId1, name: 'Team 1' }],
      };

      // Mock ManageUser.find to return invited user
      (ManageUser.find as any).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        populate: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue([invitedUser]),
        }),
      });

      // Mock User.find to return empty (user not exists)
      (User.find as any).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        populate: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue([]),
        }),
      });

      // Mock getBulkUserStatistics to return empty stats
      (getBulkUserStatistics as any).mockResolvedValue({});

      const response = await request(app.server).get('/manage/users');

      if (response.status !== 200) {
        console.error('Error response:', response.body);
      }

      expect(response.status).toBe(200);
      expect(response.body.users).toHaveLength(1);
      expect(response.body.users[0]).toMatchObject({
        email: 'invited@example.com',
        name: 'Invited User',
        source: 'manageuser',
        isInvited: true,
        totalPractices: 0,
        averageScore: 0,
      });
    });

    it('should NOT include invited users who already exist in User collection', async () => {
      const invitedUser = {
        _id: new Types.ObjectId(),
        email: 'invited@example.com',
        name: 'Invited User',
        role: 'user',
        status: 'invited',
        teams: [{ _id: mockTeamId1, name: 'Team 1' }],
      };

      const existingUser = {
        _id: new Types.ObjectId(),
        email: 'invited@example.com',
        name: 'Existing User',
        teams: [{ _id: mockTeamId1, name: 'Team 1' }],
      };

      // Mock ManageUser.find to return invited user
      (ManageUser.find as any).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        populate: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue([invitedUser]),
        }),
      });

      // Mock User.find to return existing user with same email
      (User.find as any).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        populate: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue([existingUser]),
        }),
      });

      // Mock getBulkUserStatistics
      (getBulkUserStatistics as any).mockResolvedValue({
        [existingUser._id.toString()]: {
          totalPractices: 5,
          averageScore: 85,
          averageDurationMinutes: 10,
          averageDurationSeconds: 600,
          lastSessionDate: new Date(),
        },
      });

      const response = await request(app.server)
        .get('/manage/users')
        .expect(200);

      // Should only have 1 user (from User collection, not ManageUser)
      expect(response.body.users).toHaveLength(1);
      expect(response.body.users[0]).toMatchObject({
        email: 'invited@example.com',
        name: 'Existing User',
        source: 'user',
        totalPractices: 5,
      });
    });
  });

  describe('Edge Case: Admin/Superadmin role with email in User collection', () => {
    it('should use User data with statistics for admin who exists in User collection', async () => {
      const manageAdmin = {
        _id: new Types.ObjectId(),
        email: 'admin@example.com',
        name: 'Admin from ManageUser',
        role: 'admin',
        status: 'active',
        teams: [{ _id: mockTeamId1, name: 'Team 1' }],
      };

      const userAdmin = {
        _id: new Types.ObjectId(),
        email: 'admin@example.com',
        name: 'Admin from User',
        teams: [{ _id: mockTeamId1, name: 'Team 1' }],
      };

      // Mock ManageUser.find
      (ManageUser.find as any).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        populate: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue([manageAdmin]),
        }),
      });

      // Mock User.find
      (User.find as any).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        populate: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue([userAdmin]),
        }),
      });

      // Mock getBulkUserStatistics
      (getBulkUserStatistics as any).mockResolvedValue({
        [userAdmin._id.toString()]: {
          totalPractices: 10,
          averageScore: 90,
          averageDurationMinutes: 15,
          averageDurationSeconds: 900,
          lastSessionDate: new Date(),
        },
      });

      const response = await request(app.server)
        .get('/manage/users')
        .expect(200);

      expect(response.body.users).toHaveLength(1);
      expect(response.body.users[0]).toMatchObject({
        email: 'admin@example.com',
        name: 'Admin from User',
        source: 'user',
        totalPractices: 10,
        averageScore: 90,
      });
    });
  });

  describe('Edge Case: Admin/Superadmin role with email NOT in User collection', () => {
    it('should include admin from ManageUser with empty statistics', async () => {
      const manageAdmin = {
        _id: new Types.ObjectId(),
        email: 'newadmin@example.com',
        name: 'New Admin',
        role: 'admin',
        status: 'active',
        teams: [{ _id: mockTeamId1, name: 'Team 1' }],
      };

      // Mock ManageUser.find to return admin
      (ManageUser.find as any).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        populate: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue([manageAdmin]),
        }),
      });

      // Mock User.find to return empty
      (User.find as any).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        populate: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue([]),
        }),
      });

      // Mock getBulkUserStatistics
      (getBulkUserStatistics as any).mockResolvedValue({});

      const response = await request(app.server)
        .get('/manage/users')
        .expect(200);

      expect(response.body.users).toHaveLength(1);
      expect(response.body.users[0]).toMatchObject({
        email: 'newadmin@example.com',
        name: 'New Admin',
        source: 'manageuser',
        isAdmin: true,
        totalPractices: 0,
        averageScore: 0,
      });
    });

    it('should include superadmin from ManageUser with empty statistics', async () => {
      const manageSuperadmin = {
        _id: new Types.ObjectId(),
        email: 'newsuperadmin@example.com',
        name: 'New Superadmin',
        role: 'superadmin',
        status: 'active',
        teams: [{ _id: mockTeamId1, name: 'Team 1' }],
      };

      // Mock ManageUser.find to return superadmin
      (ManageUser.find as any).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        populate: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue([manageSuperadmin]),
        }),
      });

      // Mock User.find to return empty
      (User.find as any).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        populate: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue([]),
        }),
      });

      // Mock getBulkUserStatistics
      (getBulkUserStatistics as any).mockResolvedValue({});

      const response = await request(app.server)
        .get('/manage/users')
        .expect(200);

      expect(response.body.users).toHaveLength(1);
      expect(response.body.users[0]).toMatchObject({
        email: 'newsuperadmin@example.com',
        name: 'New Superadmin',
        source: 'manageuser',
        isAdmin: true,
        totalPractices: 0,
        averageScore: 0,
      });
    });
  });

  describe('Teams filtering', () => {
    it('should filter users by teams from ManageUser', async () => {
      const manageUser1 = {
        _id: new Types.ObjectId(),
        email: 'user1@example.com',
        name: 'User 1',
        role: 'user',
        status: 'invited',
        teams: [{ _id: mockTeamId1, name: 'Team 1' }],
      };

      const manageUser2 = {
        _id: new Types.ObjectId(),
        email: 'user2@example.com',
        name: 'User 2',
        role: 'user',
        status: 'invited',
        teams: [{ _id: mockTeamId2, name: 'Team 2' }],
      };

      // Mock ManageUser.find to return both users
      (ManageUser.find as any).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        populate: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue([manageUser1, manageUser2]),
        }),
      });

      // Mock User.find to return empty
      (User.find as any).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        populate: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue([]),
        }),
      });

      // Mock getBulkUserStatistics
      (getBulkUserStatistics as any).mockResolvedValue({});

      const response = await request(app.server)
        .get('/manage/users')
        .query({ teams: [mockTeamId1.toString()] })
        .expect(200);

      // Should only return user1 who is in Team 1
      expect(response.body.users).toHaveLength(1);
      expect(response.body.users[0].email).toBe('user1@example.com');
    });

    // This test requires a separate app instance with admin role
    it.skip('should use admin user teams when no teams query param provided', async () => {
      // TODO: This test needs to be rewritten to create a new app instance with admin user
      // Cannot override decorators after app has started
    });

    it('should show all users for superadmin without teams query param', async () => {
      const manageUser1 = {
        _id: new Types.ObjectId(),
        email: 'user1@example.com',
        name: 'User 1',
        role: 'user',
        status: 'invited',
        teams: [{ _id: mockTeamId1, name: 'Team 1' }],
      };

      const manageUser2 = {
        _id: new Types.ObjectId(),
        email: 'user2@example.com',
        name: 'User 2',
        role: 'user',
        status: 'invited',
        teams: [{ _id: mockTeamId2, name: 'Team 2' }],
      };

      // Mock ManageUser.find to return both users
      (ManageUser.find as any).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        populate: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue([manageUser1, manageUser2]),
        }),
      });

      // Mock User.find to return empty
      (User.find as any).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        populate: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue([]),
        }),
      });

      // Mock getBulkUserStatistics
      (getBulkUserStatistics as any).mockResolvedValue({});

      const response = await request(app.server)
        .get('/manage/users')
        .expect(200);

      // Should return both users for superadmin (default user in beforeEach)
      expect(response.body.users).toHaveLength(2);
    });
  });

  describe('Search functionality', () => {
    it('should search by name in merged results', async () => {
      const manageUser1 = {
        _id: new Types.ObjectId(),
        email: 'john@example.com',
        name: 'John Doe',
        role: 'admin',
        status: 'active',
        teams: [{ _id: mockTeamId1, name: 'Team 1' }],
      };

      const manageUser2 = {
        _id: new Types.ObjectId(),
        email: 'jane@example.com',
        name: 'Jane Smith',
        role: 'admin',
        status: 'active',
        teams: [{ _id: mockTeamId1, name: 'Team 1' }],
      };

      // Mock ManageUser.find to return both users (search applied in query)
      (ManageUser.find as any).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        populate: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue([manageUser1]),
        }),
      });

      // Mock User.find to return empty
      (User.find as any).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        populate: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue([]),
        }),
      });

      // Mock getBulkUserStatistics
      (getBulkUserStatistics as any).mockResolvedValue({});

      const response = await request(app.server)
        .get('/manage/users')
        .query({ search: 'john' })
        .expect(200);

      expect(response.body.users).toHaveLength(1);
      expect(response.body.users[0].name).toBe('John Doe');
    });

    it('should search by email in merged results', async () => {
      const manageUser = {
        _id: new Types.ObjectId(),
        email: 'test@example.com',
        name: 'Test User',
        role: 'admin',
        status: 'active',
        teams: [{ _id: mockTeamId1, name: 'Team 1' }],
      };

      // Mock ManageUser.find (search applied in query)
      (ManageUser.find as any).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        populate: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue([manageUser]),
        }),
      });

      // Mock User.find to return empty
      (User.find as any).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        populate: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue([]),
        }),
      });

      // Mock getBulkUserStatistics
      (getBulkUserStatistics as any).mockResolvedValue({});

      const response = await request(app.server)
        .get('/manage/users')
        .query({ search: 'test@example' })
        .expect(200);

      expect(response.body.users).toHaveLength(1);
      expect(response.body.users[0].email).toBe('test@example.com');
    });
  });

  describe('Pagination', () => {
    it('should paginate merged results correctly', async () => {
      const users = Array.from({ length: 15 }, (_, i) => ({
        _id: new Types.ObjectId(),
        email: `user${i}@example.com`,
        name: `User ${i}`,
        teams: [{ _id: mockTeamId1, name: 'Team 1' }],
      }));

      // Mock ManageUser.find to return empty
      (ManageUser.find as any).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        populate: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue([]),
        }),
      });

      // Mock User.find to return 15 users
      (User.find as any).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        populate: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue(users),
        }),
      });

      // Mock getBulkUserStatistics
      (getBulkUserStatistics as any).mockResolvedValue({});

      const response = await request(app.server)
        .get('/manage/users')
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body.users).toHaveLength(10);
      expect(response.body.pagination).toMatchObject({
        currentPage: 1,
        totalPages: 2,
        totalUsers: 15,
        limit: 10,
        hasNextPage: true,
        hasPrevPage: false,
      });

      const response2 = await request(app.server)
        .get('/manage/users')
        .query({ page: 2, limit: 10 })
        .expect(200);

      expect(response2.body.users).toHaveLength(5);
      expect(response2.body.pagination).toMatchObject({
        currentPage: 2,
        totalPages: 2,
        totalUsers: 15,
        limit: 10,
        hasNextPage: false,
        hasPrevPage: true,
      });
    });
  });

  describe('Mixed scenarios', () => {
    it('should handle a mix of User, invited ManageUser, and admin ManageUser', async () => {
      const regularUser = {
        _id: new Types.ObjectId(),
        email: 'regular@example.com',
        name: 'Regular User',
        teams: [{ _id: mockTeamId1, name: 'Team 1' }],
      };

      const invitedManageUser = {
        _id: new Types.ObjectId(),
        email: 'invited@example.com',
        name: 'Invited User',
        role: 'user',
        status: 'invited',
        teams: [{ _id: mockTeamId1, name: 'Team 1' }],
      };

      const adminManageUser = {
        _id: new Types.ObjectId(),
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'admin',
        status: 'active',
        teams: [{ _id: mockTeamId1, name: 'Team 1' }],
      };

      // Mock ManageUser.find
      (ManageUser.find as any).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        populate: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue([invitedManageUser, adminManageUser]),
        }),
      });

      // Mock User.find
      (User.find as any).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        populate: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue([regularUser]),
        }),
      });

      // Mock getBulkUserStatistics
      (getBulkUserStatistics as any).mockResolvedValue({
        [regularUser._id.toString()]: {
          totalPractices: 5,
          averageScore: 80,
          averageDurationMinutes: 10,
          averageDurationSeconds: 600,
          lastSessionDate: new Date(),
        },
      });

      const response = await request(app.server)
        .get('/manage/users')
        .expect(200);

      expect(response.body.users).toHaveLength(3);

      // Check regular user
      const regularUserResult = response.body.users.find(
        (u: any) => u.email === 'regular@example.com',
      );
      expect(regularUserResult).toMatchObject({
        source: 'user',
        totalPractices: 5,
      });

      // Check invited user
      const invitedUserResult = response.body.users.find(
        (u: any) => u.email === 'invited@example.com',
      );
      expect(invitedUserResult).toMatchObject({
        source: 'manageuser',
        isInvited: true,
        totalPractices: 0,
      });

      // Check admin user
      const adminUserResult = response.body.users.find(
        (u: any) => u.email === 'admin@example.com',
      );
      expect(adminUserResult).toMatchObject({
        source: 'manageuser',
        isAdmin: true,
        totalPractices: 0,
      });
    });
  });

  describe('Regression tests', () => {
    it('should not duplicate users when they exist in both collections', async () => {
      const userInBoth = {
        _id: new Types.ObjectId(),
        email: 'both@example.com',
        name: 'User in Both',
        teams: [{ _id: mockTeamId1, name: 'Team 1' }],
      };

      const manageUserSame = {
        _id: new Types.ObjectId(),
        email: 'both@example.com',
        name: 'Manage User Same Email',
        role: 'admin',
        status: 'active',
        teams: [{ _id: mockTeamId1, name: 'Team 1' }],
      };

      // Mock ManageUser.find
      (ManageUser.find as any).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        populate: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue([manageUserSame]),
        }),
      });

      // Mock User.find
      (User.find as any).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        populate: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue([userInBoth]),
        }),
      });

      // Mock getBulkUserStatistics
      (getBulkUserStatistics as any).mockResolvedValue({
        [userInBoth._id.toString()]: {
          totalPractices: 3,
          averageScore: 75,
          averageDurationMinutes: 8,
          averageDurationSeconds: 480,
          lastSessionDate: new Date(),
        },
      });

      const response = await request(app.server)
        .get('/manage/users')
        .expect(200);

      // Should only have 1 user, not 2
      expect(response.body.users).toHaveLength(1);
      expect(response.body.users[0]).toMatchObject({
        email: 'both@example.com',
        name: 'User in Both', // Should prefer User collection
        source: 'user',
        totalPractices: 3,
      });
    });

    it('should handle case-insensitive email matching', async () => {
      const userLower = {
        _id: new Types.ObjectId(),
        email: 'test@example.com',
        name: 'User Lowercase',
        teams: [{ _id: mockTeamId1, name: 'Team 1' }],
      };

      const manageUserUpper = {
        _id: new Types.ObjectId(),
        email: 'TEST@EXAMPLE.COM',
        name: 'Manage User Uppercase',
        role: 'admin',
        status: 'active',
        teams: [{ _id: mockTeamId1, name: 'Team 1' }],
      };

      // Mock ManageUser.find
      (ManageUser.find as any).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        populate: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue([manageUserUpper]),
        }),
      });

      // Mock User.find
      (User.find as any).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        populate: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue([userLower]),
        }),
      });

      // Mock getBulkUserStatistics
      (getBulkUserStatistics as any).mockResolvedValue({
        [userLower._id.toString()]: {
          totalPractices: 2,
          averageScore: 70,
          averageDurationMinutes: 5,
          averageDurationSeconds: 300,
          lastSessionDate: new Date(),
        },
      });

      const response = await request(app.server)
        .get('/manage/users')
        .expect(200);

      // Should only have 1 user (case-insensitive matching)
      expect(response.body.users).toHaveLength(1);
      expect(response.body.users[0].source).toBe('user');
    });

    it('should handle users with null or undefined emails gracefully', async () => {
      const validUser = {
        _id: new Types.ObjectId(),
        email: 'valid@example.com',
        name: 'Valid User',
        teams: [{ _id: mockTeamId1, name: 'Team 1' }],
      };

      const userNoEmail = {
        _id: new Types.ObjectId(),
        email: null,
        name: 'User No Email',
        teams: [{ _id: mockTeamId1, name: 'Team 1' }],
      };

      // Mock ManageUser.find
      (ManageUser.find as any).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        populate: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue([]),
        }),
      });

      // Mock User.find
      (User.find as any).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        populate: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue([validUser, userNoEmail]),
        }),
      });

      // Mock getBulkUserStatistics
      (getBulkUserStatistics as any).mockResolvedValue({});

      const response = await request(app.server)
        .get('/manage/users')
        .expect(200);

      // Should only include user with valid email
      expect(response.body.users).toHaveLength(1);
      expect(response.body.users[0].email).toBe('valid@example.com');
    });
  });
});

describe('GET /manage/users - Status Grouping and Sorting', () => {
  let app: any;
  const mockCompanyId = new Types.ObjectId();
  const mockTeamId1 = new Types.ObjectId();

  beforeEach(async () => {
    vi.clearAllMocks();

    // Setup Fastify app
    app = Fastify({ logger: false }).withTypeProvider<ZodTypeProvider>();
    app.setValidatorCompiler(validatorCompiler);

    // Mock auth middleware
    app.decorate('checkAuth0JWT', (req: any, _res: any, next: any) => {
      req.user = {
        company: mockCompanyId,
        role: 'superadmin',
        teams: [],
      };
      next();
    });
    app.decorate('authenticateManage', async (req: any) => {
      req.user = {
        company: mockCompanyId,
        role: 'superadmin',
        teams: [],
      };
    });

    // Register @fastify/express to enable app.use
    await app.register(import('@fastify/express'));

    // Register the router
    await app.register(router, { prefix: '/manage/users' });

    // Start the server
    await app.listen({ port: 0 });
  });

  afterEach(async () => {
    await app.close();
  });

  it('should group users by status (active first, inactive second)', async () => {
    const activeUser1 = {
      _id: new Types.ObjectId(),
      email: 'zactive@example.com',
      name: 'Z Active User',
      status: 'active',
      teams: [{ _id: mockTeamId1, name: 'Team 1' }],
    };

    const activeUser2 = {
      _id: new Types.ObjectId(),
      email: 'aactive@example.com',
      name: 'A Active User',
      status: 'active',
      teams: [{ _id: mockTeamId1, name: 'Team 1' }],
    };

    const inactiveUser1 = {
      _id: new Types.ObjectId(),
      email: 'zinactive@example.com',
      name: 'Z Inactive User',
      status: 'inactive',
      teams: [{ _id: mockTeamId1, name: 'Team 1' }],
    };

    const inactiveUser2 = {
      _id: new Types.ObjectId(),
      email: 'ainactive@example.com',
      name: 'A Inactive User',
      status: 'inactive',
      teams: [{ _id: mockTeamId1, name: 'Team 1' }],
    };

    // Mock User.countDocuments
    (User.countDocuments as any).mockResolvedValue(4);

    // Mock User.find to return users in random order
    (User.find as any).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      skip: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      populate: vi.fn().mockReturnThis(),
      lean: vi
        .fn()
        .mockResolvedValue([
          inactiveUser1,
          activeUser1,
          inactiveUser2,
          activeUser2,
        ]),
    });

    // Mock getBulkUserStatistics
    (getBulkUserStatistics as any).mockResolvedValue({});

    const response = await request(app.server).get('/manage/users').expect(200);

    expect(response.body.users).toHaveLength(4);

    // Verify active users come first
    expect(response.body.users[0].status).toBe('active');
    expect(response.body.users[1].status).toBe('active');
    expect(response.body.users[2].status).toBe('inactive');
    expect(response.body.users[3].status).toBe('inactive');

    // Verify sorting by email within each group
    expect(response.body.users[0].email).toBe('aactive@example.com');
    expect(response.body.users[1].email).toBe('zactive@example.com');
    expect(response.body.users[2].email).toBe('ainactive@example.com');
    expect(response.body.users[3].email).toBe('zinactive@example.com');
  });

  it('should sort by email ascending within status groups', async () => {
    const users = [
      {
        _id: new Types.ObjectId(),
        email: 'charlie@example.com',
        name: 'Charlie',
        status: 'active',
        teams: [{ _id: mockTeamId1, name: 'Team 1' }],
      },
      {
        _id: new Types.ObjectId(),
        email: 'alice@example.com',
        name: 'Alice',
        status: 'active',
        teams: [{ _id: mockTeamId1, name: 'Team 1' }],
      },
      {
        _id: new Types.ObjectId(),
        email: 'bob@example.com',
        name: 'Bob',
        status: 'active',
        teams: [{ _id: mockTeamId1, name: 'Team 1' }],
      },
    ];

    // Mock User.countDocuments
    (User.countDocuments as any).mockResolvedValue(3);

    // Mock User.find
    (User.find as any).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      skip: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      populate: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue(users),
    });

    // Mock getBulkUserStatistics
    (getBulkUserStatistics as any).mockResolvedValue({});

    const response = await request(app.server).get('/manage/users').expect(200);

    expect(response.body.users).toHaveLength(3);
    expect(response.body.users[0].email).toBe('alice@example.com');
    expect(response.body.users[1].email).toBe('bob@example.com');
    expect(response.body.users[2].email).toBe('charlie@example.com');
  });

  it('should include status field in response for each user', async () => {
    const activeUser = {
      _id: new Types.ObjectId(),
      email: 'active@example.com',
      name: 'Active User',
      status: 'active',
      teams: [{ _id: mockTeamId1, name: 'Team 1' }],
    };

    const inactiveUser = {
      _id: new Types.ObjectId(),
      email: 'inactive@example.com',
      name: 'Inactive User',
      status: 'inactive',
      teams: [{ _id: mockTeamId1, name: 'Team 1' }],
    };

    // Mock User.countDocuments
    (User.countDocuments as any).mockResolvedValue(2);

    // Mock User.find
    (User.find as any).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      skip: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      populate: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue([activeUser, inactiveUser]),
    });

    // Mock getBulkUserStatistics
    (getBulkUserStatistics as any).mockResolvedValue({});

    const response = await request(app.server).get('/manage/users').expect(200);

    expect(response.body.users).toHaveLength(2);
    expect(response.body.users[0]).toHaveProperty('status');
    expect(response.body.users[0].status).toBe('active');
    expect(response.body.users[1]).toHaveProperty('status');
    expect(response.body.users[1].status).toBe('inactive');
  });

  it('should handle users with invited status', async () => {
    const activeUser = {
      _id: new Types.ObjectId(),
      email: 'active@example.com',
      name: 'Active User',
      status: 'active',
      teams: [{ _id: mockTeamId1, name: 'Team 1' }],
    };

    const invitedUser = {
      _id: new Types.ObjectId(),
      email: 'invited@example.com',
      name: 'Invited User',
      status: 'invited',
      teams: [{ _id: mockTeamId1, name: 'Team 1' }],
    };

    const inactiveUser = {
      _id: new Types.ObjectId(),
      email: 'inactive@example.com',
      name: 'Inactive User',
      status: 'inactive',
      teams: [{ _id: mockTeamId1, name: 'Team 1' }],
    };

    // Mock User.countDocuments
    (User.countDocuments as any).mockResolvedValue(3);

    // Mock User.find
    (User.find as any).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      skip: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      populate: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue([inactiveUser, invitedUser, activeUser]),
    });

    // Mock getBulkUserStatistics
    (getBulkUserStatistics as any).mockResolvedValue({});

    const response = await request(app.server).get('/manage/users').expect(200);

    expect(response.body.users).toHaveLength(3);

    // Non-inactive users (active, invited) should come first, sorted by email
    expect(response.body.users[0].status).toBe('active');
    expect(response.body.users[0].email).toBe('active@example.com');

    expect(response.body.users[1].status).toBe('invited');
    expect(response.body.users[1].email).toBe('invited@example.com');

    // Inactive users should come last
    expect(response.body.users[2].status).toBe('inactive');
    expect(response.body.users[2].email).toBe('inactive@example.com');
  });

  it('should maintain status grouping and sorting with pagination', async () => {
    const users = [
      {
        _id: new Types.ObjectId(),
        email: 'b-active@example.com',
        name: 'B Active',
        status: 'active',
        teams: [{ _id: mockTeamId1, name: 'Team 1' }],
      },
      {
        _id: new Types.ObjectId(),
        email: 'a-active@example.com',
        name: 'A Active',
        status: 'active',
        teams: [{ _id: mockTeamId1, name: 'Team 1' }],
      },
      {
        _id: new Types.ObjectId(),
        email: 'c-inactive@example.com',
        name: 'C Inactive',
        status: 'inactive',
        teams: [{ _id: mockTeamId1, name: 'Team 1' }],
      },
    ];

    // Mock User.countDocuments
    (User.countDocuments as any).mockResolvedValue(3);

    // Mock User.find (pagination applies before sorting)
    (User.find as any).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      skip: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      populate: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue(users),
    });

    // Mock getBulkUserStatistics
    (getBulkUserStatistics as any).mockResolvedValue({});

    const response = await request(app.server)
      .get('/manage/users')
      .query({ page: 1, limit: 10 })
      .expect(200);

    expect(response.body.users).toHaveLength(3);
    // Verify active users come first, sorted by email
    expect(response.body.users[0].email).toBe('a-active@example.com');
    expect(response.body.users[1].email).toBe('b-active@example.com');
    expect(response.body.users[2].email).toBe('c-inactive@example.com');
  });
});

describe('GET /manage/users - Status Filter', () => {
  let app: any;
  const mockCompanyId = new Types.ObjectId();
  const mockTeamId1 = new Types.ObjectId();

  beforeEach(async () => {
    vi.clearAllMocks();

    // Setup Fastify app
    app = Fastify({ logger: false }).withTypeProvider<ZodTypeProvider>();
    app.setValidatorCompiler(validatorCompiler);

    // Mock auth middleware
    app.decorate('checkAuth0JWT', (req: any, _res: any, next: any) => {
      req.user = {
        company: mockCompanyId,
        role: 'superadmin',
        teams: [],
      };
      next();
    });
    app.decorate('authenticateManage', async (req: any) => {
      req.user = {
        company: mockCompanyId,
        role: 'superadmin',
        teams: [],
      };
    });

    // Register @fastify/express to enable app.use
    await app.register(import('@fastify/express'));

    // Register the router
    await app.register(router, { prefix: '/manage/users' });

    // Start the server
    await app.listen({ port: 0 });
  });

  afterEach(async () => {
    await app.close();
  });

  it('should filter users by status=active (status in [active, null])', async () => {
    const activeUser1 = {
      _id: new Types.ObjectId(),
      email: 'active1@example.com',
      name: 'Active User 1',
      status: 'active',
      teams: [{ _id: mockTeamId1, name: 'Team 1' }],
    };

    const invitedUser = {
      _id: new Types.ObjectId(),
      email: 'invited@example.com',
      name: 'Invited User',
      status: 'invited',
      teams: [{ _id: mockTeamId1, name: 'Team 1' }],
    };

    // Mock User.countDocuments
    (User.countDocuments as any).mockResolvedValue(2);

    // Mock User.find to return users where status in ['active', null]
    (User.find as any).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      skip: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      populate: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue([activeUser1, invitedUser]),
    });

    // Mock getBulkUserStatistics
    (getBulkUserStatistics as any).mockResolvedValue({});

    const response = await request(app.server)
      .get('/manage/users')
      .query({ status: 'active' })
      .expect(200);

    expect(response.body.users).toHaveLength(2);
    expect(response.body.users[0].status).toBe('active');
    expect(response.body.users[1].status).toBe('invited');

    // Verify User.find was called with status $in ['active', null] filter
    expect(User.find).toHaveBeenCalledWith(
      expect.objectContaining({
        status: { $in: ['active', null] },
      }),
    );
  });

  it('should filter users by status=inactive', async () => {
    const inactiveUser1 = {
      _id: new Types.ObjectId(),
      email: 'inactive1@example.com',
      name: 'Inactive User 1',
      status: 'inactive',
      teams: [{ _id: mockTeamId1, name: 'Team 1' }],
    };

    const inactiveUser2 = {
      _id: new Types.ObjectId(),
      email: 'inactive2@example.com',
      name: 'Inactive User 2',
      status: 'inactive',
      teams: [{ _id: mockTeamId1, name: 'Team 1' }],
    };

    // Mock User.countDocuments
    (User.countDocuments as any).mockResolvedValue(2);

    // Mock User.find to return only inactive users
    (User.find as any).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      skip: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      populate: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue([inactiveUser1, inactiveUser2]),
    });

    // Mock getBulkUserStatistics
    (getBulkUserStatistics as any).mockResolvedValue({});

    const response = await request(app.server)
      .get('/manage/users')
      .query({ status: 'inactive' })
      .expect(200);

    expect(response.body.users).toHaveLength(2);
    expect(response.body.users[0].status).toBe('inactive');
    expect(response.body.users[1].status).toBe('inactive');

    // Verify User.find was called with status filter
    expect(User.find).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'inactive',
      }),
    );
  });

  it('should exclude invited users when no status filter is provided', async () => {
    const activeUser = {
      _id: new Types.ObjectId(),
      email: 'active@example.com',
      name: 'Active User',
      status: 'active',
      teams: [{ _id: mockTeamId1, name: 'Team 1' }],
    };

    const inactiveUser = {
      _id: new Types.ObjectId(),
      email: 'inactive@example.com',
      name: 'Inactive User',
      status: 'inactive',
      teams: [{ _id: mockTeamId1, name: 'Team 1' }],
    };

    // Mock User.countDocuments
    (User.countDocuments as any).mockResolvedValue(2);

    // Mock User.find to return all users
    (User.find as any).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      skip: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      populate: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue([activeUser, inactiveUser]),
    });

    // Mock getBulkUserStatistics
    (getBulkUserStatistics as any).mockResolvedValue({});

    const response = await request(app.server).get('/manage/users').expect(200);

    expect(response.body.users).toHaveLength(2);

    // Verify User.find was called with status $nin ['invited'] filter (default excludes invited)
    expect(User.find).toHaveBeenCalledWith(
      expect.objectContaining({
        status: { $nin: ['invited'] },
      }),
    );
  });

  it('should combine status filter with other filters (teams and search)', async () => {
    const activeUser = {
      _id: new Types.ObjectId(),
      email: 'john@example.com',
      name: 'John Active',
      status: 'active',
      teams: [{ _id: mockTeamId1, name: 'Team 1' }],
    };

    // Mock User.countDocuments
    (User.countDocuments as any).mockResolvedValue(1);

    // Mock User.find
    (User.find as any).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      skip: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      populate: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue([activeUser]),
    });

    // Mock getBulkUserStatistics
    (getBulkUserStatistics as any).mockResolvedValue({});

    const response = await request(app.server)
      .get('/manage/users')
      .query({
        status: 'active',
        search: 'john',
        teams: [mockTeamId1.toString()],
      })
      .expect(200);

    expect(response.body.users).toHaveLength(1);
    expect(response.body.users[0].status).toBe('active');
    expect(response.body.users[0].name).toBe('John Active');

    // Verify User.find was called with all filters
    expect(User.find).toHaveBeenCalledWith(
      expect.objectContaining({
        status: { $in: ['active', null] },
        teams: { $in: [mockTeamId1.toString()] },
        $or: expect.any(Array),
      }),
    );
  });
});

describe('GET /manage/users - Module Filtering for totalPractices', () => {
  let app: any;
  const mockCompanyId = new Types.ObjectId();
  const mockTeamId1 = new Types.ObjectId();

  beforeEach(async () => {
    vi.clearAllMocks();

    // Setup Fastify app
    app = Fastify({ logger: false }).withTypeProvider<ZodTypeProvider>();
    app.setValidatorCompiler(validatorCompiler);

    // Mock auth middleware
    app.decorate('checkAuth0JWT', (req: any, _res: any, next: any) => {
      req.user = {
        company: mockCompanyId,
        role: 'superadmin',
        teams: [],
      };
      next();
    });
    app.decorate('authenticateManage', async (req: any) => {
      req.user = {
        company: mockCompanyId,
        role: 'superadmin',
        teams: [],
      };
    });

    // Register @fastify/express to enable app.use
    await app.register(import('@fastify/express'));

    // Register the router
    await app.register(router, { prefix: '/manage/users' });

    // Start the server
    await app.listen({ port: 0 });
  });

  afterEach(async () => {
    await app.close();
  });

  it('should NOT filter users with totalPractices === 0 when module is "all"', async () => {
    const user1 = {
      _id: new Types.ObjectId(),
      email: 'user1@example.com',
      name: 'User One',
      status: 'active',
      teams: [{ _id: mockTeamId1, name: 'Team 1' }],
    };

    const user2 = {
      _id: new Types.ObjectId(),
      email: 'user2@example.com',
      name: 'User Two',
      status: 'active',
      teams: [{ _id: mockTeamId1, name: 'Team 1' }],
    };

    // Mock User.find
    (User.find as any).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      populate: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue([user1, user2]),
    });

    // Mock getBulkUserStatistics - user1 has practices, user2 does not
    (getBulkUserStatistics as any).mockResolvedValue({
      [user1._id.toString()]: {
        totalPractices: 5,
        averageDurationMinutes: 10,
        averageDurationSeconds: 600,
        averageScore: 85,
        lastSessionDate: new Date(),
      },
      [user2._id.toString()]: {
        totalPractices: 0,
        averageDurationMinutes: 0,
        averageDurationSeconds: 0,
        averageScore: 0,
        lastSessionDate: null,
      },
    });

    const response = await request(app.server)
      .get('/manage/users')
      .query({ module: 'all' })
      .expect(200);

    // Should include both users when module is "all"
    expect(response.body.users).toHaveLength(2);
    expect(response.body.pagination.totalUsers).toBe(2);

    const userIds = response.body.users.map((u: any) => u.id);
    expect(userIds).toContain(user1._id.toString());
    expect(userIds).toContain(user2._id.toString());
  });

  it('should NOT filter users with totalPractices === 0 when module is not provided', async () => {
    const user1 = {
      _id: new Types.ObjectId(),
      email: 'user1@example.com',
      name: 'User One',
      status: 'active',
      teams: [{ _id: mockTeamId1, name: 'Team 1' }],
    };

    const user2 = {
      _id: new Types.ObjectId(),
      email: 'user2@example.com',
      name: 'User Two',
      status: 'active',
      teams: [{ _id: mockTeamId1, name: 'Team 1' }],
    };

    // Mock User.find
    (User.find as any).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      populate: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue([user1, user2]),
    });

    // Mock getBulkUserStatistics
    (getBulkUserStatistics as any).mockResolvedValue({
      [user1._id.toString()]: {
        totalPractices: 3,
        averageDurationMinutes: 8,
        averageDurationSeconds: 480,
        averageScore: 75,
        lastSessionDate: new Date(),
      },
      [user2._id.toString()]: {
        totalPractices: 0,
        averageDurationMinutes: 0,
        averageDurationSeconds: 0,
        averageScore: 0,
        lastSessionDate: null,
      },
    });

    const response = await request(app.server).get('/manage/users').expect(200);

    // Should include both users when module is not provided
    expect(response.body.users).toHaveLength(2);
    expect(response.body.pagination.totalUsers).toBe(2);
  });

  it('should filter out users with totalPractices === 0 when a specific module is selected', async () => {
    const user1 = {
      _id: new Types.ObjectId(),
      email: 'user1@example.com',
      name: 'User One',
      status: 'active',
      teams: [{ _id: mockTeamId1, name: 'Team 1' }],
    };

    const user2 = {
      _id: new Types.ObjectId(),
      email: 'user2@example.com',
      name: 'User Two',
      status: 'active',
      teams: [{ _id: mockTeamId1, name: 'Team 1' }],
    };

    const user3 = {
      _id: new Types.ObjectId(),
      email: 'user3@example.com',
      name: 'User Three',
      status: 'active',
      teams: [{ _id: mockTeamId1, name: 'Team 1' }],
    };

    // Mock User.find
    (User.find as any).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      populate: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue([user1, user2, user3]),
    });

    // Mock getBulkUserStatistics - user1 has practices, user2 has none, user3 has practices
    (getBulkUserStatistics as any).mockResolvedValue({
      [user1._id.toString()]: {
        totalPractices: 5,
        averageDurationMinutes: 10,
        averageDurationSeconds: 600,
        averageScore: 85,
        lastSessionDate: new Date(),
      },
      [user2._id.toString()]: {
        totalPractices: 0,
        averageDurationMinutes: 0,
        averageDurationSeconds: 0,
        averageScore: 0,
        lastSessionDate: null,
      },
      [user3._id.toString()]: {
        totalPractices: 2,
        averageDurationMinutes: 7,
        averageDurationSeconds: 420,
        averageScore: 90,
        lastSessionDate: new Date(),
      },
    });

    const response = await request(app.server)
      .get('/manage/users')
      .query({ module: 'specific-module-id' })
      .expect(200);

    // Should only include users with totalPractices > 0
    expect(response.body.users).toHaveLength(2);
    expect(response.body.pagination.totalUsers).toBe(2);

    // Verify the filtered users are the ones with practices
    const userIds = response.body.users.map((u: any) => u.id);
    expect(userIds).toContain(user1._id.toString());
    expect(userIds).toContain(user3._id.toString());
    expect(userIds).not.toContain(user2._id.toString());
  });

  it('should return empty array when all users have totalPractices === 0 for a specific module', async () => {
    const user1 = {
      _id: new Types.ObjectId(),
      email: 'user1@example.com',
      name: 'User One',
      status: 'active',
      teams: [{ _id: mockTeamId1, name: 'Team 1' }],
    };

    const user2 = {
      _id: new Types.ObjectId(),
      email: 'user2@example.com',
      name: 'User Two',
      status: 'active',
      teams: [{ _id: mockTeamId1, name: 'Team 1' }],
    };

    // Mock User.find
    (User.find as any).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      populate: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue([user1, user2]),
    });

    // Mock getBulkUserStatistics - both users have no practices
    (getBulkUserStatistics as any).mockResolvedValue({
      [user1._id.toString()]: {
        totalPractices: 0,
        averageDurationMinutes: 0,
        averageDurationSeconds: 0,
        averageScore: 0,
        lastSessionDate: null,
      },
      [user2._id.toString()]: {
        totalPractices: 0,
        averageDurationMinutes: 0,
        averageDurationSeconds: 0,
        averageScore: 0,
        lastSessionDate: null,
      },
    });

    const response = await request(app.server)
      .get('/manage/users')
      .query({ module: 'specific-module-id' })
      .expect(200);

    // Should return empty array when all users have no practices
    expect(response.body.users).toHaveLength(0);
    expect(response.body.pagination.totalUsers).toBe(0);
    expect(response.body.pagination.totalPages).toBe(0);
  });

  it('should apply module filter correctly with pagination', async () => {
    // Create 15 users
    const users = Array.from({ length: 15 }, (_, i) => ({
      _id: new Types.ObjectId(),
      email: `user${i + 1}@example.com`,
      name: `User ${i + 1}`,
      status: 'active',
      teams: [{ _id: mockTeamId1, name: 'Team 1' }],
    }));

    // Mock User.find
    (User.find as any).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      populate: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue(users),
    });

    // Mock getBulkUserStatistics - first 10 users have practices, last 5 don't
    const mockStats: Record<string, any> = {};
    users.forEach((user, i) => {
      mockStats[user._id.toString()] = {
        totalPractices: i < 10 ? i + 1 : 0,
        averageDurationMinutes: i < 10 ? 10 : 0,
        averageDurationSeconds: i < 10 ? 600 : 0,
        averageScore: i < 10 ? 80 : 0,
        lastSessionDate: i < 10 ? new Date() : null,
      };
    });

    (getBulkUserStatistics as any).mockResolvedValue(mockStats);

    const response = await request(app.server)
      .get('/manage/users')
      .query({ module: 'specific-module-id', page: 1, limit: 5 })
      .expect(200);

    // Should only count users with practices (10 users)
    expect(response.body.pagination.totalUsers).toBe(10);
    expect(response.body.pagination.totalPages).toBe(2); // 10 users / 5 per page
    expect(response.body.users).toHaveLength(5); // First page should have 5 users

    // All returned users should have totalPractices > 0
    response.body.users.forEach((user: any) => {
      expect(user.totalPractices).toBeGreaterThan(0);
    });
  });

  it('should combine module filter with status and teams filters', async () => {
    const activeUser = {
      _id: new Types.ObjectId(),
      email: 'active@example.com',
      name: 'Active User',
      status: 'active',
      teams: [{ _id: mockTeamId1, name: 'Team 1' }],
    };

    const inactiveUser = {
      _id: new Types.ObjectId(),
      email: 'inactive@example.com',
      name: 'Inactive User',
      status: 'inactive',
      teams: [{ _id: mockTeamId1, name: 'Team 1' }],
    };

    const activeUserNoPractice = {
      _id: new Types.ObjectId(),
      email: 'active-no-practice@example.com',
      name: 'Active No Practice',
      status: 'active',
      teams: [{ _id: mockTeamId1, name: 'Team 1' }],
    };

    // Mock User.find - assuming status filter is applied at DB level
    (User.find as any).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      populate: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue([activeUser, activeUserNoPractice]),
    });

    // Mock getBulkUserStatistics
    (getBulkUserStatistics as any).mockResolvedValue({
      [activeUser._id.toString()]: {
        totalPractices: 5,
        averageDurationMinutes: 10,
        averageDurationSeconds: 600,
        averageScore: 85,
        lastSessionDate: new Date(),
      },
      [activeUserNoPractice._id.toString()]: {
        totalPractices: 0,
        averageDurationMinutes: 0,
        averageDurationSeconds: 0,
        averageScore: 0,
        lastSessionDate: null,
      },
    });

    const response = await request(app.server)
      .get('/manage/users')
      .query({
        module: 'specific-module-id',
        status: 'active',
        teams: [mockTeamId1.toString()],
      })
      .expect(200);

    // Should only return active user with practices
    expect(response.body.users).toHaveLength(1);
    expect(response.body.users[0].id).toBe(activeUser._id.toString());
    expect(response.body.users[0].totalPractices).toBe(5);
  });

  it('should maintain sorting after filtering by module', async () => {
    const userC = {
      _id: new Types.ObjectId(),
      email: 'c@example.com',
      name: 'User C',
      status: 'active',
      teams: [{ _id: mockTeamId1, name: 'Team 1' }],
    };

    const userA = {
      _id: new Types.ObjectId(),
      email: 'a@example.com',
      name: 'User A',
      status: 'active',
      teams: [{ _id: mockTeamId1, name: 'Team 1' }],
    };

    const userB = {
      _id: new Types.ObjectId(),
      email: 'b@example.com',
      name: 'User B',
      status: 'active',
      teams: [{ _id: mockTeamId1, name: 'Team 1' }],
    };

    const userD = {
      _id: new Types.ObjectId(),
      email: 'd@example.com',
      name: 'User D',
      status: 'active',
      teams: [{ _id: mockTeamId1, name: 'Team 1' }],
    };

    // Mock User.find
    (User.find as any).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      populate: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue([userC, userA, userB, userD]),
    });

    // Mock getBulkUserStatistics - userB has no practices
    (getBulkUserStatistics as any).mockResolvedValue({
      [userC._id.toString()]: {
        totalPractices: 3,
        averageDurationMinutes: 10,
        averageDurationSeconds: 600,
        averageScore: 80,
        lastSessionDate: new Date(),
      },
      [userA._id.toString()]: {
        totalPractices: 5,
        averageDurationMinutes: 10,
        averageDurationSeconds: 600,
        averageScore: 85,
        lastSessionDate: new Date(),
      },
      [userB._id.toString()]: {
        totalPractices: 0,
        averageDurationMinutes: 0,
        averageDurationSeconds: 0,
        averageScore: 0,
        lastSessionDate: null,
      },
      [userD._id.toString()]: {
        totalPractices: 1,
        averageDurationMinutes: 5,
        averageDurationSeconds: 300,
        averageScore: 70,
        lastSessionDate: new Date(),
      },
    });

    const response = await request(app.server)
      .get('/manage/users')
      .query({ module: 'specific-module-id' })
      .expect(200);

    // Should have 3 users (excluding userB)
    expect(response.body.users).toHaveLength(3);

    // Should be sorted by email ascending
    expect(response.body.users[0].email).toBe('a@example.com');
    expect(response.body.users[1].email).toBe('c@example.com');
    expect(response.body.users[2].email).toBe('d@example.com');
  });
});
