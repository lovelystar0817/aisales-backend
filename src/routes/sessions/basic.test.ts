import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Fastify from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { validatorCompiler } from 'fastify-type-provider-zod';
import { Types } from 'mongoose';
import request from 'supertest';
import router from './basic.js';
import { SalesSession } from '../../models/SalesSession.js';
import { Company } from '../../models/Company.js';
import { Scenario } from '../../models/Scenario.js';

// Mock the models
vi.mock('../../models/SalesSession.js', () => ({
  SalesSession: {
    create: vi.fn(),
    find: vi.fn(),
    findById: vi.fn(),
    countDocuments: vi.fn(),
  },
  CallType: {
    COLD_CALL: 'cold-call',
    INITIAL_OUTREACH: 'initial-outreach',
    DISCOVERY: 'discovery',
    COMPETITIVE_PROPOSAL: 'competitive-proposal',
    OBJECTION_HANDLING: 'objection-handling',
    PRODUCT_POSITIONING: 'product-positioning',
    CLOSING: 'closing',
    REVIEW_RENEWAL: 'review-renewal',
    GRAB_COLD_CALL: 'cold-call-meddpicc',
    MSIG_TELESALES: 'telesales',
    MANULIFE_FNA: 'fna',
    GRAB_MEX: 'grab-mex',
    PRUDENTIAL_OBJECTION_HANDLING: 'prudential-objection-handling',
  },
}));

vi.mock('../../models/Company.js', () => ({
  Company: {
    findById: vi.fn(),
    modelName: 'Company',
  },
}));

vi.mock('../../models/Team.js', () => ({
  Team: {
    findById: vi.fn(),
    find: vi.fn(),
    modelName: 'Team',
  },
}));

vi.mock('../../models/Message.js', () => ({
  Message: {
    find: vi.fn(),
    modelName: 'Message',
  },
}));

vi.mock('../../models/ManageUser.js', () => ({
  ManageUser: {
    findOne: vi.fn(),
    modelName: 'ManageUser',
  },
}));

vi.mock('../../models/Scenario.js', () => ({
  Scenario: {
    findById: vi.fn(),
    findOne: vi.fn(),
  },
}));

vi.mock('../../models/UserModuleAccess.js', () => ({
  UserModuleAccess: {
    find: vi.fn(),
    findOneAndUpdate: vi.fn(),
  },
}));

vi.mock('../../models/Voice.js', () => ({
  Voice: {
    find: vi.fn(),
  },
}));

// Mock utility functions
vi.mock('../../utils/module.js', () => ({
  getModuleByFriendlyId: vi.fn(),
  getModuleById: vi.fn(),
  getModules: vi.fn(() => []),
  getModulesV2: vi.fn(() => []),
  getLocalizedModuleFromScenario: vi.fn(),
}));

vi.mock('../../utils/persona.js', () => ({
  getPersonaById: vi.fn(),
  getPersonas: vi.fn(),
}));

vi.mock('../../utils/product.js', () => ({
  getProductById: vi.fn(),
  getProductByFriendlyId: vi.fn(),
}));

vi.mock('../../utils/prudential-standing.js', () => ({
  shouldUsePrudentialData: vi.fn(() => false),
  findStandingConfigurationForSession: vi.fn(),
  enrichSessionStanding: vi.fn(),
  analyzeStandingProgression: vi.fn(),
}));

vi.mock('../../utils/session-auth.js', () => ({
  verifyAndPopulateSession: vi.fn(),
}));

vi.mock('../../data/disclaimers/prudential.js', () => ({
  getModuleDisclaimer: vi.fn(),
}));

vi.mock('../../data/personas/difficulty-specific.js', () => ({
  getPersonaSpecificDifficulty: vi.fn(),
}));

vi.mock('../../data/bbl-objections.js', () => ({
  selectRandomBBLObjections: vi.fn(),
}));

vi.mock('../../frameworks/common.js', () => ({
  DEFAULT_FRAMEWORK: 'MEDDPICC',
  getTranslatedFramework: vi.fn((framework: string) => framework),
}));

vi.mock('../../locale/request.js', () => ({
  getLanguageHeader: vi.fn(() => 'en'),
}));

vi.mock('../../constants/modules.js', () => ({
  ALL_SALES_MODULES: [],
}));

