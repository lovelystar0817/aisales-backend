import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Fastify, { type FastifyRequest, type FastifyReply } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { validatorCompiler } from 'fastify-type-provider-zod';
import { Types } from 'mongoose';
import request from 'supertest';
import router from './success.js';
import { ManageUser } from '../../../models/ManageUser.js';
import { AllowlistManageUser } from '../../../models/AllowlistManageUser.js';
import { User } from '../../../models/User.js';

// Mock the models
vi.mock('../../../models/ManageUser.js', () => ({
  ManageUser: {
    findOne: vi.fn(),
    findOneAndUpdate: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock('../../../models/AllowlistManageUser.js', () => ({
  AllowlistManageUser: {
    findOne: vi.fn(),
    deleteOne: vi.fn(),
  },
}));

vi.mock('../../../models/User.js', () => ({
  User: {
    findOne: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock('../../../jobs/agenda.js', () => ({
  getAgenda: vi.fn(() => ({
    now: vi.fn(),
  })),
}));

vi.mock('../../../utils/constants.js', () => ({
  SLACK_REPORTER_CHANNEL_ID: 'test-channel',
  SLACK_REPORT_TYPES: {
    ADMIN_USER_ONBOARDED_REPORT: 'admin-user-onboarded',
  },
}));

describe('POST /manage/auth/success', () => {
  let app: any;
  const mockCompanyId = new Types.ObjectId();
  const mockUserId = new Types.ObjectId();
  const mockAuth0Id = 'auth0|123456';
  const mockEmail = 'test@example.com';

  beforeEach(async () => {
    // Clear all mocks before each test
    vi.clearAllMocks();

    // Create a fresh Fastify instance with Zod type provider
    app = Fastify({ logger: false }).withTypeProvider<ZodTypeProvider>();
    app.setValidatorCompiler(validatorCompiler);

    // Mock userInfo decorator
    app.decorate('userInfo', {
      getUserInfo: vi.fn().mockResolvedValue({
        data: {
          sub: mockAuth0Id,
          email: mockEmail,
          name: 'Test User',
          picture: 'https://example.com/picture.jpg',
        },
      }),
    });

    // Mock httpErrors decorator with AuthenticationError
    class AuthenticationError extends Error {
      constructor(message: string) {
        super(message);
      }
    }

    app.decorate('httpErrors', {
      unauthorized: (message: string) => new AuthenticationError(message),
    });

    // Mock error handler to match the actual app's error handling
    app.setErrorHandler(
      (error: Error, _request: FastifyRequest, reply: FastifyReply) => {
        if (error instanceof AuthenticationError) {
          return reply.status(401).send({
            ok: false,
            message: error.message,
          });
        }
        return reply.status(500).send({
          ok: false,
          message: error.message,
        });
      },
    );

    // Register @fastify/express
    await app.register(import('@fastify/express'));

    // Register the actual router
    await app.register(router);

    // Start the server on a random available port
    await app.listen({ port: 0 });
  });

  afterEach(async () => {
    await app.close();
  });

  it('should return 401 when user status is "inactive"', async () => {
    const mockUser = {
      _id: mockUserId,
      id: mockUserId.toString(),
      email: mockEmail,
      name: 'Test User',
      auth0Id: mockAuth0Id,
      company: {
        _id: mockCompanyId,
        name: 'Test Company',
      },
      role: 'admin',
      teams: [],
      status: 'inactive',
    };

    // Mock findOne to return user with inactive status
    vi.mocked(ManageUser.findOne).mockReturnValue({
      populate: vi.fn().mockResolvedValue(mockUser),
    } as any);

    const response = await request(app.server)
      .post('/success')
      .set('Authorization', 'Bearer mock-token')
      .send({ auth0_org_id: 'org_123' })
      .expect(401);

    expect(response.body.message).toContain(
      'User account has been deactivated',
    );
  });

  it('should return 401 when user isDeleted is true', async () => {
    const mockUser = {
      _id: mockUserId,
      id: mockUserId.toString(),
      email: mockEmail,
      name: 'Test User',
      auth0Id: mockAuth0Id,
      company: {
        _id: mockCompanyId,
        name: 'Test Company',
      },
      role: 'admin',
      teams: [],
      status: 'active',
      isDeleted: true,
    };

    // Mock findOne to return user with isDeleted true
    vi.mocked(ManageUser.findOne).mockReturnValue({
      populate: vi.fn().mockResolvedValue(mockUser),
    } as any);

    const response = await request(app.server)
      .post('/success')
      .set('Authorization', 'Bearer mock-token')
      .send({ auth0_org_id: 'org_123' })
      .expect(401);

    expect(response.body.message).toContain(
      'User account has been deactivated',
    );
  });

  it('should return 401 when user status is inactive and isDeleted is true', async () => {
    const mockUser = {
      _id: mockUserId,
      id: mockUserId.toString(),
      email: mockEmail,
      name: 'Test User',
      auth0Id: mockAuth0Id,
      company: {
        _id: mockCompanyId,
        name: 'Test Company',
      },
      role: 'admin',
      teams: [],
      status: 'inactive',
      isDeleted: true,
    };

    // Mock findOne to return user with both inactive status and isDeleted true
    vi.mocked(ManageUser.findOne).mockReturnValue({
      populate: vi.fn().mockResolvedValue(mockUser),
    } as any);

    const response = await request(app.server)
      .post('/success')
      .set('Authorization', 'Bearer mock-token')
      .send({ auth0_org_id: 'org_123' })
      .expect(401);

    expect(response.body.message).toContain(
      'User account has been deactivated',
    );
  });

  it('should return status as "active" when user status is "active"', async () => {
    const mockUser = {
      _id: mockUserId,
      id: mockUserId.toString(),
      email: mockEmail,
      name: 'Test User',
      auth0Id: mockAuth0Id,
      company: {
        _id: mockCompanyId,
        name: 'Test Company',
      },
      role: 'admin',
      teams: [],
      status: 'active',
      save: vi.fn(),
      populate: vi.fn(),
    };

    const savedUser = {
      ...mockUser,
      status: 'active',
      populate: vi.fn().mockResolvedValue(undefined),
    };
    savedUser.populate.mockResolvedValue(savedUser);
    mockUser.save.mockResolvedValue(savedUser);

    // Mock findOne to return user with active status
    vi.mocked(ManageUser.findOne).mockReturnValue({
      populate: vi.fn().mockResolvedValue(mockUser),
    } as any);

    // Mock User.findOne for the inactive/deleted check
    vi.mocked(User.findOne).mockResolvedValue(null);

    const response = await request(app.server)
      .post('/success')
      .set('Authorization', 'Bearer mock-token')
      .send({ auth0_org_id: 'org_123' })
      .expect(200);

    expect(response.body).toMatchObject({
      id: mockUserId.toString(),
      email: mockEmail,
      name: 'Test User',
      role: 'admin',
      status: 'active',
    });
  });

  it('should return status as "active" when user status is "invited"', async () => {
    const mockUser = {
      _id: mockUserId,
      id: mockUserId.toString(),
      email: mockEmail,
      name: 'Test User',
      auth0Id: mockAuth0Id,
      company: {
        _id: mockCompanyId,
        name: 'Test Company',
      },
      role: 'admin',
      teams: [],
      status: 'invited',
      save: vi.fn(),
      populate: vi.fn(),
    };

    // After save, return user with active status and populate method
    const savedUser = {
      ...mockUser,
      auth0Id: mockAuth0Id,
      status: 'active',
      populate: vi.fn().mockResolvedValue(undefined),
    };
    savedUser.populate.mockResolvedValue(savedUser);
    mockUser.save.mockResolvedValue(savedUser);

    // Mock findOne to return user with invited status
    vi.mocked(ManageUser.findOne).mockReturnValue({
      populate: vi.fn().mockResolvedValue(mockUser),
    } as any);

    // Mock User.findOne for the inactive/deleted check
    vi.mocked(User.findOne).mockResolvedValue(null);

    const response = await request(app.server)
      .post('/success')
      .set('Authorization', 'Bearer mock-token')
      .send({ auth0_org_id: 'org_123' })
      .expect(200);

    expect(response.body).toMatchObject({
      id: mockUserId.toString(),
      email: mockEmail,
      name: 'Test User',
      role: 'admin',
      status: 'active',
    });
  });

  it('should return status as "active" when user status field does not exist', async () => {
    const mockUser = {
      _id: mockUserId,
      id: mockUserId.toString(),
      email: mockEmail,
      name: 'Test User',
      auth0Id: mockAuth0Id,
      company: {
        _id: mockCompanyId,
        name: 'Test Company',
      },
      role: 'admin',
      teams: [],
      // status field intentionally omitted
      save: vi.fn(),
      populate: vi.fn(),
    };

    const savedUser = {
      ...mockUser,
      status: 'active',
      populate: vi.fn().mockResolvedValue(undefined),
    };
    savedUser.populate.mockResolvedValue(savedUser);
    mockUser.save.mockResolvedValue(savedUser);

    // Mock findOne to return user without status field
    vi.mocked(ManageUser.findOne).mockReturnValue({
      populate: vi.fn().mockResolvedValue(mockUser),
    } as any);

    // Mock User.findOne for the inactive/deleted check
    vi.mocked(User.findOne).mockResolvedValue(null);

    const response = await request(app.server)
      .post('/success')
      .set('Authorization', 'Bearer mock-token')
      .send({ auth0_org_id: 'org_123' })
      .expect(200);

    expect(response.body).toMatchObject({
      id: mockUserId.toString(),
      email: mockEmail,
      name: 'Test User',
      role: 'admin',
      status: 'active',
    });
  });

  it('should return 401 when no authorization token is provided', async () => {
    const response = await request(app.server)
      .post('/success')
      .send({ auth0_org_id: 'org_123' })
      .expect(401);

    expect(response.body.message).toContain('Unauthorized');
  });

  it('should return 401 when User collection has inactive record', async () => {
    // ManageUser not found
    vi.mocked(ManageUser.findOne).mockReturnValue({
      populate: vi.fn().mockResolvedValue(null),
    } as any);

    // User.findOne returns user with inactive status
    vi.mocked(User.findOne).mockResolvedValue({
      email: mockEmail,
      status: 'inactive',
      isDeleted: false,
    } as any);

    const response = await request(app.server)
      .post('/success')
      .set('Authorization', 'Bearer mock-token')
      .send({ auth0_org_id: 'org_123' })
      .expect(401);

    expect(response.body.message).toContain(
      'User account has been deactivated',
    );
  });

  describe('User Collection Sync', () => {
    it('should NOT sync User when new ManageUser is created from allowlist (not invited user)', async () => {
      const allowlistId = new Types.ObjectId();
      const mockTeamId1 = new Types.ObjectId();

      const mockAllowlistEntry = {
        _id: allowlistId,
        email: mockEmail,
        name: 'New User',
        company: {
          _id: mockCompanyId,
          name: 'Test Company',
        },
      };

      const mockCreatedUser = {
        _id: mockUserId,
        id: mockUserId.toString(),
        email: mockEmail,
        name: 'New User',
        auth0Id: mockAuth0Id,
        company: mockCompanyId,
        role: 'superadmin',
        teams: [mockTeamId1],
        status: 'active',
        populate: vi.fn(),
      };

      mockCreatedUser.populate = vi.fn().mockResolvedValue({
        ...mockCreatedUser,
        company: {
          _id: mockCompanyId,
          name: 'Test Company',
        },
      });

      // Mock findOne to return null (user doesn't exist)
      vi.mocked(ManageUser.findOne)
        .mockReturnValueOnce({
          populate: vi.fn().mockResolvedValue(null),
        } as any)
        .mockReturnValueOnce({
          populate: vi.fn().mockResolvedValue(null),
        } as any);

      // Mock AllowlistManageUser.findOne
      vi.mocked(AllowlistManageUser.findOne).mockReturnValue({
        populate: vi.fn().mockResolvedValue(mockAllowlistEntry),
      } as any);

      // Mock ManageUser.create
      vi.mocked(ManageUser.create).mockResolvedValue(mockCreatedUser as any);

      // Mock User.findOne for the inactive/deleted check
      vi.mocked(User.findOne).mockResolvedValue(null);

      // Mock AllowlistManageUser.deleteOne
      vi.mocked(AllowlistManageUser.deleteOne).mockResolvedValue({} as any);

      await request(app.server)
        .post('/success')
        .set('Authorization', 'Bearer mock-token')
        .send({ auth0_org_id: 'org_123' })
        .expect(200);

      // Verify User.create was NOT called (no sync for newly created ManageUser from allowlist)
      expect(User.create).not.toHaveBeenCalled();
    });

    it('should not sync User when ManageUser already exists (not from allowlist)', async () => {
      const mockTeamId = new Types.ObjectId();
      const mockUser = {
        _id: mockUserId,
        id: mockUserId.toString(),
        email: mockEmail,
        name: 'Existing User',
        auth0Id: mockAuth0Id,
        company: {
          _id: mockCompanyId,
          name: 'Test Company',
        },
        role: 'admin',
        teams: [mockTeamId],
        status: 'active',
        save: vi.fn(),
        populate: vi.fn(),
      };

      const savedUser = {
        ...mockUser,
        status: 'active',
        populate: vi.fn().mockResolvedValue(undefined),
      };
      savedUser.populate.mockResolvedValue(savedUser);
      mockUser.save.mockResolvedValue(savedUser);

      // Mock findOne to return existing user
      vi.mocked(ManageUser.findOne).mockReturnValue({
        populate: vi.fn().mockResolvedValue(mockUser),
      } as any);

      // Mock User.findOne for the inactive/deleted check
      vi.mocked(User.findOne).mockResolvedValue(null);

      await request(app.server)
        .post('/success')
        .set('Authorization', 'Bearer mock-token')
        .send({ auth0_org_id: 'org_123' })
        .expect(200);

      // Verify User.create was NOT called (no sync for existing ManageUser)
      expect(User.create).not.toHaveBeenCalled();
    });
  });
});
