import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Fastify from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { validatorCompiler } from 'fastify-type-provider-zod';
import { Types } from 'mongoose';
import request from 'supertest';
import router from './dashboard.js';
import * as moduleUtils from '../../utils/module.js';
import * as localeUtils from '../../locale/request.js';

// Mock dependencies
vi.mock('../../utils/module.js', () => ({
  getModules: vi.fn(),
  getModulesV2: vi.fn(),
  getInactiveModulesWithHistory: vi.fn(),
}));

vi.mock('../../utils/manage/shared.js', () => ({
  formatCallTypeName: vi.fn((id: string) => {
    const names: Record<string, string> = {
      'cold-call': 'Cold Call',
      discovery: 'Discovery',
      'objection-handling': 'Objection Handling',
      'custom-module': 'Custom Module',
    };
    return names[id] || id;
  }),
  determineTeamsFilter: vi.fn(),
  generateRegularProgressDataV2: vi.fn(),
  buildSessionFilterWithCompany: vi.fn(),
  buildDateRangeFilter: vi.fn(),
  isLegacyModule: vi.fn(),
}));

vi.mock('../../locale/request.js', () => ({
  getLanguageHeader: vi.fn(() => 'en'),
}));

vi.mock('../../utils/manage/index.js', () => ({
  getAccountSummary: vi.fn(),
  getPracticeDetails: vi.fn(),
  getPracticeSummary: vi.fn(),
  getProgressData: vi.fn(),
  getProgressDataV2: vi.fn(),
}));

vi.mock('../../jobs/dashboard/calculateDashboardSummary.js', () => ({
  calculateDashboardSummaryDirect: vi.fn(),
}));

vi.mock('../../models/DashboardCache.js', () => ({
  DashboardCache: {
    findOne: vi.fn(),
  },
}));

vi.mock('../../utils/prudential-standing.js', () => ({
  shouldUsePrudentialData: vi.fn(() => false),
}));

vi.mock('../../utils/adminLogger.js', () => ({
  logAdminAction: vi.fn(),
}));

vi.mock('../../models/SalesSession.js', () => ({
  SalesSession: {
    find: vi.fn(),
  },
}));

vi.mock('../../models/Company.js', () => ({
  Company: {
    findById: vi.fn(),
  },
}));

