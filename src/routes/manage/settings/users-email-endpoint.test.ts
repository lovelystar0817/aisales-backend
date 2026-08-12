import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Fastify from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { validatorCompiler } from 'fastify-type-provider-zod';
import { Types } from 'mongoose';
import request from 'supertest';
import router from './users.js';
import { ManageUser } from '../../../models/ManageUser.js';
import { User } from '../../../models/User.js';
import { Team } from '../../../models/Team.js';
import * as agendaModule from '../../../jobs/agenda.js';

// Mock the models
vi.mock('../../../models/ManageUser.js', () => ({
  ManageUser: {
    findOne: vi.fn(),
    create: vi.fn(),
    deleteOne: vi.fn(),
  },
}));

vi.mock('../../../models/User.js', () => ({
  User: {
    findOne: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock('../../../models/Team.js', () => ({
  Team: {
    find: vi.fn(),
  },
}));

vi.mock('../../../models/Company.js', () => ({
  Company: {
    findById: vi.fn().mockReturnValue({
      select: vi.fn().mockResolvedValue(null),
    }),
    modelName: 'Company',
  },
}));

vi.mock('../../../utils/adminLogger.js', () => ({
  logAdminAction: vi.fn(),
  createUpdateDetails: vi.fn().mockReturnValue({}),
}));

vi.mock('../../../jobs/agenda.js', () => ({
  getAgenda: vi.fn(),
}));

vi.mock('../../../utils/manage/shared.js', () => ({
  buildBaseUserFilter: vi.fn((company) => ({
    company,
    isDeleted: { $ne: true },
  })),
  getAppUrl: vi.fn((role: string, companyFriendlyId?: string) => {
    const featureEnv = process.env.FEATURE_ENV;
    const isProd = (global as any).__TEST_IS_PROD__ ?? false;
    const isStaging = (global as any).__TEST_IS_STAGING__ ?? false;
    const isDev = (global as any).__TEST_IS_DEV__ ?? false;

    let baseUrl: string;
    if (isProd) {
      baseUrl = 'https://train.hupo.co';
    } else if (isStaging && featureEnv) {
      baseUrl = `https://${featureEnv}--huposalesai.netlify.app`;
    } else if (isDev) {
      baseUrl = 'http://localhost:5361';
    } else {
      baseUrl = 'http://localhost:5361';
    }

    if (role === 'superadmin' || role === 'admin') {
      return `${baseUrl}/manage`;
    } else {
      if (!companyFriendlyId) {
        throw new Error('companyFriendlyId is required for user role');
      }
      return `${baseUrl}/${companyFriendlyId}`;
    }
  }),
}));

vi.mock('../../../utils/userStatus.js', () => ({
  getEffectiveUserStatus: vi.fn((user) => user.status || 'active'),
}));

vi.mock('../../../env.js', async () => {
  const actual =
    await vi.importActual<typeof import('../../../env.js')>('../../../env.js');
  return {
    ...actual,
    get isProd() {
      return (global as any).__TEST_IS_PROD__ ?? false;
    },
    get isStaging() {
      return (global as any).__TEST_IS_STAGING__ ?? false;
    },
    get isDev() {
      return (global as any).__TEST_IS_DEV__ ?? false;
    },
  };
});

describe('PUT /manage/settings/users/:email - Email-based endpoint', () => {
  let app: any;
  const mockCompanyId = new Types.ObjectId();
  let mockRequestingUser: any = null;
  let mockAgenda: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockRequestingUser = null;
    (global as any).__TEST_IS_PROD__ = false;

    mockAgenda = {
      now: vi.fn().mockResolvedValue(undefined),
    };
    vi.mocked(agendaModule.getAgenda).mockReturnValue(mockAgenda as any);

    app = Fastify({ logger: false }).withTypeProvider<ZodTypeProvider>();
    app.setValidatorCompiler(validatorCompiler);

    app.decorate('checkAuth0JWT', (req: any, _res: any, next: any) => {
      if (mockRequestingUser) {
        req.auth0Data = {
          payload: {
            sub: `auth0|${mockRequestingUser._id.toString()}`,
          },
        };
      }
      next();
    });

    app.decorate('authenticateManage', async (req: any) => {
      if (mockRequestingUser) {
        req.user = mockRequestingUser;
      }
    });

    await app.register(import('@fastify/express'));
    await app.register(router);
    await app.listen({ port: 0 });
  });

  afterEach(async () => {
    await app.close();
  });

  describe('User lookup by email', () => {
    it('should return 404 if user not found in both collections', async () => {
      mockRequestingUser = {
        _id: new Types.ObjectId(),
        role: 'superadmin',
        company: mockCompanyId,
      };

      vi.mocked(ManageUser.findOne).mockResolvedValue(null);
      vi.mocked(User.findOne).mockResolvedValue(null);

      const response = await request(app.server)
        .put('/nonexistent@example.com')
        .send({ role: 'admin' })
        .set('Authorization', 'Bearer mock-token')
        .expect(404);

      expect(response.body.error).toBe('User not found');
    });

    it('should find user in ManageUser collection', async () => {
      const mockUser = {
        _id: new Types.ObjectId(),
        email: 'admin@example.com',
        role: 'admin',
        company: mockCompanyId,
        teams: [],
        save: vi.fn().mockResolvedValue(true),
      };

      mockRequestingUser = {
        _id: new Types.ObjectId(),
        role: 'superadmin',
        company: mockCompanyId,
      };

      vi.mocked(ManageUser.findOne).mockResolvedValue(mockUser as any);
      vi.mocked(User.findOne).mockResolvedValue(null);

      const response = await request(app.server)
        .put('/admin@example.com')
        .send({ role: 'superadmin' })
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('should find user in User collection', async () => {
      const mockUser = {
        _id: new Types.ObjectId(),
        email: 'user@example.com',
        role: 'user',
        company: mockCompanyId,
        teams: [],
        save: vi.fn().mockResolvedValue(true),
      };

      mockRequestingUser = {
        _id: new Types.ObjectId(),
        role: 'superadmin',
        company: mockCompanyId,
      };

      vi.mocked(ManageUser.findOne).mockResolvedValue(null);
      vi.mocked(User.findOne).mockResolvedValue(mockUser as any);
      vi.mocked(Team.find).mockResolvedValue([] as any);

      const response = await request(app.server)
        .put('/user@example.com')
        .send({ teamIds: [] })
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('Only teamIds changed', () => {
    it('should update teams in both ManageUser and User if both exist', async () => {
      const team1 = new Types.ObjectId();
      const team2 = new Types.ObjectId();

      const mockManageUser = {
        _id: new Types.ObjectId(),
        email: 'admin@example.com',
        role: 'admin',
        company: mockCompanyId,
        teams: [],
        save: vi.fn().mockResolvedValue(true),
      };

      const mockRegularUser = {
        _id: new Types.ObjectId(),
        email: 'admin@example.com',
        role: 'user',
        company: mockCompanyId,
        teams: [],
        save: vi.fn().mockResolvedValue(true),
      };

      mockRequestingUser = {
        _id: new Types.ObjectId(),
        role: 'superadmin',
        company: mockCompanyId,
      };

      vi.mocked(ManageUser.findOne).mockResolvedValue(mockManageUser as any);
      vi.mocked(User.findOne).mockResolvedValue(mockRegularUser as any);
      vi.mocked(Team.find).mockResolvedValue([
        { _id: team1, name: 'Team 1', company: mockCompanyId },
        { _id: team2, name: 'Team 2', company: mockCompanyId },
      ] as any);

      const response = await request(app.server)
        .put('/admin@example.com')
        .send({ teamIds: [team1.toString(), team2.toString()] })
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockManageUser.save).toHaveBeenCalled();
      expect(mockRegularUser.save).toHaveBeenCalled();
      expect(mockManageUser.teams).toEqual([team1, team2]);
      expect(mockRegularUser.teams).toEqual([team1, team2]);
    });

    it('should only update ManageUser if User does not exist', async () => {
      const team1 = new Types.ObjectId();

      const mockManageUser = {
        _id: new Types.ObjectId(),
        email: 'admin@example.com',
        role: 'admin',
        company: mockCompanyId,
        teams: [],
        save: vi.fn().mockResolvedValue(true),
      };

      mockRequestingUser = {
        _id: new Types.ObjectId(),
        role: 'superadmin',
        company: mockCompanyId,
      };

      vi.mocked(ManageUser.findOne).mockResolvedValue(mockManageUser as any);
      vi.mocked(User.findOne).mockResolvedValue(null);
      vi.mocked(Team.find).mockResolvedValue([
        { _id: team1, name: 'Team 1', company: mockCompanyId },
      ] as any);

      const response = await request(app.server)
        .put('/admin@example.com')
        .send({ teamIds: [team1.toString()] })
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockManageUser.save).toHaveBeenCalled();
      expect(mockManageUser.teams).toEqual([team1]);
    });

    it('should return 400 if team not found', async () => {
      const mockManageUser = {
        _id: new Types.ObjectId(),
        email: 'admin@example.com',
        role: 'admin',
        company: mockCompanyId,
        teams: [],
        save: vi.fn().mockResolvedValue(true),
      };

      mockRequestingUser = {
        _id: new Types.ObjectId(),
        role: 'superadmin',
        company: mockCompanyId,
      };

      vi.mocked(ManageUser.findOne).mockResolvedValue(mockManageUser as any);
      vi.mocked(User.findOne).mockResolvedValue(null);
      vi.mocked(Team.find).mockResolvedValue([] as any);

      const response = await request(app.server)
        .put('/admin@example.com')
        .send({ teamIds: [new Types.ObjectId().toString()] })
        .set('Authorization', 'Bearer mock-token')
        .expect(400);

      expect(response.body.error).toBe(
        'One or more teams not found or invalid',
      );
    });
  });

  describe('User promoted to admin/superadmin', () => {
    it('should copy user from User to ManageUser when promoting to admin', async () => {
      const mockRegularUser = {
        _id: new Types.ObjectId(),
        email: 'user@example.com',
        role: 'user',
        auth0Id: 'auth0|123',
        company: mockCompanyId,
        teams: [],
        name: 'Test User',
        firstName: 'Test',
        lastName: 'User',
        save: vi.fn().mockResolvedValue(true),
      };

      mockRequestingUser = {
        _id: new Types.ObjectId(),
        role: 'superadmin',
        company: mockCompanyId,
      };

      vi.mocked(ManageUser.findOne).mockResolvedValue(null);
      vi.mocked(User.findOne).mockResolvedValue(mockRegularUser as any);
      vi.mocked(ManageUser.create).mockResolvedValue({
        _id: new Types.ObjectId(),
        email: 'user@example.com',
        role: 'admin',
      } as any);

      const response = await request(app.server)
        .put('/user@example.com')
        .send({ role: 'admin' })
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(ManageUser.create).toHaveBeenCalledWith({
        email: mockRegularUser.email,
        auth0Id: mockRegularUser.auth0Id,
        company: mockRegularUser.company,
        teams: mockRegularUser.teams,
        role: 'admin',
        status: 'active',
        name: mockRegularUser.name,
        firstName: mockRegularUser.firstName,
        lastName: mockRegularUser.lastName,
      });
    });

    it('should update existing soft-deleted ManageUser when promoting user to admin', async () => {
      const mockRegularUser = {
        _id: new Types.ObjectId(),
        email: 'user@example.com',
        role: 'user',
        company: mockCompanyId,
        teams: [],
        save: vi.fn().mockResolvedValue(true),
      };

      const mockManageUser = {
        _id: new Types.ObjectId(),
        email: 'user@example.com',
        role: 'admin',
        company: mockCompanyId,
        teams: [],
        isDeleted: true,
        status: 'inactive',
        save: vi.fn().mockResolvedValue(true),
      };

      mockRequestingUser = {
        _id: new Types.ObjectId(),
        role: 'superadmin',
        company: mockCompanyId,
      };

      // First call: initial lookup (won't find soft-deleted ManageUser)
      // Second call: inside role change logic (will find soft-deleted ManageUser)
      vi.mocked(ManageUser.findOne)
        .mockResolvedValueOnce(null) // Initial lookup filters out soft-deleted
        .mockResolvedValueOnce(mockManageUser as any); // Role change lookup finds it
      vi.mocked(User.findOne).mockResolvedValue(mockRegularUser as any);

      const response = await request(app.server)
        .put('/user@example.com')
        .send({ role: 'admin' })
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockManageUser.role).toBe('admin');
      expect(mockManageUser.isDeleted).toBe(false);
      expect(mockManageUser.status).toBe('active');
      expect(mockManageUser.save).toHaveBeenCalled();
    });

    it('should update teams in both collections when promoting with teamIds', async () => {
      const team1 = new Types.ObjectId();
      const team2 = new Types.ObjectId();

      const mockRegularUser = {
        _id: new Types.ObjectId(),
        email: 'user@example.com',
        role: 'user',
        auth0Id: 'auth0|123',
        company: mockCompanyId,
        teams: [],
        name: 'Test User',
        firstName: 'Test',
        lastName: 'User',
        save: vi.fn().mockResolvedValue(true),
      };

      mockRequestingUser = {
        _id: new Types.ObjectId(),
        role: 'superadmin',
        company: mockCompanyId,
      };

      // Two findOne calls for ManageUser: initial lookup and role change lookup
      vi.mocked(ManageUser.findOne).mockResolvedValue(null);
      vi.mocked(User.findOne).mockResolvedValue(mockRegularUser as any);
      vi.mocked(ManageUser.create).mockResolvedValue({
        _id: new Types.ObjectId(),
        email: 'user@example.com',
        role: 'admin',
      } as any);
      vi.mocked(Team.find).mockResolvedValue([
        { _id: team1, name: 'Team 1', company: mockCompanyId },
        { _id: team2, name: 'Team 2', company: mockCompanyId },
      ] as any);

      const response = await request(app.server)
        .put('/user@example.com')
        .send({ role: 'admin', teamIds: [team1.toString(), team2.toString()] })
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(ManageUser.create).toHaveBeenCalledWith(
        expect.objectContaining({
          teams: [team1, team2],
        }),
      );
      expect(mockRegularUser.teams).toEqual([team1, team2]);
      expect(mockRegularUser.save).toHaveBeenCalled();
    });
  });

  describe('Admin/superadmin demoted to user', () => {
    it('should copy admin from ManageUser to User when demoting', async () => {
      const mockManageUser = {
        _id: new Types.ObjectId(),
        email: 'admin@example.com',
        role: 'admin',
        auth0Id: 'auth0|123',
        company: mockCompanyId,
        teams: [],
        name: 'Test Admin',
        firstName: 'Test',
        lastName: 'Admin',
        isDeleted: false,
        status: 'active',
        save: vi.fn().mockResolvedValue(true),
      };

      mockRequestingUser = {
        _id: new Types.ObjectId(),
        role: 'superadmin',
        company: mockCompanyId,
      };

      vi.mocked(ManageUser.findOne).mockResolvedValue(mockManageUser as any);
      vi.mocked(User.findOne).mockResolvedValue(null);
      vi.mocked(User.create).mockResolvedValue({
        _id: new Types.ObjectId(),
        email: 'admin@example.com',
        role: 'user',
      } as any);

      const response = await request(app.server)
        .put('/admin@example.com')
        .send({ role: 'user' })
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(User.create).toHaveBeenCalledWith({
        email: mockManageUser.email,
        auth0Id: mockManageUser.auth0Id,
        company: mockManageUser.company,
        teams: mockManageUser.teams,
        role: 'user',
        status: 'active',
        name: mockManageUser.name,
        firstName: mockManageUser.firstName,
        lastName: mockManageUser.lastName,
      });
      // Verify ManageUser was deleted (not soft-deleted)
      expect(ManageUser.deleteOne).toHaveBeenCalledWith({
        _id: mockManageUser._id,
      });
    });

    it('should update existing soft-deleted User when demoting admin', async () => {
      const mockManageUser = {
        _id: new Types.ObjectId(),
        email: 'admin@example.com',
        role: 'admin',
        company: mockCompanyId,
        teams: [],
        isDeleted: false,
        status: 'active',
        save: vi.fn().mockResolvedValue(true),
      };

      const mockRegularUser = {
        _id: new Types.ObjectId(),
        email: 'admin@example.com',
        role: 'user',
        company: mockCompanyId,
        teams: [],
        isDeleted: true,
        status: 'inactive',
        save: vi.fn().mockResolvedValue(true),
      };

      mockRequestingUser = {
        _id: new Types.ObjectId(),
        role: 'superadmin',
        company: mockCompanyId,
      };

      vi.mocked(ManageUser.findOne).mockResolvedValue(mockManageUser as any);
      // First call: initial lookup (won't find soft-deleted User)
      // Second call: inside role change logic (will find soft-deleted User)
      vi.mocked(User.findOne)
        .mockResolvedValueOnce(null) // Initial lookup filters out soft-deleted
        .mockResolvedValueOnce(mockRegularUser as any); // Role change lookup finds it

      const response = await request(app.server)
        .put('/admin@example.com')
        .send({ role: 'user' })
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockRegularUser.role).toBe('user');
      expect(mockRegularUser.isDeleted).toBe(false);
      expect(mockRegularUser.status).toBe('active');
      expect(mockRegularUser.save).toHaveBeenCalled();
      // Verify ManageUser was deleted (not soft-deleted)
      expect(ManageUser.deleteOne).toHaveBeenCalledWith({
        _id: mockManageUser._id,
      });
    });

    it('should apply new teams when demoting with teamIds', async () => {
      const team1 = new Types.ObjectId();

      const mockManageUser = {
        _id: new Types.ObjectId(),
        email: 'admin@example.com',
        role: 'admin',
        auth0Id: 'auth0|123',
        company: mockCompanyId,
        teams: [],
        name: 'Test Admin',
        firstName: 'Test',
        lastName: 'Admin',
        isDeleted: false,
        status: 'active',
        save: vi.fn().mockResolvedValue(true),
      };

      mockRequestingUser = {
        _id: new Types.ObjectId(),
        role: 'superadmin',
        company: mockCompanyId,
      };

      vi.mocked(ManageUser.findOne).mockResolvedValue(mockManageUser as any);
      // Two findOne calls for User: initial lookup and role change lookup
      vi.mocked(User.findOne).mockResolvedValue(null);
      vi.mocked(User.create).mockResolvedValue({
        _id: new Types.ObjectId(),
        email: 'admin@example.com',
        role: 'user',
      } as any);
      vi.mocked(Team.find).mockResolvedValue([
        { _id: team1, name: 'Team 1', company: mockCompanyId },
      ] as any);

      const response = await request(app.server)
        .put('/admin@example.com')
        .send({ role: 'user', teamIds: [team1.toString()] })
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(User.create).toHaveBeenCalledWith(
        expect.objectContaining({
          teams: [team1],
        }),
      );
      // Verify ManageUser was deleted (not soft-deleted)
      expect(ManageUser.deleteOne).toHaveBeenCalledWith({
        _id: mockManageUser._id,
      });
    });
  });

  describe('Admin <-> Superadmin role changes', () => {
    it('should update ManageUser.role when changing admin to superadmin', async () => {
      const mockManageUser = {
        _id: new Types.ObjectId(),
        email: 'admin@example.com',
        role: 'admin',
        company: mockCompanyId,
        teams: [],
        save: vi.fn().mockResolvedValue(true),
      };

      mockRequestingUser = {
        _id: new Types.ObjectId(),
        role: 'superadmin',
        company: mockCompanyId,
      };

      vi.mocked(ManageUser.findOne).mockResolvedValue(mockManageUser as any);
      vi.mocked(User.findOne).mockResolvedValue(null);

      const response = await request(app.server)
        .put('/admin@example.com')
        .send({ role: 'superadmin' })
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockManageUser.role).toBe('superadmin');
      expect(mockManageUser.save).toHaveBeenCalled();
    });

    it('should update ManageUser.role when changing superadmin to admin', async () => {
      const mockManageUser = {
        _id: new Types.ObjectId(),
        email: 'superadmin@example.com',
        role: 'superadmin',
        company: mockCompanyId,
        teams: [],
        save: vi.fn().mockResolvedValue(true),
      };

      mockRequestingUser = {
        _id: new Types.ObjectId(),
        role: 'superadmin',
        company: mockCompanyId,
      };

      vi.mocked(ManageUser.findOne).mockResolvedValue(mockManageUser as any);
      vi.mocked(User.findOne).mockResolvedValue(null);

      const response = await request(app.server)
        .put('/superadmin@example.com')
        .send({ role: 'admin' })
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockManageUser.role).toBe('admin');
      expect(mockManageUser.save).toHaveBeenCalled();
    });

    it('should update teams in both collections when changing admin to superadmin with teamIds', async () => {
      const team1 = new Types.ObjectId();

      const mockManageUser = {
        _id: new Types.ObjectId(),
        email: 'admin@example.com',
        role: 'admin',
        company: mockCompanyId,
        teams: [],
        save: vi.fn().mockResolvedValue(true),
      };

      const mockRegularUser = {
        _id: new Types.ObjectId(),
        email: 'admin@example.com',
        role: 'user',
        company: mockCompanyId,
        teams: [],
        save: vi.fn().mockResolvedValue(true),
      };

      mockRequestingUser = {
        _id: new Types.ObjectId(),
        role: 'superadmin',
        company: mockCompanyId,
      };

      vi.mocked(ManageUser.findOne).mockResolvedValue(mockManageUser as any);
      vi.mocked(User.findOne).mockResolvedValue(mockRegularUser as any);
      vi.mocked(Team.find).mockResolvedValue([
        { _id: team1, name: 'Team 1', company: mockCompanyId },
      ] as any);

      const response = await request(app.server)
        .put('/admin@example.com')
        .send({ role: 'superadmin', teamIds: [team1.toString()] })
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockManageUser.role).toBe('superadmin');
      expect(mockManageUser.teams).toEqual([team1]);
      expect(mockRegularUser.teams).toEqual([team1]);
      expect(mockManageUser.save).toHaveBeenCalled();
      expect(mockRegularUser.save).toHaveBeenCalled();
    });
  });

  describe('Email sending in all environments', () => {
    beforeEach(() => {
      vi.clearAllMocks();
      (global as any).__TEST_IS_PROD__ = false;
      (global as any).__TEST_IS_STAGING__ = false;
      (global as any).__TEST_IS_DEV__ = false;
    });

    afterEach(() => {
      delete process.env.FEATURE_ENV;
      (global as any).__TEST_IS_PROD__ = false;
      (global as any).__TEST_IS_STAGING__ = false;
      (global as any).__TEST_IS_DEV__ = false;
    });

    it('should send invite email in production with correct URL', async () => {
      (global as any).__TEST_IS_PROD__ = true;

      const mockRegularUser = {
        _id: new Types.ObjectId(),
        email: 'user@example.com',
        role: 'user',
        auth0Id: 'auth0|123',
        company: mockCompanyId,
        teams: [],
        name: 'Test User',
        firstName: 'Test',
        lastName: 'User',
        save: vi.fn().mockResolvedValue(true),
      };

      mockRequestingUser = {
        _id: new Types.ObjectId(),
        email: 'admin@example.com',
        role: 'superadmin',
        company: mockCompanyId,
      };

      vi.mocked(ManageUser.findOne).mockResolvedValue(null);
      vi.mocked(User.findOne).mockResolvedValue(mockRegularUser as any);
      vi.mocked(ManageUser.create).mockResolvedValue({
        _id: new Types.ObjectId(),
        email: 'user@example.com',
        role: 'admin',
      } as any);

      await request(app.server)
        .put('/user@example.com')
        .send({ role: 'admin' })
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      expect(mockAgenda.now).toHaveBeenCalledWith('send-invite-email', {
        email: 'user@example.com',
        link: 'https://train.hupo.co/manage',
        languageCode: 'en',
        role: 'admin',
        inviterEmail: 'admin@example.com',
      });
    });

    it('should send invite email in staging with correct URL', async () => {
      (global as any).__TEST_IS_STAGING__ = true;
      process.env.FEATURE_ENV = 'feature-accessmgmt99';

      const mockRegularUser = {
        _id: new Types.ObjectId(),
        email: 'user@example.com',
        role: 'user',
        auth0Id: 'auth0|123',
        company: mockCompanyId,
        teams: [],
        name: 'Test User',
        firstName: 'Test',
        lastName: 'User',
        save: vi.fn().mockResolvedValue(true),
      };

      mockRequestingUser = {
        _id: new Types.ObjectId(),
        email: 'admin@example.com',
        role: 'superadmin',
        company: mockCompanyId,
      };

      vi.mocked(ManageUser.findOne).mockResolvedValue(null);
      vi.mocked(User.findOne).mockResolvedValue(mockRegularUser as any);
      vi.mocked(ManageUser.create).mockResolvedValue({
        _id: new Types.ObjectId(),
        email: 'user@example.com',
        role: 'superadmin',
      } as any);

      await request(app.server)
        .put('/user@example.com')
        .send({ role: 'superadmin' })
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      expect(mockAgenda.now).toHaveBeenCalledWith('send-invite-email', {
        email: 'user@example.com',
        link: 'https://feature-accessmgmt99--huposalesai.netlify.app/manage',
        languageCode: 'en',
        role: 'superadmin',
        inviterEmail: 'admin@example.com',
      });
    });

    it('should send invite email in development with correct URL', async () => {
      (global as any).__TEST_IS_DEV__ = true;

      const mockRegularUser = {
        _id: new Types.ObjectId(),
        email: 'user@example.com',
        role: 'user',
        auth0Id: 'auth0|123',
        company: mockCompanyId,
        teams: [],
        name: 'Test User',
        firstName: 'Test',
        lastName: 'User',
        save: vi.fn().mockResolvedValue(true),
      };

      mockRequestingUser = {
        _id: new Types.ObjectId(),
        email: 'admin@example.com',
        role: 'superadmin',
        company: mockCompanyId,
      };

      vi.mocked(ManageUser.findOne).mockResolvedValue(null);
      vi.mocked(User.findOne).mockResolvedValue(mockRegularUser as any);
      vi.mocked(ManageUser.create).mockResolvedValue({
        _id: new Types.ObjectId(),
        email: 'user@example.com',
        role: 'admin',
      } as any);

      await request(app.server)
        .put('/user@example.com')
        .send({ role: 'admin' })
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      expect(mockAgenda.now).toHaveBeenCalledWith('send-invite-email', {
        email: 'user@example.com',
        link: 'http://localhost:5361/manage',
        languageCode: 'en',
        role: 'admin',
        inviterEmail: 'admin@example.com',
      });
    });

    it('should send update role email in all environments', async () => {
      (global as any).__TEST_IS_PROD__ = true;

      const mockManageUser = {
        _id: new Types.ObjectId(),
        email: 'admin@example.com',
        role: 'admin',
        company: mockCompanyId,
        teams: [],
        save: vi.fn().mockResolvedValue(true),
      };

      mockRequestingUser = {
        _id: new Types.ObjectId(),
        role: 'superadmin',
        company: mockCompanyId,
      };

      vi.mocked(ManageUser.findOne).mockResolvedValue(mockManageUser as any);
      vi.mocked(User.findOne).mockResolvedValue(null);

      await request(app.server)
        .put('/admin@example.com')
        .send({ role: 'superadmin' })
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      expect(mockAgenda.now).toHaveBeenCalledWith('send-update-role-email', {
        email: 'admin@example.com',
        previousRole: 'admin',
        newRole: 'superadmin',
        link: 'https://train.hupo.co/manage',
      });
    });
  });
});