describe('POST /sessions/', () => {
  let app: any;
  const mockCompanyId = new Types.ObjectId();
  const mockUserId = new Types.ObjectId();
  const mockTeamId1 = new Types.ObjectId();
  const mockTeamId2 = new Types.ObjectId();
  const mockPersonaId = new Types.ObjectId();
  const mockModuleId = new Types.ObjectId();
  const mockProductId = new Types.ObjectId();
  const mockSessionId = new Types.ObjectId();
  let mockUser: any = null;

  beforeEach(async () => {
    // Clear all mocks before each test
    vi.clearAllMocks();
    mockUser = {
      _id: mockUserId,
      company: mockCompanyId,
      teams: [mockTeamId1, mockTeamId2],
    };

    // Create a fresh Fastify instance with Zod type provider
    app = Fastify({ logger: false }).withTypeProvider<ZodTypeProvider>();
    app.setValidatorCompiler(validatorCompiler);

    // Mock checkAuth0JWT as Express-style middleware
    app.decorate('checkAuth0JWT', (_req: any, _res: any, next: any) => {
      next();
    });

    // Mock authenticate as a Fastify hook
    app.decorate('authenticate', async (req: any) => {
      if (mockUser) {
        req.user = mockUser;
      }
    });

    // Mock authenticateManage as a Fastify hook
    app.decorate('authenticateManage', async (req: any) => {
      if (mockUser) {
        req.user = mockUser;
      }
    });

    // Register @fastify/express for middleware support
    await app.register(import('@fastify/express'));

    // Register the actual router
    await app.register(router);

    // Start the server on a random available port
    await app.listen({ port: 0 });
  });

  afterEach(async () => {
    await app.close();
  });

  it('should create a session and save user teams', async () => {
    const mockCompany = {
      _id: mockCompanyId,
      selfServiceEnabled: false,
    };

    vi.mocked(Company.findById).mockResolvedValue(mockCompany as any);

    const createdSession = {
      _id: mockSessionId,
      user: mockUserId,
      teams: [mockTeamId1, mockTeamId2],
      callType: 'initial-outreach',
      assessmentType: 'regular',
      startedAt: new Date(),
    };

    vi.mocked(SalesSession.create).mockResolvedValue(createdSession as any);

    // Mock the utility functions to return valid data
    const { getModuleById, getModuleByFriendlyId } = await import(
      '../../utils/module.js'
    );
    const { getPersonaById } = await import('../../utils/persona.js');
    const { getProductById, getProductByFriendlyId } = await import(
      '../../utils/product.js'
    );

    vi.mocked(getModuleById).mockReturnValue({
      _id: mockModuleId,
      friendlyId: 'initial-outreach',
      title: 'Initial Outreach',
      framework: 'MEDDPICC',
      objectives: ['Build rapport', 'Qualify prospect'],
    } as any);

    vi.mocked(getModuleByFriendlyId).mockReturnValue({
      _id: mockModuleId,
      friendlyId: 'initial-outreach',
      title: 'Initial Outreach',
      framework: 'MEDDPICC',
      objectives: ['Build rapport', 'Qualify prospect'],
    } as any);

    vi.mocked(getPersonaById).mockReturnValue({
      _id: mockPersonaId,
      friendlyId: 'busy-executive',
      name: 'Busy Executive',
      occupation: 'CEO',
      voiceId: 'voice-123',
      details: {
        salesDescription: 'A busy executive',
        mainObjection: 'No time',
        salesGoal: 'Schedule a meeting',
      },
    } as any);

    vi.mocked(getProductById).mockReturnValue({
      _id: mockProductId,
      friendlyId: 'health-insurance',
      name: 'Health Insurance',
      description: 'Comprehensive health coverage',
    } as any);

    vi.mocked(getProductByFriendlyId).mockReturnValue({
      _id: mockProductId,
      friendlyId: 'health-insurance',
      name: 'Health Insurance',
      description: 'Comprehensive health coverage',
    } as any);

    const response = await request(app.server)
      .post('/')
      .set('Authorization', 'Bearer mock-token')
      .set('Accept-Language', 'en')
      .send({
        personaId: mockPersonaId.toString(),
        moduleId: mockModuleId.toString(),
        productId: mockProductId.toString(),
      });

    // Log the response for debugging if not 200
    if (response.status !== 200) {
      console.log('Response status:', response.status);
      console.log('Response body:', response.body);
    }

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.sessionId).toBe(mockSessionId.toString());

    // Verify that SalesSession.create was called with teams field
    expect(SalesSession.create).toHaveBeenCalledWith(
      expect.objectContaining({
        user: mockUserId,
        teams: [mockTeamId1, mockTeamId2],
        callType: 'initial-outreach',
        assessmentType: 'regular',
      }),
    );
  }, 10000);

  it('should create a session with empty teams array when user has no teams', async () => {
    // Override mockUser to return a user without teams
    mockUser = {
      _id: mockUserId,
      company: mockCompanyId,
      teams: [],
    };

    const mockCompany = {
      _id: mockCompanyId,
      selfServiceEnabled: false,
    };

    vi.mocked(Company.findById).mockResolvedValue(mockCompany as any);

    const createdSession = {
      _id: mockSessionId,
      user: mockUserId,
      teams: [],
      callType: 'initial-outreach',
      assessmentType: 'regular',
      startedAt: new Date(),
    };

    vi.mocked(SalesSession.create).mockResolvedValue(createdSession as any);

    // Mock the utility functions
    const { getModuleById, getModuleByFriendlyId } = await import(
      '../../utils/module.js'
    );
    const { getPersonaById } = await import('../../utils/persona.js');
    const { getProductById, getProductByFriendlyId } = await import(
      '../../utils/product.js'
    );

    vi.mocked(getModuleById).mockReturnValue({
      _id: mockModuleId,
      friendlyId: 'initial-outreach',
      title: 'Initial Outreach',
      framework: 'MEDDPICC',
      objectives: ['Build rapport', 'Qualify prospect'],
    } as any);

    vi.mocked(getModuleByFriendlyId).mockReturnValue({
      _id: mockModuleId,
      friendlyId: 'initial-outreach',
      title: 'Initial Outreach',
      framework: 'MEDDPICC',
      objectives: ['Build rapport', 'Qualify prospect'],
    } as any);

    vi.mocked(getPersonaById).mockReturnValue({
      _id: mockPersonaId,
      friendlyId: 'busy-executive',
      name: 'Busy Executive',
      occupation: 'CEO',
      voiceId: 'voice-123',
      details: {
        salesDescription: 'A busy executive',
        mainObjection: 'No time',
        salesGoal: 'Schedule a meeting',
      },
    } as any);

    vi.mocked(getProductById).mockReturnValue({
      _id: mockProductId,
      friendlyId: 'health-insurance',
      name: 'Health Insurance',
      description: 'Comprehensive health coverage',
    } as any);

    vi.mocked(getProductByFriendlyId).mockReturnValue({
      _id: mockProductId,
      friendlyId: 'health-insurance',
      name: 'Health Insurance',
      description: 'Comprehensive health coverage',
    } as any);

    const response = await request(app.server)
      .post('/')
      .set('Authorization', 'Bearer mock-token')
      .set('Accept-Language', 'en')
      .send({
        personaId: mockPersonaId.toString(),
        moduleId: mockModuleId.toString(),
        productId: mockProductId.toString(),
      });

    // Log the response for debugging if not 200
    if (response.status !== 200) {
      console.log('Response status:', response.status);
      console.log('Response body:', response.body);
    }

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    // Verify that SalesSession.create was called with empty teams array
    expect(SalesSession.create).toHaveBeenCalledWith(
      expect.objectContaining({
        user: mockUserId,
        teams: [],
      }),
    );
  }, 10000);

  it('should create a session with empty teams array when user teams is undefined', async () => {
    // Override mockUser to return a user without teams property
    mockUser = {
      _id: mockUserId,
      company: mockCompanyId,
      // teams is undefined
    };

    const mockCompany = {
      _id: mockCompanyId,
      selfServiceEnabled: false,
    };

    vi.mocked(Company.findById).mockResolvedValue(mockCompany as any);

    const createdSession = {
      _id: mockSessionId,
      user: mockUserId,
      teams: [],
      callType: 'initial-outreach',
      assessmentType: 'regular',
      startedAt: new Date(),
    };

    vi.mocked(SalesSession.create).mockResolvedValue(createdSession as any);

    // Mock the utility functions
    const { getModuleById, getModuleByFriendlyId } = await import(
      '../../utils/module.js'
    );
    const { getPersonaById } = await import('../../utils/persona.js');
    const { getProductById, getProductByFriendlyId } = await import(
      '../../utils/product.js'
    );

    vi.mocked(getModuleById).mockReturnValue({
      _id: mockModuleId,
      friendlyId: 'initial-outreach',
      title: 'Initial Outreach',
      framework: 'MEDDPICC',
      objectives: ['Build rapport', 'Qualify prospect'],
    } as any);

    vi.mocked(getModuleByFriendlyId).mockReturnValue({
      _id: mockModuleId,
      friendlyId: 'initial-outreach',
      title: 'Initial Outreach',
      framework: 'MEDDPICC',
      objectives: ['Build rapport', 'Qualify prospect'],
    } as any);

    vi.mocked(getPersonaById).mockReturnValue({
      _id: mockPersonaId,
      friendlyId: 'busy-executive',
      name: 'Busy Executive',
      occupation: 'CEO',
      voiceId: 'voice-123',
      details: {
        salesDescription: 'A busy executive',
        mainObjection: 'No time',
        salesGoal: 'Schedule a meeting',
      },
    } as any);

    vi.mocked(getProductById).mockReturnValue({
      _id: mockProductId,
      friendlyId: 'health-insurance',
      name: 'Health Insurance',
      description: 'Comprehensive health coverage',
    } as any);

    vi.mocked(getProductByFriendlyId).mockReturnValue({
      _id: mockProductId,
      friendlyId: 'health-insurance',
      name: 'Health Insurance',
      description: 'Comprehensive health coverage',
    } as any);

    const response = await request(app.server)
      .post('/')
      .set('Authorization', 'Bearer mock-token')
      .set('Accept-Language', 'en')
      .send({
        personaId: mockPersonaId.toString(),
        moduleId: mockModuleId.toString(),
        productId: mockProductId.toString(),
      });

    // Log the response for debugging if not 200
    if (response.status !== 200) {
      console.log('Response status:', response.status);
      console.log('Response body:', response.body);
    }

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    // Verify that SalesSession.create was called with empty teams array (fallback from undefined)
    expect(SalesSession.create).toHaveBeenCalledWith(
      expect.objectContaining({
        user: mockUserId,
        teams: [],
      }),
    );
  }, 10000);
});
