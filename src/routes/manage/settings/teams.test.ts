import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Fastify from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { validatorCompiler } from 'fastify-type-provider-zod';
import { Types } from 'mongoose';
import request from 'supertest';
import router from './teams.js';
import { Team } from '../../../models/Team.js';
import { ManageUser } from '../../../models/ManageUser.js';
import { User } from '../../../models/User.js';

// Mock the models
vi.mock('../../../models/Team.js', () => ({
  Team: {
    countDocuments: vi.fn(),
    find: vi.fn(),
  },
}));

vi.mock('../../../models/ManageUser.js', () => ({
  ManageUser: {
    countDocuments: vi.fn(),
    findById: vi.fn(),
    find: vi.fn(),
  },
}));

vi.mock('../../../models/User.js', () => ({
  User: {
    countDocuments: vi.fn(),
    find: vi.fn(),
  },
}));

vi.mock('../../../utils/adminLogger.js', () => ({
  logAdminAction: vi.fn(),
  createUpdateDetails: vi.fn(),
}));

describe('GET /manage/settings/teams', () => {
  let app: any;
  const mockCompanyId = new Types.ObjectId();
  let mockUser: any = null;

  beforeEach(async () => {
    // Clear all mocks before each test
    vi.clearAllMocks();
    mockUser = null;

    // Create a fresh Fastify instance with Zod type provider
    app = Fastify({ logger: false }).withTypeProvider<ZodTypeProvider>();
    app.setValidatorCompiler(validatorCompiler);

    // Mock checkAuth0JWT as Express-style middleware
    app.decorate('checkAuth0JWT', (req: any, _res: any, next: any) => {
      // Set mock auth0Data on the request
      if (mockUser) {
        req.auth0Data = {
          payload: {
            sub: `auth0|${mockUser._id.toString()}`,
          },
        };
      }
      next();
    });

    // Mock authenticateManage as a Fastify hook
    app.decorate('authenticateManage', async (req: any) => {
      // Set the mock user on the request
      if (mockUser) {
        req.user = mockUser;
      }
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

  it('should allow superadmin to see all teams with deduplicated user counts', async () => {
    const superadminId = new Types.ObjectId();
    const team1Id = new Types.ObjectId();
    const team2Id = new Types.ObjectId();
    const team3Id = new Types.ObjectId();

    const mockTeams = [
      {
        _id: team1Id,
        name: 'Team Alpha',
        company: mockCompanyId,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        lastModifiedAt: new Date('2024-01-01'),
        lastModifiedBy: superadminId,
      },
      {
        _id: team2Id,
        name: 'Team Beta',
        company: mockCompanyId,
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-02'),
        lastModifiedAt: new Date('2024-01-02'),
        lastModifiedBy: superadminId,
      },
      {
        _id: team3Id,
        name: 'Team Gamma',
        company: mockCompanyId,
        createdAt: new Date('2024-01-03'),
        updatedAt: new Date('2024-01-03'),
        lastModifiedAt: new Date('2024-01-03'),
        lastModifiedBy: superadminId,
      },
    ];

    // Set the mock user for this test
    mockUser = {
      _id: superadminId,
      role: 'superadmin',
      company: mockCompanyId,
    };

    // Mock Team.countDocuments for total teams
    vi.mocked(Team.countDocuments).mockResolvedValue(3);

    // Mock Team.find to return teams with chainable methods
    const mockTeamFind = {
      skip: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue(mockTeams),
    };
    vi.mocked(Team.find).mockReturnValue(mockTeamFind as any);

    // Setup ManageUser.find mock - called for each scenario
    let manageUserFindCallCount = 0;
    vi.mocked(ManageUser.find).mockImplementation(((query: any) => {
      manageUserFindCallCount++;

      // For "No team" query
      if (query.$or) {
        return {
          select: vi.fn().mockReturnThis(),
          lean: vi.fn().mockResolvedValue([
            { email: 'admin1@example.com', role: 'admin', status: 'active' },
            {
              email: 'duplicate@example.com',
              role: 'user',
              status: 'invited',
            }, // Will be overridden by User
          ]),
        } as any;
      }

      // For team queries
      if (query.teams?.equals(team1Id)) {
        return {
          select: vi.fn().mockReturnThis(),
          lean: vi.fn().mockResolvedValue([
            {
              email: 'team1-admin@example.com',
              role: 'admin',
              status: 'active',
            },
          ]),
        } as any;
      }

      if (query.teams?.equals(team2Id)) {
        return {
          select: vi.fn().mockReturnThis(),
          lean: vi.fn().mockResolvedValue([]), // No ManageUsers
        } as any;
      }

      if (query.teams?.equals(team3Id)) {
        return {
          select: vi.fn().mockReturnThis(),
          lean: vi.fn().mockResolvedValue([
            {
              email: 'team3-admin1@example.com',
              role: 'admin',
              status: 'active',
            },
            {
              email: 'team3-admin2@example.com',
              role: 'admin',
              status: 'active',
            },
          ]),
        } as any;
      }

      return {
        select: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue([]),
      } as any;
    }) as any);

    // Setup User.find mock
    vi.mocked(User.find).mockImplementation(((query: any) => {
      // For "No team" query
      if (query.$or) {
        return {
          select: vi.fn().mockReturnThis(),
          lean: vi.fn().mockResolvedValue([
            { email: 'user1@example.com', role: 'user', status: 'active' },
            { email: 'user2@example.com', role: 'user', status: 'active' },
            { email: 'duplicate@example.com', role: 'user', status: 'active' }, // Duplicate with invited ManageUser
          ]),
        } as any;
      }

      // For team queries
      if (query.teams?.equals(team1Id)) {
        return {
          select: vi.fn().mockReturnThis(),
          lean: vi.fn().mockResolvedValue([
            {
              email: 'team1-user1@example.com',
              role: 'user',
              status: 'active',
            },
            {
              email: 'team1-user2@example.com',
              role: 'user',
              status: 'active',
            },
          ]),
        } as any;
      }

      if (query.teams?.equals(team2Id)) {
        return {
          select: vi.fn().mockReturnThis(),
          lean: vi.fn().mockResolvedValue([
            {
              email: 'team2-user@example.com',
              role: 'user',
              status: 'active',
            },
          ]),
        } as any;
      }

      if (query.teams?.equals(team3Id)) {
        return {
          select: vi.fn().mockReturnThis(),
          lean: vi.fn().mockResolvedValue([]), // No Users
        } as any;
      }

      return {
        select: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue([]),
      } as any;
    }) as any);

    // Make request using supertest
    const response = await request(app.server)
      .get('/')
      .query({ page: 1, limit: 10 })
      .set('Authorization', 'Bearer mock-token')
      .expect(200);

    const body = response.body;

    // Superadmin should see:
    // 1. "No team assigned" virtual team
    //    - ManageUser: admin1@example.com, duplicate@example.com (invited user)
    //    - User: user1@example.com, user2@example.com, duplicate@example.com
    //    - After deduplication: 4 users (duplicate prefers User record)
    // 2. Team Alpha: 1 ManageUser + 2 Users = 3 users
    // 3. Team Beta: 0 ManageUser + 1 User = 1 user
    // 4. Team Gamma: 2 ManageUsers + 0 Users = 2 users
    expect(body.teams).toHaveLength(4);
    expect(body.teams[0].id).toBe('no-team');
    expect(body.teams[0].name).toBe('No team assigned');
    expect(body.teams[0].userCount).toBe(4); // Deduplicated count
    expect(body.teams[0].isVirtual).toBe(true);

    // Check that actual teams are included with correct user counts
    expect(body.teams[1].name).toBe('Team Alpha');
    expect(body.teams[1].userCount).toBe(3); // 1 ManageUser + 2 Users
    expect(body.teams[2].name).toBe('Team Beta');
    expect(body.teams[2].userCount).toBe(1); // 0 ManageUser + 1 User
    expect(body.teams[3].name).toBe('Team Gamma');
    expect(body.teams[3].userCount).toBe(2); // 2 ManageUsers + 0 Users

    // Verify pagination
    expect(body.pagination.total).toBe(4); // 3 teams + 1 virtual
    expect(body.pagination.currentPage).toBe(1);
  });

  it('should allow admin to only see teams they belong to with deduplicated counts', async () => {
    const adminId = new Types.ObjectId();
    const team1Id = new Types.ObjectId();
    const team2Id = new Types.ObjectId();

    // Admin belongs to team1 and team2 only
    const mockAdminTeams = [team1Id, team2Id];

    const mockTeamsUserBelongsTo = [
      {
        _id: team1Id,
        name: 'Team Alpha',
        company: mockCompanyId,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        lastModifiedAt: new Date('2024-01-01'),
        lastModifiedBy: adminId,
      },
      {
        _id: team2Id,
        name: 'Team Beta',
        company: mockCompanyId,
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-02'),
        lastModifiedAt: new Date('2024-01-02'),
        lastModifiedBy: adminId,
      },
    ];

    // Set the mock user for this test
    mockUser = {
      _id: adminId,
      role: 'admin',
      company: mockCompanyId,
    };

    // Mock ManageUser.findById to return admin user with their teams
    vi.mocked(ManageUser.findById).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue({
        _id: adminId,
        teams: mockAdminTeams,
      }),
    } as any);

    // Mock Team.countDocuments for teams admin belongs to
    vi.mocked(Team.countDocuments).mockResolvedValue(2);

    // Mock Team.find to return only teams admin belongs to
    const mockTeamFind = {
      skip: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue(mockTeamsUserBelongsTo),
    };
    vi.mocked(Team.find).mockReturnValue(mockTeamFind as any);

    // Setup ManageUser.find mock for team member queries
    vi.mocked(ManageUser.find).mockImplementation(((query: any) => {
      if (query.teams?.equals(team1Id)) {
        return {
          select: vi.fn().mockReturnThis(),
          lean: vi.fn().mockResolvedValue([
            {
              email: 'team1-admin@example.com',
              role: 'admin',
              status: 'active',
            },
          ]),
        } as any;
      }

      if (query.teams?.equals(team2Id)) {
        return {
          select: vi.fn().mockReturnThis(),
          lean: vi.fn().mockResolvedValue([
            {
              email: 'team2-admin1@example.com',
              role: 'admin',
              status: 'active',
            },
            {
              email: 'duplicate@example.com',
              role: 'user',
              status: 'invited',
            }, // Will be overridden by User
          ]),
        } as any;
      }

      return {
        select: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue([]),
      } as any;
    }) as any);

    // Setup User.find mock for team member queries
    vi.mocked(User.find).mockImplementation(((query: any) => {
      if (query.teams?.equals(team1Id)) {
        return {
          select: vi.fn().mockReturnThis(),
          lean: vi.fn().mockResolvedValue([]), // No Users in Team 1
        } as any;
      }

      if (query.teams?.equals(team2Id)) {
        return {
          select: vi.fn().mockReturnThis(),
          lean: vi.fn().mockResolvedValue([
            { email: 'duplicate@example.com', role: 'user', status: 'active' }, // Duplicate
            {
              email: 'team2-user1@example.com',
              role: 'user',
              status: 'active',
            },
            {
              email: 'team2-user2@example.com',
              role: 'user',
              status: 'active',
            },
          ]),
        } as any;
      }

      return {
        select: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue([]),
      } as any;
    }) as any);

    // Make request using supertest
    const response = await request(app.server)
      .get('/')
      .query({ page: 1, limit: 10 })
      .set('Authorization', 'Bearer mock-token')
      .expect(200);

    const body = response.body;

    // Admin should only see:
    // - The 2 teams they belong to
    // - NO "No team assigned" virtual team (because isAdmin check)
    expect(body.teams).toHaveLength(2);
    expect(body.teams[0].name).toBe('Team Alpha');
    expect(body.teams[0].userCount).toBe(1); // 1 ManageUser + 0 Users
    expect(body.teams[1].name).toBe('Team Beta');
    expect(body.teams[1].userCount).toBe(4); // 2 ManageUsers + 3 Users - 1 duplicate = 4

    // Verify that "No team assigned" is NOT included
    const hasNoTeam = body.teams.some((team: any) => team.id === 'no-team');
    expect(hasNoTeam).toBe(false);

    // Verify pagination
    expect(body.pagination.total).toBe(2);
    expect(body.pagination.currentPage).toBe(1);

    // Verify ManageUser.findById was called to get admin's teams
    expect(ManageUser.findById).toHaveBeenCalledWith(adminId);
  });

  it('should filter teams based on search query for superadmin with deduplicated counts', async () => {
    const superadminId = new Types.ObjectId();
    const team1Id = new Types.ObjectId();

    const mockTeams = [
      {
        _id: team1Id,
        name: 'Sales Team',
        company: mockCompanyId,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        lastModifiedAt: new Date('2024-01-01'),
        lastModifiedBy: superadminId,
      },
    ];

    // Set the mock user for this test
    mockUser = {
      _id: superadminId,
      role: 'superadmin',
      company: mockCompanyId,
    };

    // Mock Team.countDocuments for filtered results
    vi.mocked(Team.countDocuments).mockResolvedValue(1);

    // Mock Team.find
    const mockTeamFind = {
      skip: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue(mockTeams),
    };
    vi.mocked(Team.find).mockReturnValue(mockTeamFind as any);

    // Mock ManageUser.find for "No team" (not shown due to search) and Sales Team
    vi.mocked(ManageUser.find).mockImplementation(((query: any) => {
      if (query.$or) {
        // "No team" query - not shown due to search filter
        return {
          select: vi.fn().mockReturnThis(),
          lean: vi.fn().mockResolvedValue([]),
        } as any;
      }

      if (query.teams?.equals(team1Id)) {
        return {
          select: vi.fn().mockReturnThis(),
          lean: vi.fn().mockResolvedValue([
            {
              email: 'sales-admin@example.com',
              role: 'admin',
              status: 'active',
            },
          ]),
        } as any;
      }

      return {
        select: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue([]),
      } as any;
    }) as any);

    // Mock User.find for "No team" (not shown due to search) and Sales Team
    vi.mocked(User.find).mockImplementation(((query: any) => {
      if (query.$or) {
        // "No team" query - not shown due to search filter
        return {
          select: vi.fn().mockReturnThis(),
          lean: vi.fn().mockResolvedValue([]),
        } as any;
      }

      if (query.teams?.equals(team1Id)) {
        return {
          select: vi.fn().mockReturnThis(),
          lean: vi.fn().mockResolvedValue([
            {
              email: 'sales-user1@example.com',
              role: 'user',
              status: 'active',
            },
            {
              email: 'sales-user2@example.com',
              role: 'user',
              status: 'active',
            },
          ]),
        } as any;
      }

      return {
        select: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue([]),
      } as any;
    }) as any);

    const response = await request(app.server)
      .get('/')
      .query({ page: 1, limit: 10, search: 'sales' })
      .set('Authorization', 'Bearer mock-token')
      .expect(200);

    const body = response.body;

    // Only matching teams should be returned
    expect(body.teams).toHaveLength(1);
    expect(body.teams[0].name).toBe('Sales Team');
    expect(body.teams[0].userCount).toBe(3); // 1 ManageUser + 2 Users

    // Verify Team.find was called with search filter
    expect(Team.find).toHaveBeenCalledWith(
      expect.objectContaining({
        name: { $regex: 'sales', $options: 'i' },
        company: mockCompanyId,
      }),
    );
  });

  it('should include "No team assigned" when search matches for superadmin with deduplicated count', async () => {
    const superadminId = new Types.ObjectId();

    // Set the mock user for this test
    mockUser = {
      _id: superadminId,
      role: 'superadmin',
      company: mockCompanyId,
    };

    // Mock Team.countDocuments - no matching teams
    vi.mocked(Team.countDocuments).mockResolvedValue(0);

    // Mock Team.find - empty result
    const mockTeamFind = {
      skip: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue([]),
    };
    vi.mocked(Team.find).mockReturnValue(mockTeamFind as any);

    // Mock ManageUser.find for "No team assigned"
    vi.mocked(ManageUser.find).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue([
        { email: 'admin1@example.com', role: 'admin', status: 'active' },
        {
          email: 'duplicate@example.com',
          role: 'user',
          status: 'invited',
        }, // Will be overridden by User
      ]),
    } as any);

    // Mock User.find for "No team assigned"
    vi.mocked(User.find).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue([
        { email: 'duplicate@example.com', role: 'user', status: 'active' }, // Duplicate
      ]),
    } as any);

    const response = await request(app.server)
      .get('/')
      .query({ page: 1, limit: 10, search: 'no team' })
      .set('Authorization', 'Bearer mock-token')
      .expect(200);

    const body = response.body;

    // Should only show "No team assigned" virtual team
    expect(body.teams).toHaveLength(1);
    expect(body.teams[0].id).toBe('no-team');
    expect(body.teams[0].name).toBe('No team assigned');
    expect(body.teams[0].userCount).toBe(2); // 2 ManageUsers + 1 User - 1 duplicate = 2
    expect(body.teams[0].isVirtual).toBe(true);
  });
});