describe('Dashboard Routes - Filter Options', () => {
  let app: any;
  const mockCompanyId = new Types.ObjectId();
  let mockRequestingUser: any = null;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockRequestingUser = null;

    app = Fastify({ logger: false }).withTypeProvider<ZodTypeProvider>();
    app.setValidatorCompiler(validatorCompiler);

    // Mock checkAuth0JWT
    app.decorate('checkAuth0JWT', (_req: any, _res: any, next: any) => {
      next();
    });

    // Mock authenticateManage
    app.decorate('authenticateManage', async (req: any) => {
      if (mockRequestingUser) {
        req.user = mockRequestingUser;
      }
    });

    await app.register(import('@fastify/express'));
    await app.register(router, { prefix: '/manage/dashboard' });
    await app.listen({ port: 0 });
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /manage/dashboard/filter-options', () => {
    it('should return modules in correct format with "All modules" option', async () => {
      mockRequestingUser = {
        company: mockCompanyId,
        role: 'superadmin',
        teams: [],
      };

      const mockModules = [
        {
          _id: new Types.ObjectId(),
          friendlyId: 'cold-call',
          title: 'Cold Call',
          description: 'Practice cold calling',
          icon: 'phone',
          fields: { shown: [], hidden: [] },
        },
        {
          _id: new Types.ObjectId(),
          friendlyId: 'discovery',
          title: 'Discovery',
          description: 'Practice discovery calls',
          icon: 'search',
          fields: { shown: [], hidden: [] },
        },
      ];

      vi.mocked(moduleUtils.getModules).mockReturnValue(mockModules as any);

      const response = await request(app.server).get(
        '/manage/dashboard/filter-options',
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        modules: [
          { id: 'all', name: 'All modules' },
          { id: 'cold-call', name: 'Cold Call' },
          { id: 'discovery', name: 'Discovery' },
        ],
      });

      expect(moduleUtils.getModules).toHaveBeenCalledWith(
        mockCompanyId.toString(),
      );
    });

    it('should handle empty modules list', async () => {
      mockRequestingUser = {
        company: mockCompanyId,
        role: 'superadmin',
        teams: [],
      };

      vi.mocked(moduleUtils.getModules).mockReturnValue([]);

      const response = await request(app.server).get(
        '/manage/dashboard/filter-options',
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        modules: [{ id: 'all', name: 'All modules' }],
      });
    });

    it('should handle errors gracefully', async () => {
      mockRequestingUser = {
        company: mockCompanyId,
        role: 'superadmin',
        teams: [],
      };

      vi.mocked(moduleUtils.getModules).mockImplementation(() => {
        throw new Error('Database error');
      });

      const response = await request(app.server).get(
        '/manage/dashboard/filter-options',
      );

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: 'Failed to fetch filter options',
      });
    });
  });

  describe('GET /manage/dashboard/filter-options-v2', () => {
    it('should return modules from database in correct format', async () => {
      mockRequestingUser = {
        company: mockCompanyId,
        role: 'superadmin',
        teams: [],
      };

      const mockModulesV2 = [
        {
          _id: new Types.ObjectId(),
          friendlyId: 'cold-call',
          title: 'Cold Call Training',
          description: 'Practice cold calling',
          icon: 'phone',
          fields: { shown: [], hidden: [] },
          products: [],
        },
        {
          _id: new Types.ObjectId(),
          friendlyId: 'discovery',
          title: 'Discovery Session',
          description: 'Practice discovery calls',
          icon: 'search',
          fields: { shown: [], hidden: [] },
          products: [],
        },
      ];

      vi.mocked(moduleUtils.getModules).mockReturnValue([] as any);
      vi.mocked(moduleUtils.getModulesV2).mockResolvedValue(
        mockModulesV2 as any,
      );
      vi.mocked(moduleUtils.getInactiveModulesWithHistory).mockResolvedValue(
        [],
      );
      vi.mocked(localeUtils.getLanguageHeader).mockReturnValue('en');

      const response = await request(app.server).get(
        '/manage/dashboard/filter-options-v2',
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        modules: [
          { id: 'all', name: 'All modules' },
          { id: 'cold-call', name: 'Cold Call Training' },
          { id: 'discovery', name: 'Discovery Session' },
        ],
      });

      expect(moduleUtils.getModulesV2).toHaveBeenCalledWith(
        mockCompanyId.toString(),
        'en',
      );
    });

    it('should use language header for localization', async () => {
      mockRequestingUser = {
        company: mockCompanyId,
        role: 'superadmin',
        teams: [],
      };

      const mockModulesV2 = [
        {
          _id: new Types.ObjectId(),
          friendlyId: 'cold-call',
          title: 'Panggilan Dingin',
          description: 'Latihan panggilan dingin',
          icon: 'phone',
          fields: { shown: [], hidden: [] },
          products: [],
        },
      ];

      vi.mocked(moduleUtils.getModules).mockReturnValue([] as any);
      vi.mocked(moduleUtils.getModulesV2).mockResolvedValue(
        mockModulesV2 as any,
      );
      vi.mocked(moduleUtils.getInactiveModulesWithHistory).mockResolvedValue(
        [],
      );
      vi.mocked(localeUtils.getLanguageHeader).mockReturnValue('id');

      const response = await request(app.server).get(
        '/manage/dashboard/filter-options-v2',
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        modules: [
          { id: 'all', name: 'All modules' },
          { id: 'cold-call', name: 'Panggilan Dingin' },
        ],
      });

      expect(moduleUtils.getModulesV2).toHaveBeenCalledWith(
        mockCompanyId.toString(),
        'id',
      );
    });

    it('should fallback to formatCallTypeName when module has no title', async () => {
      mockRequestingUser = {
        company: mockCompanyId,
        role: 'superadmin',
        teams: [],
      };

      const mockModulesV2 = [
        {
          _id: new Types.ObjectId(),
          friendlyId: 'custom-module',
          title: '', // Empty title
          description: 'Custom module description',
          icon: 'custom',
          fields: { shown: [], hidden: [] },
          products: [],
        },
      ];

      vi.mocked(moduleUtils.getModules).mockReturnValue([] as any);
      vi.mocked(moduleUtils.getModulesV2).mockResolvedValue(
        mockModulesV2 as any,
      );
      vi.mocked(moduleUtils.getInactiveModulesWithHistory).mockResolvedValue(
        [],
      );

      const response = await request(app.server).get(
        '/manage/dashboard/filter-options-v2',
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        modules: [
          { id: 'all', name: 'All modules' },
          { id: 'custom-module', name: 'Custom Module' },
        ],
      });
    });

    it('should handle empty modules list', async () => {
      mockRequestingUser = {
        company: mockCompanyId,
        role: 'superadmin',
        teams: [],
      };

      vi.mocked(moduleUtils.getModules).mockReturnValue([] as any);
      vi.mocked(moduleUtils.getModulesV2).mockResolvedValue([]);
      vi.mocked(moduleUtils.getInactiveModulesWithHistory).mockResolvedValue(
        [],
      );

      const response = await request(app.server).get(
        '/manage/dashboard/filter-options-v2',
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        modules: [{ id: 'all', name: 'All modules' }],
      });
    });

    it('should handle database errors gracefully', async () => {
      mockRequestingUser = {
        company: mockCompanyId,
        role: 'superadmin',
        teams: [],
      };

      vi.mocked(moduleUtils.getModulesV2).mockRejectedValue(
        new Error('Database error'),
      );

      const response = await request(app.server).get(
        '/manage/dashboard/filter-options-v2',
      );

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: 'Failed to fetch filter options',
      });
    });

    it('should work with different user roles', async () => {
      mockRequestingUser = {
        company: mockCompanyId,
        role: 'admin',
        teams: [new Types.ObjectId()],
      };

      const mockModulesV2 = [
        {
          _id: new Types.ObjectId(),
          friendlyId: 'objection-handling',
          title: 'Objection Handling',
          description: 'Handle objections',
          icon: 'shield',
          fields: { shown: [], hidden: [] },
          products: [],
        },
      ];

      vi.mocked(moduleUtils.getModules).mockReturnValue([] as any);
      vi.mocked(moduleUtils.getModulesV2).mockResolvedValue(
        mockModulesV2 as any,
      );
      vi.mocked(moduleUtils.getInactiveModulesWithHistory).mockResolvedValue(
        [],
      );

      const response = await request(app.server).get(
        '/manage/dashboard/filter-options-v2',
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        modules: [
          { id: 'all', name: 'All modules' },
          { id: 'objection-handling', name: 'Objection Handling' },
        ],
      });
    });
  });

  describe('Response format consistency', () => {
    it('should return same format for both v1 and v2 endpoints', async () => {
      mockRequestingUser = {
        company: mockCompanyId,
        role: 'superadmin',
        teams: [],
      };

      const mockModulesV1 = [
        {
          _id: new Types.ObjectId(),
          friendlyId: 'cold-call',
          title: 'Cold Call',
          description: 'Cold calling',
          icon: 'phone',
          fields: { shown: [], hidden: [] },
        },
      ];

      const mockModulesV2 = [
        {
          _id: new Types.ObjectId(),
          friendlyId: 'cold-call',
          title: 'Cold Call',
          description: 'Cold calling',
          icon: 'phone',
          fields: { shown: [], hidden: [] },
          products: [],
        },
      ];

      vi.mocked(moduleUtils.getModules).mockReturnValue(mockModulesV1 as any);
      vi.mocked(moduleUtils.getModulesV2).mockResolvedValue(
        mockModulesV2 as any,
      );
      vi.mocked(moduleUtils.getInactiveModulesWithHistory).mockResolvedValue(
        [],
      );

      const responseV1 = await request(app.server).get(
        '/manage/dashboard/filter-options',
      );
      const responseV2 = await request(app.server).get(
        '/manage/dashboard/filter-options-v2',
      );

      // Both should have the same structure
      expect(responseV1.body).toHaveProperty('modules');
      expect(responseV2.body).toHaveProperty('modules');

      // Both should have array of modules
      expect(Array.isArray(responseV1.body.modules)).toBe(true);
      expect(Array.isArray(responseV2.body.modules)).toBe(true);

      // Both should have "All modules" as first item
      expect(responseV1.body.modules[0]).toEqual({
        id: 'all',
        name: 'All modules',
      });
      expect(responseV2.body.modules[0]).toEqual({
        id: 'all',
        name: 'All modules',
      });

      // Both should have same module structure (id, name)
      expect(responseV1.body.modules[1]).toHaveProperty('id');
      expect(responseV1.body.modules[1]).toHaveProperty('name');
      expect(responseV2.body.modules[1]).toHaveProperty('id');
      expect(responseV2.body.modules[1]).toHaveProperty('name');
    });
  });

  describe('GET /manage/dashboard/progress-v2', () => {
    it('should return progress data with charts when data exists for legacy module', async () => {
      const { getProgressData } = await import('../../utils/manage/index.js');
      const { isLegacyModule } = await import('../../utils/manage/shared.js');
      const { GRAB_TEST_COMPANY_ID } = await import('../../utils/constants.js');

      mockRequestingUser = {
        company: GRAB_TEST_COMPANY_ID,
        role: 'superadmin',
        teams: [],
      };

      const mockProgressData = {
        months: ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'],
        charts: [
          {
            name: 'Sales Technique',
            data: [0, 0, 0, 0, 0, 52],
            color: '#1C7AEB',
          },
          {
            name: 'Product Knowledge',
            data: [0, 0, 0, 0, 0, 26],
            color: '#058A62',
          },
        ],
      };

      vi.mocked(isLegacyModule).mockReturnValue(true);
      vi.mocked(getProgressData).mockResolvedValue(mockProgressData);

      const response = await request(app.server).get(
        '/manage/dashboard/progress-v2?months=6&module=test-module',
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        ...mockProgressData,
        layout: 'regular',
      });
      expect(isLegacyModule).toHaveBeenCalledWith(
        GRAB_TEST_COMPANY_ID,
        'test-module',
      );
      expect(getProgressData).toHaveBeenCalled();
    });

    it('should return empty charts when no data exists for legacy module', async () => {
      const { getProgressData } = await import('../../utils/manage/index.js');
      const { isLegacyModule } = await import('../../utils/manage/shared.js');

      mockRequestingUser = {
        company: mockCompanyId,
        role: 'superadmin',
        teams: [],
      };

      const mockProgressData = {
        months: ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'],
        charts: [],
      };

      vi.mocked(isLegacyModule).mockReturnValue(true);
      vi.mocked(getProgressData).mockResolvedValue(mockProgressData);

      const response = await request(app.server).get(
        '/manage/dashboard/progress-v2?months=6&module=nonexistent-module',
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        ...mockProgressData,
        layout: 'regular',
      });
      expect(isLegacyModule).toHaveBeenCalledWith(
        mockCompanyId.toString(),
        'nonexistent-module',
      );
    });

    it('should return zero-filled charts when module has scorecards but no sessions (self-serve)', async () => {
      const { getProgressDataV2 } = await import('../../utils/manage/index.js');
      const { isLegacyModule } = await import('../../utils/manage/shared.js');
      const { GRAB_TEST_COMPANY_ID } = await import('../../utils/constants.js');

      mockRequestingUser = {
        company: GRAB_TEST_COMPANY_ID,
        role: 'superadmin',
        teams: [],
      };

      const filledProgressData = {
        months: ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'],
        charts: [
          {
            name: 'Sales Technique',
            data: [0, 0, 0, 0, 0, 0],
            color: '#1C7AEB',
          },
          {
            name: 'Product Knowledge',
            data: [0, 0, 0, 0, 0, 0],
            color: '#058A62',
          },
        ],
      };

      vi.mocked(isLegacyModule).mockReturnValue(false);
      vi.mocked(getProgressDataV2).mockResolvedValue(filledProgressData);

      const response = await request(app.server).get(
        '/manage/dashboard/progress-v2?months=6&module=new-module',
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        ...filledProgressData,
        layout: 'regular',
      });
      expect(response.body.charts).toHaveLength(2);
      expect(response.body.charts[0].data).toEqual([0, 0, 0, 0, 0, 0]);
      expect(response.body.charts[1].data).toEqual([0, 0, 0, 0, 0, 0]);
      expect(isLegacyModule).toHaveBeenCalledWith(
        GRAB_TEST_COMPANY_ID,
        'new-module',
      );
    });

    it('should handle different month ranges', async () => {
      const { getProgressData } = await import('../../utils/manage/index.js');
      const { isLegacyModule } = await import('../../utils/manage/shared.js');

      mockRequestingUser = {
        company: mockCompanyId,
        role: 'superadmin',
        teams: [],
      };

      const mockProgressData = {
        months: ['Dec', 'Jan', 'Feb'],
        charts: [
          {
            name: 'Sales Technique',
            data: [10, 20, 30],
            color: '#1C7AEB',
          },
        ],
      };

      vi.mocked(isLegacyModule).mockReturnValue(true);
      vi.mocked(getProgressData).mockResolvedValue(mockProgressData);

      const response = await request(app.server).get(
        '/manage/dashboard/progress-v2?months=3&module=test-module',
      );

      expect(response.status).toBe(200);
      expect(response.body.months).toHaveLength(3);
      expect(isLegacyModule).toHaveBeenCalledWith(
        mockCompanyId.toString(),
        'test-module',
      );
      expect(getProgressData).toHaveBeenCalledWith(
        mockCompanyId.toString(),
        undefined,
        3,
        'test-module',
      );
    });

    it('should handle team filtering', async () => {
      const { getProgressData } = await import('../../utils/manage/index.js');
      const { determineTeamsFilter, isLegacyModule } = await import(
        '../../utils/manage/shared.js'
      );

      mockRequestingUser = {
        company: mockCompanyId,
        role: 'admin',
        teams: [new Types.ObjectId()],
      };

      vi.mocked(determineTeamsFilter).mockReturnValue(['team1', 'team2']);
      vi.mocked(isLegacyModule).mockReturnValue(true);

      const mockProgressData = {
        months: ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'],
        charts: [
          {
            name: 'Sales Technique',
            data: [15, 18, 22, 25, 30, 35],
            color: '#1C7AEB',
          },
        ],
      };

      vi.mocked(getProgressData).mockResolvedValue(mockProgressData);

      const response = await request(app.server).get(
        '/manage/dashboard/progress-v2?module=test-module&teams=team1,team2',
      );

      expect(response.status).toBe(200);
      expect(determineTeamsFilter).toHaveBeenCalled();
      expect(isLegacyModule).toHaveBeenCalledWith(
        mockCompanyId.toString(),
        'test-module',
      );
      expect(getProgressData).toHaveBeenCalledWith(
        mockCompanyId.toString(),
        ['team1', 'team2'],
        6,
        'test-module',
      );
    });

    it('should handle errors gracefully', async () => {
      const { getProgressData } = await import('../../utils/manage/index.js');
      const { isLegacyModule } = await import('../../utils/manage/shared.js');

      mockRequestingUser = {
        company: mockCompanyId,
        role: 'superadmin',
        teams: [],
      };

      vi.mocked(isLegacyModule).mockReturnValue(true);
      vi.mocked(getProgressData).mockRejectedValue(new Error('Database error'));

      const response = await request(app.server).get(
        '/manage/dashboard/progress-v2?module=test-module',
      );

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: 'Failed to fetch progress data',
      });
    });

    it('should default to 6 months when months parameter is not provided', async () => {
      const { getProgressData } = await import('../../utils/manage/index.js');
      const { determineTeamsFilter, isLegacyModule } = await import(
        '../../utils/manage/shared.js'
      );

      mockRequestingUser = {
        company: mockCompanyId,
        role: 'superadmin',
        teams: [],
      };

      // Reset the mock to return undefined for superadmin with no teams filter
      vi.mocked(determineTeamsFilter).mockReturnValue(undefined);
      vi.mocked(isLegacyModule).mockReturnValue(true);

      const mockProgressData = {
        months: ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'],
        charts: [],
      };

      vi.mocked(getProgressData).mockResolvedValue(mockProgressData);

      const response = await request(app.server).get(
        '/manage/dashboard/progress-v2?module=test-module',
      );

      expect(response.status).toBe(200);
      expect(isLegacyModule).toHaveBeenCalledWith(
        mockCompanyId.toString(),
        'test-module',
      );
      expect(getProgressData).toHaveBeenCalledWith(
        mockCompanyId.toString(),
        undefined,
        6,
        'test-module',
      );
    });

    it('should use getProgressDataV2 for self-serve modules', async () => {
      const { getProgressDataV2 } = await import('../../utils/manage/index.js');
      const { isLegacyModule, determineTeamsFilter } = await import(
        '../../utils/manage/shared.js'
      );

      mockRequestingUser = {
        company: mockCompanyId,
        role: 'superadmin',
        teams: [],
      };

      vi.mocked(determineTeamsFilter).mockReturnValue(undefined);
      vi.mocked(isLegacyModule).mockReturnValue(false);

      const mockProgressData = {
        months: ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'],
        charts: [
          {
            name: 'Custom Scorecard 1',
            data: [10, 15, 20, 25, 30, 35],
            color: '#1C7AEB',
          },
          {
            name: 'Custom Scorecard 2',
            data: [5, 10, 15, 20, 25, 30],
            color: '#058A62',
          },
        ],
      };

      vi.mocked(getProgressDataV2).mockResolvedValue(mockProgressData);

      const response = await request(app.server).get(
        '/manage/dashboard/progress-v2?module=self-serve-module&months=6',
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        ...mockProgressData,
        layout: 'regular',
      });
      expect(isLegacyModule).toHaveBeenCalledWith(
        mockCompanyId.toString(),
        'self-serve-module',
      );
      expect(getProgressDataV2).toHaveBeenCalledWith(
        mockCompanyId.toString(),
        [],
        6,
        'self-serve-module',
      );
    });
  });
});
