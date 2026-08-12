import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Fastify from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { validatorCompiler } from 'fastify-type-provider-zod';
import { Types } from 'mongoose';
import request from 'supertest';
import router from './success.js';
import { ManageUser } from '../../models/ManageUser.js';
import { User } from '../../models/User.js';
import { Company } from '../../models/Company.js';

// Mock the models
vi.mock('../../models/ManageUser.js', () => ({
  ManageUser: {
    findOne: vi.fn(),
    findByIdAndDelete: vi.fn(),
    findByIdAndUpdate: vi.fn(),
  },
}));

vi.mock('../../models/User.js', () => ({
  User: {
    findOne: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock('../../models/Company.js', () => ({
  Company: {
    findOne: vi.fn(),
  },
}));

vi.mock('../../jobs/agenda.js', () => ({
  getAgenda: vi.fn(() => ({
    now: vi.fn(),
  })),
}));

vi.mock('../../utils/constants.js', () => ({
  SLACK_REPORTER_CHANNEL_ID: 'test-channel',
  SLACK_REPORT_TYPES: {
    USER_ONBOARDED_REPORT: 'user-onboarded',
  },
}));

describe('POST /success', () => {
  let app: any;
  const mockCompanyId = new Types.ObjectId();
  const mockUserId = new Types.ObjectId();
  const mockManageUserId = new Types.ObjectId();
  const mockAuth0Id = 'auth0|123456';
  const mockAuth0OrgId = 'org_123';
  const mockEmail = 'test@example.com';
  const mockName = 'Test User';
  const mockGivenName = 'Test';
  const mockFamilyName = 'User';
  const mockPicture = 'https://example.com/picture.jpg';

  beforeEach(async () => {
    vi.clearAllMocks();

    app = Fastify({ logger: false }).withTypeProvider<ZodTypeProvider>();
    app.setValidatorCompiler(validatorCompiler);

    // Mock userInfo decorator
    app.decorate('userInfo', {
      getUserInfo: vi.fn().mockResolvedValue({
        data: {
          sub: mockAuth0Id,
          email: mockEmail,
          name: mockName,
          given_name: mockGivenName,
          family_name: mockFamilyName,
          picture: mockPicture,
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
      badRequest: (message: string) => {
        const error = new Error(message) as any;
        error.statusCode = 400;
        return error;
      },
    });

    await app.register(router);
    await app.listen({ port: 0 });
  });

  afterEach(async () => {
    await app.close();
  });

  describe('Authentication', () => {
    it('should return 401 when no authorization token is provided', async () => {
      const response = await request(app.server)
        .post('/success')
        .send({ auth0_org_id: mockAuth0OrgId })
        .expect(401);

      expect(response.body.message).toContain('Unauthorized');
    });

    it('should return 401 when Auth0 verification fails', async () => {
      app.userInfo.getUserInfo.mockRejectedValueOnce(
        new Error('Invalid token'),
      );

      const response = await request(app.server)
        .post('/success')
        .set('Authorization', 'Bearer invalid-token')
        .send({ auth0_org_id: mockAuth0OrgId })
        .expect(401);

      expect(response.body.message).toContain('Failed to verify token');
    });
  });

  describe('Existing User', () => {
    beforeEach(() => {
      const mockCompany = {
        _id: mockCompanyId,
        name: 'Test Company',
        auth0OrgId: mockAuth0OrgId,
      };

      vi.mocked(Company.findOne).mockReturnValue({
        select: vi.fn().mockResolvedValue(mockCompany),
      } as any);
    });

    it('should return 401 when user is inactive', async () => {
      const mockUser = {
        _id: mockUserId,
        auth0Id: mockAuth0Id,
        email: mockEmail,
        name: mockName,
        status: 'inactive',
        isDeleted: false,
      };

      vi.mocked(User.findOne).mockReturnValue({
        populate: vi.fn().mockResolvedValue(mockUser),
      } as any);

      const response = await request(app.server)
        .post('/success')
        .set('Authorization', 'Bearer mock-token')
        .send({ auth0_org_id: mockAuth0OrgId })
        .expect(401);

      expect(response.body.message).toContain(
        'User account has been deactivated',
      );
    });

    it('should return 401 when user is deleted', async () => {
      const mockUser = {
        _id: mockUserId,
        auth0Id: mockAuth0Id,
        email: mockEmail,
        name: mockName,
        status: 'active',
        isDeleted: true,
      };

      vi.mocked(User.findOne).mockReturnValue({
        populate: vi.fn().mockResolvedValue(mockUser),
      } as any);

      const response = await request(app.server)
        .post('/success')
        .set('Authorization', 'Bearer mock-token')
        .send({ auth0_org_id: mockAuth0OrgId })
        .expect(401);

      expect(response.body.message).toContain(
        'User account has been deactivated',
      );
    });

    it('should return success when user exists and is active', async () => {
      const mockUser = {
        _id: mockUserId,
        id: mockUserId.toString(),
        auth0Id: mockAuth0Id,
        email: mockEmail,
        name: mockName,
        status: 'active',
        isDeleted: false,
        emailVerified: true,
        company: {
          _id: mockCompanyId,
          name: 'Test Company',
        },
        save: vi.fn().mockResolvedValue(undefined),
      };

      vi.mocked(User.findOne).mockReturnValue({
        populate: vi.fn().mockResolvedValue(mockUser),
      } as any);
      vi.mocked(ManageUser.findOne).mockResolvedValue(null);

      const response = await request(app.server)
        .post('/success')
        .set('Authorization', 'Bearer mock-token')
        .send({ auth0_org_id: mockAuth0OrgId })
        .expect(200);

      expect(response.body).toMatchObject({
        id: mockUserId.toString(),
        email: mockEmail,
        name: mockName,
        emailVerified: true,
      });
    });
  });

  describe('New User - Company Validation', () => {
    beforeEach(() => {
      vi.mocked(User.findOne).mockReturnValue({
        populate: vi.fn().mockResolvedValue(null),
      } as any);
    });

    it('should return 400 when company not found', async () => {
      vi.mocked(Company.findOne).mockReturnValue({
        select: vi.fn().mockResolvedValue(null),
      } as any);

      const response = await request(app.server)
        .post('/success')
        .set('Authorization', 'Bearer mock-token')
        .send({ auth0_org_id: mockAuth0OrgId })
        .expect(400);

      expect(response.body.message).toContain('Company not found');
    });
  });

  describe('New User - No ManageUser', () => {
    beforeEach(() => {
      vi.mocked(User.findOne).mockReturnValue({
        populate: vi.fn().mockResolvedValue(null),
      } as any);

      const mockCompany = {
        _id: mockCompanyId,
        name: 'Test Company',
        auth0OrgId: mockAuth0OrgId,
      };

      vi.mocked(Company.findOne).mockReturnValue({
        select: vi.fn().mockResolvedValue(mockCompany),
      } as any);

      vi.mocked(ManageUser.findOne).mockResolvedValue(null);
    });

    it('should create user successfully when no ManageUser exists', async () => {
      const createdUser = {
        _id: mockUserId,
        id: mockUserId.toString(),
        auth0Id: mockAuth0Id,
        email: mockEmail,
        name: mockName,
        firstName: mockGivenName,
        lastName: mockFamilyName,
        company: mockCompanyId,
        status: 'active',
        emailVerified: true,
        populate: vi.fn().mockResolvedValue({
          _id: mockUserId,
          id: mockUserId.toString(),
          auth0Id: mockAuth0Id,
          email: mockEmail,
          name: mockName,
          company: {
            _id: mockCompanyId,
            name: 'Test Company',
          },
        }),
      };

      vi.mocked(User.create).mockResolvedValue(createdUser as any);

      const response = await request(app.server)
        .post('/success')
        .set('Authorization', 'Bearer mock-token')
        .send({ auth0_org_id: mockAuth0OrgId })
        .expect(200);

      expect(User.create).toHaveBeenCalledWith({
        auth0Id: mockAuth0Id,
        email: mockEmail,
        name: mockName,
        firstName: mockGivenName,
        lastName: mockFamilyName,
        company: mockCompanyId,
        teams: undefined,
        status: 'active',
        emailVerified: true,
      });

      expect(response.body).toMatchObject({
        id: mockUserId.toString(),
        email: mockEmail,
        name: mockName,
        emailVerified: true,
      });

      expect(ManageUser.findByIdAndDelete).not.toHaveBeenCalled();
      expect(ManageUser.findByIdAndUpdate).not.toHaveBeenCalled();
    });
  });

  describe('New User - ManageUser with role=user', () => {
    const mockTeamId1 = new Types.ObjectId();
    const mockTeamId2 = new Types.ObjectId();

    beforeEach(() => {
      vi.mocked(User.findOne).mockReturnValue({
        populate: vi.fn().mockResolvedValue(null),
      } as any);

      const mockCompany = {
        _id: mockCompanyId,
        name: 'Test Company',
        auth0OrgId: mockAuth0OrgId,
      };

      vi.mocked(Company.findOne).mockReturnValue({
        select: vi.fn().mockResolvedValue(mockCompany),
      } as any);
    });

    it('should create user and delete ManageUser when role=user', async () => {
      const mockManageUser = {
        _id: mockManageUserId,
        email: mockEmail,
        name: mockName,
        role: 'user' as const,
        status: 'invited' as const,
        company: mockCompanyId,
        teams: [mockTeamId1, mockTeamId2],
      };

      vi.mocked(ManageUser.findOne).mockResolvedValue(mockManageUser as any);

      const createdUser = {
        _id: mockUserId,
        id: mockUserId.toString(),
        auth0Id: mockAuth0Id,
        email: mockEmail,
        name: mockName,
        firstName: mockGivenName,
        lastName: mockFamilyName,
        company: mockCompanyId,
        teams: [mockTeamId1, mockTeamId2],
        status: 'active',
        emailVerified: true,
        populate: vi.fn().mockResolvedValue({
          _id: mockUserId,
          id: mockUserId.toString(),
          auth0Id: mockAuth0Id,
          email: mockEmail,
          name: mockName,
          company: {
            _id: mockCompanyId,
            name: 'Test Company',
          },
        }),
      };

      vi.mocked(User.create).mockResolvedValue(createdUser as any);
      vi.mocked(ManageUser.findByIdAndDelete).mockResolvedValue(
        mockManageUser as any,
      );

      const response = await request(app.server)
        .post('/success')
        .set('Authorization', 'Bearer mock-token')
        .send({ auth0_org_id: mockAuth0OrgId })
        .expect(200);

      expect(User.create).toHaveBeenCalledWith({
        auth0Id: mockAuth0Id,
        email: mockEmail,
        name: mockName,
        firstName: mockGivenName,
        lastName: mockFamilyName,
        company: mockCompanyId,
        teams: [mockTeamId1, mockTeamId2],
        status: 'active',
        emailVerified: true,
      });

      expect(ManageUser.findByIdAndDelete).toHaveBeenCalledWith(
        mockManageUserId,
      );
      expect(ManageUser.findByIdAndUpdate).not.toHaveBeenCalled();

      expect(response.body).toMatchObject({
        id: mockUserId.toString(),
        email: mockEmail,
        emailVerified: true,
      });
    });
  });

  describe('New User - ManageUser with role=admin', () => {
    const mockTeamId = new Types.ObjectId();

    beforeEach(() => {
      vi.mocked(User.findOne).mockReturnValue({
        populate: vi.fn().mockResolvedValue(null),
      } as any);

      const mockCompany = {
        _id: mockCompanyId,
        name: 'Test Company',
        auth0OrgId: mockAuth0OrgId,
      };

      vi.mocked(Company.findOne).mockReturnValue({
        select: vi.fn().mockResolvedValue(mockCompany),
      } as any);
    });

    it('should create user and update ManageUser when role=admin', async () => {
      const mockManageUser = {
        _id: mockManageUserId,
        email: mockEmail,
        name: 'Old Name',
        role: 'admin' as const,
        status: 'invited' as const,
        company: mockCompanyId,
        teams: [mockTeamId],
        auth0Id: '',
      };

      vi.mocked(ManageUser.findOne).mockResolvedValue(mockManageUser as any);

      const createdUser = {
        _id: mockUserId,
        id: mockUserId.toString(),
        auth0Id: mockAuth0Id,
        email: mockEmail,
        name: mockName,
        firstName: mockGivenName,
        lastName: mockFamilyName,
        company: mockCompanyId,
        teams: [mockTeamId],
        status: 'active',
        emailVerified: true,
        populate: vi.fn().mockResolvedValue({
          _id: mockUserId,
          id: mockUserId.toString(),
          auth0Id: mockAuth0Id,
          email: mockEmail,
          name: mockName,
          company: {
            _id: mockCompanyId,
            name: 'Test Company',
          },
        }),
      };

      vi.mocked(User.create).mockResolvedValue(createdUser as any);
      vi.mocked(ManageUser.findByIdAndUpdate).mockResolvedValue(
        mockManageUser as any,
      );

      const response = await request(app.server)
        .post('/success')
        .set('Authorization', 'Bearer mock-token')
        .send({ auth0_org_id: mockAuth0OrgId })
        .expect(200);

      expect(User.create).toHaveBeenCalledWith({
        auth0Id: mockAuth0Id,
        email: mockEmail,
        name: mockName,
        firstName: mockGivenName,
        lastName: mockFamilyName,
        company: mockCompanyId,
        teams: [mockTeamId],
        status: 'active',
        emailVerified: true,
      });

      expect(ManageUser.findByIdAndUpdate).toHaveBeenCalledWith(
        mockManageUserId,
        {
          status: 'active',
          auth0Id: mockAuth0Id,
          email: mockEmail,
          name: mockName,
        },
      );
      expect(ManageUser.findByIdAndDelete).not.toHaveBeenCalled();

      expect(response.body).toMatchObject({
        id: mockUserId.toString(),
        email: mockEmail,
        emailVerified: true,
      });
    });
  });

  describe('New User - ManageUser with role=superadmin', () => {
    const mockTeamId = new Types.ObjectId();

    beforeEach(() => {
      vi.mocked(User.findOne).mockReturnValue({
        populate: vi.fn().mockResolvedValue(null),
      } as any);

      const mockCompany = {
        _id: mockCompanyId,
        name: 'Test Company',
        auth0OrgId: mockAuth0OrgId,
      };

      vi.mocked(Company.findOne).mockReturnValue({
        select: vi.fn().mockResolvedValue(mockCompany),
      } as any);
    });

    it('should create user and update ManageUser when role=superadmin', async () => {
      const mockManageUser = {
        _id: mockManageUserId,
        email: mockEmail,
        name: 'Old Name',
        role: 'superadmin' as const,
        status: 'invited' as const,
        company: mockCompanyId,
        teams: [mockTeamId],
        auth0Id: '',
      };

      vi.mocked(ManageUser.findOne).mockResolvedValue(mockManageUser as any);

      const createdUser = {
        _id: mockUserId,
        id: mockUserId.toString(),
        auth0Id: mockAuth0Id,
        email: mockEmail,
        name: mockName,
        firstName: mockGivenName,
        lastName: mockFamilyName,
        company: mockCompanyId,
        teams: [mockTeamId],
        status: 'active',
        emailVerified: true,
        populate: vi.fn().mockResolvedValue({
          _id: mockUserId,
          id: mockUserId.toString(),
          auth0Id: mockAuth0Id,
          email: mockEmail,
          name: mockName,
          company: {
            _id: mockCompanyId,
            name: 'Test Company',
          },
        }),
      };

      vi.mocked(User.create).mockResolvedValue(createdUser as any);
      vi.mocked(ManageUser.findByIdAndUpdate).mockResolvedValue(
        mockManageUser as any,
      );

      const response = await request(app.server)
        .post('/success')
        .set('Authorization', 'Bearer mock-token')
        .send({ auth0_org_id: mockAuth0OrgId })
        .expect(200);

      expect(User.create).toHaveBeenCalledWith({
        auth0Id: mockAuth0Id,
        email: mockEmail,
        name: mockName,
        firstName: mockGivenName,
        lastName: mockFamilyName,
        company: mockCompanyId,
        teams: [mockTeamId],
        status: 'active',
        emailVerified: true,
      });

      expect(ManageUser.findByIdAndUpdate).toHaveBeenCalledWith(
        mockManageUserId,
        {
          status: 'active',
          auth0Id: mockAuth0Id,
          email: mockEmail,
          name: mockName,
        },
      );
      expect(ManageUser.findByIdAndDelete).not.toHaveBeenCalled();

      expect(response.body).toMatchObject({
        id: mockUserId.toString(),
        email: mockEmail,
        emailVerified: true,
      });
    });
  });

  describe('Edge Cases', () => {
    beforeEach(() => {
      vi.mocked(User.findOne).mockReturnValue({
        populate: vi.fn().mockResolvedValue(null),
      } as any);

      const mockCompany = {
        _id: mockCompanyId,
        name: 'Test Company',
        auth0OrgId: mockAuth0OrgId,
      };

      vi.mocked(Company.findOne).mockReturnValue({
        select: vi.fn().mockResolvedValue(mockCompany),
      } as any);
    });

    it('should handle ManageUser with empty teams array', async () => {
      const mockManageUser = {
        _id: mockManageUserId,
        email: mockEmail,
        name: mockName,
        role: 'admin' as const,
        status: 'invited' as const,
        company: mockCompanyId,
        teams: [],
      };

      vi.mocked(ManageUser.findOne).mockResolvedValue(mockManageUser as any);

      const createdUser = {
        _id: mockUserId,
        id: mockUserId.toString(),
        auth0Id: mockAuth0Id,
        email: mockEmail,
        name: mockName,
        firstName: mockGivenName,
        lastName: mockFamilyName,
        company: mockCompanyId,
        status: 'active',
        emailVerified: true,
        populate: vi.fn().mockResolvedValue({
          _id: mockUserId,
          id: mockUserId.toString(),
          auth0Id: mockAuth0Id,
          email: mockEmail,
          name: mockName,
          company: {
            _id: mockCompanyId,
            name: 'Test Company',
          },
        }),
      };

      vi.mocked(User.create).mockResolvedValue(createdUser as any);

      const response = await request(app.server)
        .post('/success')
        .set('Authorization', 'Bearer mock-token')
        .send({ auth0_org_id: mockAuth0OrgId })
        .expect(200);

      expect(User.create).toHaveBeenCalledWith({
        auth0Id: mockAuth0Id,
        email: mockEmail,
        name: mockName,
        firstName: mockGivenName,
        lastName: mockFamilyName,
        company: mockCompanyId,
        teams: undefined,
        status: 'active',
        emailVerified: true,
      });

      expect(response.body).toMatchObject({
        id: mockUserId.toString(),
        email: mockEmail,
        emailVerified: true,
      });
    });

    it('should handle User creation failure gracefully', async () => {
      vi.mocked(ManageUser.findOne).mockResolvedValue(null);
      vi.mocked(User.create).mockRejectedValue(new Error('Database error'));

      await request(app.server)
        .post('/success')
        .set('Authorization', 'Bearer mock-token')
        .send({ auth0_org_id: mockAuth0OrgId })
        .expect(500);

      expect(ManageUser.findByIdAndDelete).not.toHaveBeenCalled();
      expect(ManageUser.findByIdAndUpdate).not.toHaveBeenCalled();
    });
  });
});