describe('POST /manage/settings/teams', () => {
  let app: any;
  const mockCompanyId = new Types.ObjectId();
  const mockAnotherCompanyId = new Types.ObjectId();
  let mockUser: any = null;

  beforeEach(async () => {
    // Clear all mocks before each test
    vi.clearAllMocks();
    mockUser = null;

    // Create a fresh Fastify instance with Zod type provider
    app = Fastify({ logger: false }).withTypeProvider<ZodTypeProvider>();
    app.setValidatorCompiler(validatorCompiler);

    // Mock checkAuth0JWT as Express-style middleware
    app.decorate('checkAuth0JWT', (req: any, _res: any, next: any) => {
      // Set mock auth0Data on the request
      if (mockUser) {
        req.auth0Data = {
          payload: {
            sub: `auth0|${mockUser._id.toString()}`,
          },
        };
      }
      next();
    });

    // Mock authenticateManage as a Fastify hook
    app.decorate('authenticateManage', async (req: any) => {
      // Set the mock user on the request
      if (mockUser) {
        req.user = mockUser;
      }
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

  it('should create a team with members from both ManageUser and User collections by email', async () => {
    const superadminId = new Types.ObjectId();
    const manageUserId = new Types.ObjectId();
    const regularUserId = new Types.ObjectId();
    const teamId = new Types.ObjectId();

    // Set the mock user for this test
    mockUser = {
      _id: superadminId,
      role: 'superadmin',
      company: mockCompanyId,
    };

    // Mock Team.create
    vi.mocked(Team as any).create = vi.fn().mockResolvedValue({
      _id: teamId,
      name: 'Test Team',
      company: mockCompanyId,
      createdAt: new Date(),
      updatedAt: new Date(),
      save: vi.fn(),
    });

    // Mock ManageUser.find to return one user
    vi.mocked(ManageUser as any).find = vi.fn().mockReturnValue({
      select: vi
        .fn()
        .mockResolvedValue([
          { _id: manageUserId, email: 'manage@example.com' },
        ]),
    });

    // Mock User.find to return one user
    vi.mocked(User as any).find = vi.fn().mockReturnValue({
      select: vi
        .fn()
        .mockResolvedValue([{ _id: regularUserId, email: 'user@example.com' }]),
    });

    // Mock ManageUser.updateMany
    vi.mocked(ManageUser as any).updateMany = vi.fn().mockResolvedValue({
      modifiedCount: 1,
    });

    // Mock User.updateMany
    vi.mocked(User as any).updateMany = vi.fn().mockResolvedValue({
      modifiedCount: 1,
    });

    const response = await request(app.server)
      .post('/')
      .send({
        name: 'Test Team',
        emails: ['manage@example.com', 'user@example.com'],
      })
      .set('Authorization', 'Bearer mock-token')
      .expect(201);

    const body = response.body;

    // Verify response
    expect(body.name).toBe('Test Team');
    expect(body.company).toBeDefined();

    // Verify ManageUser.find was called with correct filters
    expect(ManageUser.find).toHaveBeenCalledWith({
      email: { $in: ['manage@example.com', 'user@example.com'] },
      company: mockCompanyId,
      isDeleted: { $ne: true },
    });

    // Verify User.find was called with correct filters
    expect(User.find).toHaveBeenCalledWith({
      email: { $in: ['manage@example.com', 'user@example.com'] },
      company: mockCompanyId,
      isDeleted: { $ne: true },
    });

    // Verify both updateMany were called with company filter
    expect(ManageUser.updateMany).toHaveBeenCalledWith(
      {
        _id: { $in: [manageUserId] },
        company: mockCompanyId,
      },
      { $addToSet: { teams: teamId } },
    );

    expect(User.updateMany).toHaveBeenCalledWith(
      {
        _id: { $in: [regularUserId] },
        company: mockCompanyId,
      },
      { $addToSet: { teams: teamId } },
    );
  });

  it('should prevent adding users from another company when creating team', async () => {
    const superadminId = new Types.ObjectId();
    const teamId = new Types.ObjectId();

    // Set the mock user for this test
    mockUser = {
      _id: superadminId,
      role: 'superadmin',
      company: mockCompanyId,
    };

    // Mock Team.create
    vi.mocked(Team as any).create = vi.fn().mockResolvedValue({
      _id: teamId,
      name: 'Test Team',
      company: mockCompanyId,
      createdAt: new Date(),
      updatedAt: new Date(),
      save: vi.fn(),
    });

    // Mock ManageUser.find to return empty (no users from this company with these emails)
    vi.mocked(ManageUser as any).find = vi.fn().mockReturnValue({
      select: vi.fn().mockResolvedValue([]),
    });

    // Mock User.find to return empty (no users from this company with these emails)
    vi.mocked(User as any).find = vi.fn().mockReturnValue({
      select: vi.fn().mockResolvedValue([]),
    });

    // Mock ManageUser.updateMany (should not be called)
    vi.mocked(ManageUser as any).updateMany = vi.fn().mockResolvedValue({
      modifiedCount: 0,
    });

    // Mock User.updateMany (should not be called)
    vi.mocked(User as any).updateMany = vi.fn().mockResolvedValue({
      modifiedCount: 0,
    });

    const response = await request(app.server)
      .post('/')
      .send({
        name: 'Test Team',
        emails: ['other-company@example.com'],
      })
      .set('Authorization', 'Bearer mock-token')
      .expect(201);

    // Verify ManageUser.find was called with company filter
    expect(ManageUser.find).toHaveBeenCalledWith({
      email: { $in: ['other-company@example.com'] },
      company: mockCompanyId,
      isDeleted: { $ne: true },
    });

    // Verify User.find was called with company filter
    expect(User.find).toHaveBeenCalledWith({
      email: { $in: ['other-company@example.com'] },
      company: mockCompanyId,
      isDeleted: { $ne: true },
    });

    // Verify updateMany was not called since no users were found
    expect(ManageUser.updateMany).not.toHaveBeenCalled();
    expect(User.updateMany).not.toHaveBeenCalled();
  });
});

describe('PUT /manage/settings/teams/:teamId', () => {
  let app: any;
  const mockCompanyId = new Types.ObjectId();
  const mockAnotherCompanyId = new Types.ObjectId();
  let mockUser: any = null;

  beforeEach(async () => {
    // Clear all mocks before each test
    vi.clearAllMocks();
    mockUser = null;

    // Create a fresh Fastify instance with Zod type provider
    app = Fastify({ logger: false }).withTypeProvider<ZodTypeProvider>();
    app.setValidatorCompiler(validatorCompiler);

    // Mock checkAuth0JWT as Express-style middleware
    app.decorate('checkAuth0JWT', (req: any, _res: any, next: any) => {
      // Set mock auth0Data on the request
      if (mockUser) {
        req.auth0Data = {
          payload: {
            sub: `auth0|${mockUser._id.toString()}`,
          },
        };
      }
      next();
    });

    // Mock authenticateManage as a Fastify hook
    app.decorate('authenticateManage', async (req: any) => {
      // Set the mock user on the request
      if (mockUser) {
        req.user = mockUser;
      }
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

  it('should update team members from both ManageUser and User collections by email', async () => {
    const superadminId = new Types.ObjectId();
    const teamId = new Types.ObjectId();
    const manageUserId = new Types.ObjectId();
    const regularUserId = new Types.ObjectId();

    // Set the mock user for this test
    mockUser = {
      _id: superadminId,
      role: 'superadmin',
      company: mockCompanyId,
    };

    // Mock Team.findById
    vi.mocked(Team as any).findById = vi.fn().mockResolvedValue({
      _id: teamId,
      name: 'Existing Team',
      company: mockCompanyId,
      lastModifiedBy: superadminId,
      lastModifiedAt: new Date(),
      save: vi.fn().mockResolvedValue(true),
    });

    // Mock ManageUser.find to return one user
    vi.mocked(ManageUser as any).find = vi.fn().mockReturnValue({
      select: vi
        .fn()
        .mockResolvedValue([
          { _id: manageUserId, email: 'manage@example.com' },
        ]),
    });

    // Mock User.find to return one user
    vi.mocked(User as any).find = vi.fn().mockReturnValue({
      select: vi
        .fn()
        .mockResolvedValue([{ _id: regularUserId, email: 'user@example.com' }]),
    });

    // Mock ManageUser.updateMany for both removal and addition
    vi.mocked(ManageUser as any).updateMany = vi.fn().mockResolvedValue({
      modifiedCount: 1,
    });

    // Mock User.updateMany for both removal and addition
    vi.mocked(User as any).updateMany = vi.fn().mockResolvedValue({
      modifiedCount: 1,
    });

    const response = await request(app.server)
      .put(`/${teamId.toString()}`)
      .send({
        emails: ['manage@example.com', 'user@example.com'],
      })
      .set('Authorization', 'Bearer mock-token')
      .expect(200);

    // Verify ManageUser.find was called with correct filters
    expect(ManageUser.find).toHaveBeenCalledWith({
      email: { $in: ['manage@example.com', 'user@example.com'] },
      company: mockCompanyId,
      isDeleted: { $ne: true },
    });

    // Verify User.find was called with correct filters
    expect(User.find).toHaveBeenCalledWith({
      email: { $in: ['manage@example.com', 'user@example.com'] },
      company: mockCompanyId,
      isDeleted: { $ne: true },
    });

    // Verify ManageUser.updateMany was called multiple times (removal + addition)
    expect(ManageUser.updateMany).toHaveBeenCalledWith(
      { teams: teamId, company: mockCompanyId },
      { $pull: { teams: teamId } },
    );

    expect(ManageUser.updateMany).toHaveBeenCalledWith(
      {
        _id: { $in: [manageUserId] },
        company: mockCompanyId,
        isDeleted: { $ne: true },
      },
      { $addToSet: { teams: teamId } },
    );

    // Verify User.updateMany was called multiple times (removal + addition)
    expect(User.updateMany).toHaveBeenCalledWith(
      { teams: teamId, company: mockCompanyId },
      { $pull: { teams: teamId } },
    );

    expect(User.updateMany).toHaveBeenCalledWith(
      {
        _id: { $in: [regularUserId] },
        company: mockCompanyId,
        isDeleted: { $ne: true },
      },
      { $addToSet: { teams: teamId } },
    );
  });

  it('should prevent updating team members from another company', async () => {
    const superadminId = new Types.ObjectId();
    const teamId = new Types.ObjectId();

    // Set the mock user for this test
    mockUser = {
      _id: superadminId,
      role: 'superadmin',
      company: mockCompanyId,
    };

    // Mock Team.findById
    vi.mocked(Team as any).findById = vi.fn().mockResolvedValue({
      _id: teamId,
      name: 'Existing Team',
      company: mockCompanyId,
      lastModifiedBy: superadminId,
      lastModifiedAt: new Date(),
      save: vi.fn().mockResolvedValue(true),
    });

    // Mock ManageUser.find to return empty (no users from this company with these emails)
    vi.mocked(ManageUser as any).find = vi.fn().mockReturnValue({
      select: vi.fn().mockResolvedValue([]),
    });

    // Mock User.find to return empty (no users from this company with these emails)
    vi.mocked(User as any).find = vi.fn().mockReturnValue({
      select: vi.fn().mockResolvedValue([]),
    });

    // Mock ManageUser.updateMany
    vi.mocked(ManageUser as any).updateMany = vi.fn().mockResolvedValue({
      modifiedCount: 0,
    });

    // Mock User.updateMany
    vi.mocked(User as any).updateMany = vi.fn().mockResolvedValue({
      modifiedCount: 0,
    });

    const response = await request(app.server)
      .put(`/${teamId.toString()}`)
      .send({
        emails: ['other-company@example.com'],
      })
      .set('Authorization', 'Bearer mock-token')
      .expect(200);

    // Verify ManageUser.find was called with company filter
    expect(ManageUser.find).toHaveBeenCalledWith({
      email: { $in: ['other-company@example.com'] },
      company: mockCompanyId,
      isDeleted: { $ne: true },
    });

    // Verify User.find was called with company filter
    expect(User.find).toHaveBeenCalledWith({
      email: { $in: ['other-company@example.com'] },
      company: mockCompanyId,
      isDeleted: { $ne: true },
    });

    // Verify removal was called with company filter
    expect(ManageUser.updateMany).toHaveBeenCalledWith(
      { teams: teamId, company: mockCompanyId },
      { $pull: { teams: teamId } },
    );

    expect(User.updateMany).toHaveBeenCalledWith(
      { teams: teamId, company: mockCompanyId },
      { $pull: { teams: teamId } },
    );

    // Verify addition updateMany was not called since no users were found
    expect(ManageUser.updateMany).toHaveBeenCalledTimes(1); // Only removal
    expect(User.updateMany).toHaveBeenCalledTimes(1); // Only removal
  });

  it('should prevent updating team from another company', async () => {
    const superadminId = new Types.ObjectId();
    const teamId = new Types.ObjectId();

    // Set the mock user for this test - user from mockCompanyId
    mockUser = {
      _id: superadminId,
      role: 'admin', // Not superadmin
      company: mockCompanyId,
    };

    // Mock Team.findById - team belongs to mockAnotherCompanyId
    vi.mocked(Team as any).findById = vi.fn().mockResolvedValue({
      _id: teamId,
      name: 'Another Company Team',
      company: {
        equals: (other: any) => other.equals(mockAnotherCompanyId),
      },
      lastModifiedBy: superadminId,
      lastModifiedAt: new Date(),
      save: vi.fn().mockResolvedValue(true),
    });

    const response = await request(app.server)
      .put(`/${teamId.toString()}`)
      .send({
        name: 'Updated Name',
        emails: ['user@example.com'],
      })
      .set('Authorization', 'Bearer mock-token')
      .expect(403);

    // Verify error message
    expect(response.body.error).toBe('Access denied');

    // Verify no updates were attempted
    expect(ManageUser.updateMany).not.toHaveBeenCalled();
    expect(User.updateMany).not.toHaveBeenCalled();
  });
});

describe('GET /manage/settings/teams/:teamId - Email Deduplication', () => {
  let app: any;
  const mockCompanyId = new Types.ObjectId();
  let mockUser: any = null;

  beforeEach(async () => {
    // Clear all mocks before each test
    vi.clearAllMocks();
    mockUser = null;

    // Create a fresh Fastify instance with Zod type provider
    app = Fastify({ logger: false }).withTypeProvider<ZodTypeProvider>();
    app.setValidatorCompiler(validatorCompiler);

    // Mock checkAuth0JWT as Express-style middleware
    app.decorate('checkAuth0JWT', (req: any, _res: any, next: any) => {
      // Set mock auth0Data on the request
      if (mockUser) {
        req.auth0Data = {
          payload: {
            sub: `auth0|${mockUser._id.toString()}`,
          },
        };
      }
      next();
    });

    // Mock authenticateManage as a Fastify hook
    app.decorate('authenticateManage', async (req: any) => {
      // Set the mock user on the request
      if (mockUser) {
        req.user = mockUser;
      }
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

  it('should return unique members when email only exists in ManageUser', async () => {
    const superadminId = new Types.ObjectId();
    const teamId = new Types.ObjectId();
    const manageUserId = new Types.ObjectId();

    mockUser = {
      _id: superadminId,
      role: 'superadmin',
      company: mockCompanyId,
    };

    // Mock Team.findById
    vi.mocked(Team as any).findById = vi.fn().mockReturnValue({
      populate: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue({
        _id: teamId,
        name: 'Test Team',
        company: mockCompanyId,
      }),
    });

    // Mock ManageUser.find - one user
    vi.mocked(ManageUser.find).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue([
        {
          _id: manageUserId,
          email: 'admin@example.com',
          name: 'Admin User',
          role: 'admin',
          status: 'active',
        },
      ]),
    } as any);

    // Mock User.find - empty
    vi.mocked(User.find).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue([]),
    } as any);

    const response = await request(app.server)
      .get(`/${teamId.toString()}`)
      .set('Authorization', 'Bearer mock-token')
      .expect(200);

    const body = response.body;

    // Should return 1 member (from ManageUser only)
    expect(body.members).toHaveLength(1);
    expect(body.members[0].email).toBe('admin@example.com');
    expect(body.members[0].role).toBe('admin');
    expect(body.userCount).toBe(1);
  });

  it('should return unique members when email only exists in User', async () => {
    const superadminId = new Types.ObjectId();
    const teamId = new Types.ObjectId();
    const userId = new Types.ObjectId();

    mockUser = {
      _id: superadminId,
      role: 'superadmin',
      company: mockCompanyId,
    };

    // Mock Team.findById
    vi.mocked(Team as any).findById = vi.fn().mockReturnValue({
      populate: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue({
        _id: teamId,
        name: 'Test Team',
        company: mockCompanyId,
      }),
    });

    // Mock ManageUser.find - empty
    vi.mocked(ManageUser.find).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue([]),
    } as any);

    // Mock User.find - one user
    vi.mocked(User.find).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue([
        {
          _id: userId,
          email: 'user@example.com',
          name: 'Regular User',
          role: 'user',
          status: 'active',
        },
      ]),
    } as any);

    const response = await request(app.server)
      .get(`/${teamId.toString()}`)
      .set('Authorization', 'Bearer mock-token')
      .expect(200);

    const body = response.body;

    // Should return 1 member (from User only)
    expect(body.members).toHaveLength(1);
    expect(body.members[0].email).toBe('user@example.com');
    expect(body.members[0].role).toBe('user');
    expect(body.userCount).toBe(1);
  });

  it('should prefer User record when ManageUser has status=invited and role=user', async () => {
    const superadminId = new Types.ObjectId();
    const teamId = new Types.ObjectId();
    const manageUserId = new Types.ObjectId();
    const userId = new Types.ObjectId();

    mockUser = {
      _id: superadminId,
      role: 'superadmin',
      company: mockCompanyId,
    };

    // Mock Team.findById
    vi.mocked(Team as any).findById = vi.fn().mockReturnValue({
      populate: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue({
        _id: teamId,
        name: 'Test Team',
        company: mockCompanyId,
      }),
    });

    // Mock ManageUser.find - invited user with role='user'
    vi.mocked(ManageUser.find).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue([
        {
          _id: manageUserId,
          email: 'duplicate@example.com',
          name: 'Invited User',
          role: 'user',
          status: 'invited',
        },
      ]),
    } as any);

    // Mock User.find - active user with same email
    vi.mocked(User.find).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue([
        {
          _id: userId,
          email: 'duplicate@example.com',
          name: 'Active User',
          role: 'user',
          status: 'active',
        },
      ]),
    } as any);

    const response = await request(app.server)
      .get(`/${teamId.toString()}`)
      .set('Authorization', 'Bearer mock-token')
      .expect(200);

    const body = response.body;

    // Should return 1 member (from User, not ManageUser)
    expect(body.members).toHaveLength(1);
    expect(body.members[0].email).toBe('duplicate@example.com');
    expect(body.members[0].name).toBe('Active User');
    expect(body.members[0].status).toBe('active');
    expect(body.members[0]._id.toString()).toBe(userId.toString());
    expect(body.userCount).toBe(1);
  });

  it('should prefer ManageUser record when ManageUser has status=active', async () => {
    const superadminId = new Types.ObjectId();
    const teamId = new Types.ObjectId();
    const manageUserId = new Types.ObjectId();
    const userId = new Types.ObjectId();

    mockUser = {
      _id: superadminId,
      role: 'superadmin',
      company: mockCompanyId,
    };

    // Mock Team.findById
    vi.mocked(Team as any).findById = vi.fn().mockReturnValue({
      populate: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue({
        _id: teamId,
        name: 'Test Team',
        company: mockCompanyId,
      }),
    });

    // Mock ManageUser.find - active admin
    vi.mocked(ManageUser.find).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue([
        {
          _id: manageUserId,
          email: 'duplicate@example.com',
          name: 'Admin User',
          role: 'admin',
          status: 'active',
        },
      ]),
    } as any);

    // Mock User.find - user with same email
    vi.mocked(User.find).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue([
        {
          _id: userId,
          email: 'duplicate@example.com',
          name: 'Regular User',
          role: 'user',
          status: 'active',
        },
      ]),
    } as any);

    const response = await request(app.server)
      .get(`/${teamId.toString()}`)
      .set('Authorization', 'Bearer mock-token')
      .expect(200);

    const body = response.body;

    // Should return 1 member (from ManageUser, not User)
    expect(body.members).toHaveLength(1);
    expect(body.members[0].email).toBe('duplicate@example.com');
    expect(body.members[0].name).toBe('Admin User');
    expect(body.members[0].role).toBe('admin');
    expect(body.members[0]._id.toString()).toBe(manageUserId.toString());
    expect(body.userCount).toBe(1);
  });

  it('should prefer ManageUser when role is superadmin even with invited status', async () => {
    const superadminId = new Types.ObjectId();
    const teamId = new Types.ObjectId();
    const manageUserId = new Types.ObjectId();
    const userId = new Types.ObjectId();

    mockUser = {
      _id: superadminId,
      role: 'superadmin',
      company: mockCompanyId,
    };

    // Mock Team.findById
    vi.mocked(Team as any).findById = vi.fn().mockReturnValue({
      populate: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue({
        _id: teamId,
        name: 'Test Team',
        company: mockCompanyId,
      }),
    });

    // Mock ManageUser.find - invited superadmin
    vi.mocked(ManageUser.find).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue([
        {
          _id: manageUserId,
          email: 'duplicate@example.com',
          name: 'Superadmin User',
          role: 'superadmin',
          status: 'invited',
        },
      ]),
    } as any);

    // Mock User.find - user with same email
    vi.mocked(User.find).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue([
        {
          _id: userId,
          email: 'duplicate@example.com',
          name: 'Regular User',
          role: 'user',
          status: 'active',
        },
      ]),
    } as any);

    const response = await request(app.server)
      .get(`/${teamId.toString()}`)
      .set('Authorization', 'Bearer mock-token')
      .expect(200);

    const body = response.body;

    // Should return 1 member (from ManageUser with superadmin role)
    expect(body.members).toHaveLength(1);
    expect(body.members[0].email).toBe('duplicate@example.com');
    expect(body.members[0].name).toBe('Superadmin User');
    expect(body.members[0].role).toBe('superadmin');
    expect(body.members[0]._id.toString()).toBe(manageUserId.toString());
    expect(body.userCount).toBe(1);
  });

  it('should handle multiple users with different deduplication scenarios', async () => {
    const superadminId = new Types.ObjectId();
    const teamId = new Types.ObjectId();

    mockUser = {
      _id: superadminId,
      role: 'superadmin',
      company: mockCompanyId,
    };

    // Mock Team.findById
    vi.mocked(Team as any).findById = vi.fn().mockReturnValue({
      populate: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue({
        _id: teamId,
        name: 'Test Team',
        company: mockCompanyId,
      }),
    });

    // Mock ManageUser.find - multiple users
    vi.mocked(ManageUser.find).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue([
        {
          _id: new Types.ObjectId(),
          email: 'admin@example.com',
          name: 'Admin Only',
          role: 'admin',
          status: 'active',
        },
        {
          _id: new Types.ObjectId(),
          email: 'invited-user@example.com',
          name: 'Invited User ManageUser',
          role: 'user',
          status: 'invited',
        },
        {
          _id: new Types.ObjectId(),
          email: 'active-admin@example.com',
          name: 'Active Admin',
          role: 'admin',
          status: 'active',
        },
      ]),
    } as any);

    // Mock User.find - multiple users including duplicates
    vi.mocked(User.find).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue([
        {
          _id: new Types.ObjectId(),
          email: 'user-only@example.com',
          name: 'User Only',
          role: 'user',
          status: 'active',
        },
        {
          _id: new Types.ObjectId(),
          email: 'invited-user@example.com',
          name: 'Active User',
          role: 'user',
          status: 'active',
        },
        {
          _id: new Types.ObjectId(),
          email: 'active-admin@example.com',
          name: 'User Record for Admin',
          role: 'user',
          status: 'active',
        },
      ]),
    } as any);

    const response = await request(app.server)
      .get(`/${teamId.toString()}`)
      .set('Authorization', 'Bearer mock-token')
      .expect(200);

    const body = response.body;

    // Should return 4 unique members:
    // 1. admin@example.com (from ManageUser only)
    // 2. invited-user@example.com (from User, not invited ManageUser)
    // 3. active-admin@example.com (from ManageUser, not User)
    // 4. user-only@example.com (from User only)
    expect(body.members).toHaveLength(4);
    expect(body.userCount).toBe(4);

    const emails = body.members.map((m: any) => m.email).sort();
    expect(emails).toEqual([
      'active-admin@example.com',
      'admin@example.com',
      'invited-user@example.com',
      'user-only@example.com',
    ]);

    // Verify specific member details
    const adminOnly = body.members.find(
      (m: any) => m.email === 'admin@example.com',
    );
    expect(adminOnly.name).toBe('Admin Only');
    expect(adminOnly.role).toBe('admin');

    const invitedUser = body.members.find(
      (m: any) => m.email === 'invited-user@example.com',
    );
    expect(invitedUser.name).toBe('Active User'); // From User, not ManageUser

    const activeAdmin = body.members.find(
      (m: any) => m.email === 'active-admin@example.com',
    );
    expect(activeAdmin.name).toBe('Active Admin'); // From ManageUser, not User

    const userOnly = body.members.find(
      (m: any) => m.email === 'user-only@example.com',
    );
    expect(userOnly.name).toBe('User Only');
    expect(userOnly.role).toBe('user');
  });

  it('should handle empty members correctly', async () => {
    const superadminId = new Types.ObjectId();
    const teamId = new Types.ObjectId();

    mockUser = {
      _id: superadminId,
      role: 'superadmin',
      company: mockCompanyId,
    };

    // Mock Team.findById
    vi.mocked(Team as any).findById = vi.fn().mockReturnValue({
      populate: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue({
        _id: teamId,
        name: 'Empty Team',
        company: mockCompanyId,
      }),
    });

    // Mock ManageUser.find - empty
    vi.mocked(ManageUser.find).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue([]),
    } as any);

    // Mock User.find - empty
    vi.mocked(User.find).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue([]),
    } as any);

    const response = await request(app.server)
      .get(`/${teamId.toString()}`)
      .set('Authorization', 'Bearer mock-token')
      .expect(200);

    const body = response.body;

    // Should return 0 members
    expect(body.members).toHaveLength(0);
    expect(body.userCount).toBe(0);
  });
});
