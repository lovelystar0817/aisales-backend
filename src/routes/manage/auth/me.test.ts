import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Fastify from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { validatorCompiler } from 'fastify-type-provider-zod';
import { Types } from 'mongoose';
import request from 'supertest';
import router from './me.js';
import { ManageUser } from '../../../models/ManageUser.js';

// Mock the models
vi.mock('../../../models/ManageUser.js', () => ({
  ManageUser: {
    findOne: vi.fn(),
  },
}));

describe('GET /manage/auth/me', () => {
  let app: any;
  const mockCompanyId = new Types.ObjectId();
  const mockUserId = new Types.ObjectId();
  const mockAuth0Id = 'auth0|123456';
  const mockEmail = 'test@example.com';
  const mockTeamId1 = new Types.ObjectId();
  const mockTeamId2 = new Types.ObjectId();
  let mockRequestingUser: any = null;

  beforeEach(async () => {
    // Clear all mocks before each test
    vi.clearAllMocks();
    mockRequestingUser = null;

    // Create a fresh Fastify instance with Zod type provider
    app = Fastify({ logger: false }).withTypeProvider<ZodTypeProvider>();
    app.setValidatorCompiler(validatorCompiler);

    // Mock checkAuth0JWT middleware
    app.decorate('checkAuth0JWT', (req: any, _res: any, next: any) => {
      if (mockRequestingUser) {
        req.auth0Data = {
          payload: {
            sub: mockRequestingUser.auth0Id,
          },
        };
        next();
      } else {
        const error = new Error('Unauthorized') as any;
        error.statusCode = 401;
        next(error);
      }
    });

    // Mock authenticateManage preHandler
    app.decorate('authenticateManage', async (req: any) => {
      if (mockRequestingUser) {
        req.user = mockRequestingUser;
      }
    });

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

    // Mock httpErrors decorator
    app.decorate('httpErrors', {
      unauthorized: (message: string) => {
        const error = new Error(message) as any;
        error.statusCode = 401;
        return error;
      },
      forbidden: (message: string) => {
        const error = new Error(message) as any;
        error.statusCode = 403;
        return error;
      },
    });

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

  it('should return user details when authenticated', async () => {
    const mockUser = {
      _id: mockUserId,
      id: mockUserId.toString(),
      email: mockEmail,
      name: 'Test User',
      auth0Id: mockAuth0Id,
      company: {
        _id: mockCompanyId,
        name: 'Test Company',
        trialEndsAt: new Date('2026-12-31T23:59:59.000Z'),
      },
      role: 'admin',
      teams: [mockTeamId1, mockTeamId2],
      status: 'active',
      isDeleted: false,
    };

    // Set the mock requesting user for middleware
    mockRequestingUser = mockUser;

    // Mock findOne to return user
    vi.mocked(ManageUser.findOne).mockReturnValue({
      populate: vi.fn().mockReturnValue({
        orFail: vi.fn().mockResolvedValue(mockUser),
      }),
    } as any);

    const response = await request(app.server)
      .get('/')
      .set('Authorization', 'Bearer mock-token')
      .set('Accept-Language', 'en')
      .set('X-Client', 'manage')
      .expect(200);

    expect(response.body).toMatchObject({
      id: mockUserId.toString(),
      email: mockEmail,
      name: 'Test User',
      picture: 'https://example.com/picture.jpg',
      company: {
        _id: mockCompanyId.toString(),
        name: 'Test Company',
        trialEndsAt: '2026-12-31T23:59:59.000Z',
      },
      role: 'admin',
      teams: [mockTeamId1.toString(), mockTeamId2.toString()],
    });
  });

  it('should return 403 when user status is inactive', async () => {
    const mockUser = {
      _id: mockUserId,
      id: mockUserId.toString(),
      email: mockEmail,
      name: 'Test User',
      auth0Id: mockAuth0Id,
      company: {
        _id: mockCompanyId,
        name: 'Test Company',
        trialEndsAt: null,
      },
      role: 'admin',
      teams: [],
      status: 'inactive',
      isDeleted: false,
    };

    // Set the mock requesting user for middleware
    mockRequestingUser = mockUser;

    // Mock findOne to return user with inactive status
    vi.mocked(ManageUser.findOne).mockReturnValue({
      populate: vi.fn().mockReturnValue({
        orFail: vi.fn().mockResolvedValue(mockUser),
      }),
    } as any);

    const response = await request(app.server)
      .get('/')
      .set('Authorization', 'Bearer mock-token')
      .set('Accept-Language', 'en')
      .set('X-Client', 'manage')
      .expect(403);

    expect(response.body.message).toContain('Account has been deactivated');
  });

  it('should return 403 when user isDeleted is true', async () => {
    const mockUser = {
      _id: mockUserId,
      id: mockUserId.toString(),
      email: mockEmail,
      name: 'Test User',
      auth0Id: mockAuth0Id,
      company: {
        _id: mockCompanyId,
        name: 'Test Company',
        trialEndsAt: null,
      },
      role: 'admin',
      teams: [],
      status: 'active',
      isDeleted: true,
    };

    // Set the mock requesting user for middleware
    mockRequestingUser = mockUser;

    // Mock findOne to return user with isDeleted true
    vi.mocked(ManageUser.findOne).mockReturnValue({
      populate: vi.fn().mockReturnValue({
        orFail: vi.fn().mockResolvedValue(mockUser),
      }),
    } as any);

    const response = await request(app.server)
      .get('/')
      .set('Authorization', 'Bearer mock-token')
      .set('Accept-Language', 'en')
      .set('X-Client', 'manage')
      .expect(403);

    expect(response.body.message).toContain('Account has been deactivated');
  });

  it('should return null for teams when user has no teams', async () => {
    const mockUser = {
      _id: mockUserId,
      id: mockUserId.toString(),
      email: mockEmail,
      name: 'Test User',
      auth0Id: mockAuth0Id,
      company: {
        _id: mockCompanyId,
        name: 'Test Company',
        trialEndsAt: null,
      },
      role: 'user',
      teams: [],
      status: 'active',
      isDeleted: false,
    };

    // Set the mock requesting user for middleware
    mockRequestingUser = mockUser;

    // Mock findOne to return user
    vi.mocked(ManageUser.findOne).mockReturnValue({
      populate: vi.fn().mockReturnValue({
        orFail: vi.fn().mockResolvedValue(mockUser),
      }),
    } as any);

    const response = await request(app.server)
      .get('/')
      .set('Authorization', 'Bearer mock-token')
      .set('Accept-Language', 'en')
      .set('X-Client', 'manage')
      .expect(200);

    expect(response.body.teams).toBeNull();
  });

  it('should return null for trialEndsAt when company has no trial', async () => {
    const mockUser = {
      _id: mockUserId,
      id: mockUserId.toString(),
      email: mockEmail,
      name: 'Test User',
      auth0Id: mockAuth0Id,
      company: {
        _id: mockCompanyId,
        name: 'Test Company',
        trialEndsAt: null,
      },
      role: 'superadmin',
      teams: [],
      status: 'active',
      isDeleted: false,
    };

    // Set the mock requesting user for middleware
    mockRequestingUser = mockUser;

    // Mock findOne to return user
    vi.mocked(ManageUser.findOne).mockReturnValue({
      populate: vi.fn().mockReturnValue({
        orFail: vi.fn().mockResolvedValue(mockUser),
      }),
    } as any);

    const response = await request(app.server)
      .get('/')
      .set('Authorization', 'Bearer mock-token')
      .set('Accept-Language', 'en')
      .set('X-Client', 'manage')
      .expect(200);

    expect(response.body.company.trialEndsAt).toBeNull();
  });

  it('should continue without picture when Auth0 userInfo fetch fails', async () => {
    const mockUser = {
      _id: mockUserId,
      id: mockUserId.toString(),
      email: mockEmail,
      name: 'Test User',
      auth0Id: mockAuth0Id,
      company: {
        _id: mockCompanyId,
        name: 'Test Company',
        trialEndsAt: null,
      },
      role: 'user',
      teams: [],
      status: 'active',
      isDeleted: false,
    };

    // Set the mock requesting user for middleware
    mockRequestingUser = mockUser;

    // Mock findOne to return user
    vi.mocked(ManageUser.findOne).mockReturnValue({
      populate: vi.fn().mockReturnValue({
        orFail: vi.fn().mockResolvedValue(mockUser),
      }),
    } as any);

    // Mock userInfo to throw error
    app.userInfo.getUserInfo = vi
      .fn()
      .mockRejectedValue(new Error('Auth0 error'));

    const response = await request(app.server)
      .get('/')
      .set('Authorization', 'Bearer mock-token')
      .set('Accept-Language', 'en')
      .set('X-Client', 'manage')
      .expect(200);

    // Should succeed but without a picture
    expect(response.body.picture).toBe('');
    expect(response.body.id).toBe(mockUserId.toString());
  });

  it('should return 401 when no authorization token is provided', async () => {
    // mockRequestingUser is null, so middleware will fail
    const response = await request(app.server)
      .get('/')
      .set('Accept-Language', 'en')
      .set('X-Client', 'manage')
      .expect(401);

    expect(response.body.message).toContain('Unauthorized');
  });
});
