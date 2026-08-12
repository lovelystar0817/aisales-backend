import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  generateRegularProgressData,
  generateRegularProgressDataV2,
} from './shared.js';
import { Module } from '../../models/Module.js';
import { Scenario } from '../../models/Scenario.js';

// Mock the models
vi.mock('../../models/Module.js', () => ({
  Module: {
    findOne: vi.fn(),
  },
}));

vi.mock('../../models/Scenario.js', () => ({
  Scenario: {
    find: vi.fn(),
  },
}));

describe('generateRegularProgressData', () => {
  beforeEach(() => {
    // Mock the current date to ensure consistent month generation
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-02-15'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Bug Fix: ClickUp #86ewnd24b - Duplicate Scorecard Names', () => {
    it('should merge "Sales Technique" from legacy and new format into single chart', () => {
      // Setup: Sessions with mixed legacy and new scorecard format
      const sessions = [
        // Legacy format session (Nov 2023)
        {
          endedAt: new Date('2023-11-15'),
          roleplay: {
            feedback: {
              salesTechniques: JSON.stringify({
                overallScore: 75,
                maxScore: 100,
              }),
              productKnowledge: JSON.stringify({
                overallScore: 80,
                maxScore: 100,
              }),
              scorecards: undefined,
            },
          },
        },
        // New scorecard format session (Jan 2024)
        {
          endedAt: new Date('2024-01-15'),
          roleplay: {
            feedback: {
              scorecards: [
                {
                  name: 'Sales Technique',
                  sectionType: 'custom',
                  overallScore: 85,
                  maxScore: 100,
                },
                {
                  name: 'Product Knowledge',
                  sectionType: 'product-knowledge',
                  overallScore: 90,
                  maxScore: 100,
                },
              ],
            },
          },
        },
      ];

      const result = generateRegularProgressData(sessions, 6);

      // Assert: Only ONE "Sales Technique" chart should exist
      const salesTechniqueCharts = result.charts.filter(
        (chart) => chart.name === 'Sales Technique',
      );
      expect(salesTechniqueCharts).toHaveLength(1);

      // Assert: Only ONE "Product Knowledge" chart should exist
      const productKnowledgeCharts = result.charts.filter(
        (chart) => chart.name === 'Product Knowledge',
      );
      expect(productKnowledgeCharts).toHaveLength(1);

      // Assert: Total charts should be 2 (not 3 or 4)
      expect(result.charts).toHaveLength(2);
    });

    it('should correctly aggregate scores from both legacy and new format', () => {
      const sessions = [
        // Two legacy sessions in November
        {
          endedAt: new Date('2023-11-10'),
          roleplay: {
            feedback: {
              salesTechniques: JSON.stringify({
                overallScore: 70,
                maxScore: 100,
              }),
            },
          },
        },
        {
          endedAt: new Date('2023-11-20'),
          roleplay: {
            feedback: {
              salesTechniques: JSON.stringify({
                overallScore: 80,
                maxScore: 100,
              }),
            },
          },
        },
        // Two new format sessions in January
        {
          endedAt: new Date('2024-01-10'),
          roleplay: {
            feedback: {
              scorecards: [
                {
                  name: 'Sales Technique',
                  sectionType: 'custom',
                  overallScore: 85,
                  maxScore: 100,
                },
              ],
            },
          },
        },
        {
          endedAt: new Date('2024-01-20'),
          roleplay: {
            feedback: {
              scorecards: [
                {
                  name: 'Sales Technique',
                  sectionType: 'custom',
                  overallScore: 95,
                  maxScore: 100,
                },
              ],
            },
          },
        },
      ];

      const result = generateRegularProgressData(sessions, 6);

      const salesTechChart = result.charts.find(
        (chart) => chart.name === 'Sales Technique',
      );

      expect(salesTechChart).toBeDefined();

      // Find November and January indices
      const novIndex = result.months.indexOf('Nov');
      const janIndex = result.months.indexOf('Jan');

      // November should have average of 70 and 80 = 75
      expect(salesTechChart!.data[novIndex]).toBe(75);

      // January should have average of 85 and 95 = 90
      expect(salesTechChart!.data[janIndex]).toBe(90);
    });

    it('should keep different scorecard names as separate charts', () => {
      const sessions = [
        {
          endedAt: new Date('2024-01-15'),
          roleplay: {
            feedback: {
              scorecards: [
                {
                  name: 'Sales Technique',
                  sectionType: 'custom',
                  overallScore: 75,
                  maxScore: 100,
                },
                {
                  name: 'Product Knowledge',
                  sectionType: 'product-knowledge',
                  overallScore: 80,
                  maxScore: 100,
                },
                {
                  name: 'Communication Skills',
                  sectionType: 'communication-presence',
                  overallScore: 85,
                  maxScore: 100,
                },
              ],
            },
          },
        },
      ];

      const result = generateRegularProgressData(sessions, 6);

      // Assert: Three different charts
      expect(result.charts).toHaveLength(3);
      expect(result.charts.map((c) => c.name)).toEqual(
        expect.arrayContaining([
          'Sales Technique',
          'Product Knowledge',
          'Communication Skills',
        ]),
      );
    });

    it('should assign colors based on first encountered sectionType', () => {
      // First session with legacy format (sectionType: 'sales-technique')
      const sessions = [
        {
          endedAt: new Date('2023-11-15'),
          roleplay: {
            feedback: {
              salesTechniques: JSON.stringify({
                overallScore: 75,
                maxScore: 100,
              }),
            },
          },
        },
        {
          endedAt: new Date('2024-01-15'),
          roleplay: {
            feedback: {
              scorecards: [
                {
                  name: 'Sales Technique',
                  sectionType: 'custom',
                  overallScore: 85,
                  maxScore: 100,
                },
              ],
            },
          },
        },
      ];

      const result = generateRegularProgressData(sessions, 6);

      const salesTechChart = result.charts.find(
        (chart) => chart.name === 'Sales Technique',
      );

      expect(salesTechChart).toBeDefined();
      // Should have a valid color assigned
      expect(salesTechChart!.color).toBeTruthy();
      expect(typeof salesTechChart!.color).toBe('string');
    });

    it('should handle sessions without valid scores', () => {
      const sessions = [
        {
          endedAt: new Date('2024-01-15'),
          roleplay: {
            feedback: {
              scorecards: [
                {
                  name: 'Sales Technique',
                  sectionType: 'custom',
                  overallScore: 85,
                  maxScore: 100,
                },
              ],
            },
          },
        },
        // Session without valid feedback
        {
          endedAt: new Date('2024-01-20'),
          roleplay: {
            feedback: {},
          },
        },
        // Session without endedAt
        {
          roleplay: {
            feedback: {
              scorecards: [
                {
                  name: 'Sales Technique',
                  sectionType: 'custom',
                  overallScore: 95,
                  maxScore: 100,
                },
              ],
            },
          },
        },
      ];

      const result = generateRegularProgressData(sessions, 6);

      // Should only process valid sessions
      const salesTechChart = result.charts.find(
        (chart) => chart.name === 'Sales Technique',
      );

      expect(salesTechChart).toBeDefined();
      expect(result.charts).toHaveLength(1);
    });

    it('should return zero for months with no data', () => {
      // Only one session in January
      const sessions = [
        {
          endedAt: new Date('2024-01-15'),
          roleplay: {
            feedback: {
              scorecards: [
                {
                  name: 'Sales Technique',
                  sectionType: 'custom',
                  overallScore: 85,
                  maxScore: 100,
                },
              ],
            },
          },
        },
      ];

      const result = generateRegularProgressData(sessions, 6);

      const salesTechChart = result.charts.find(
        (chart) => chart.name === 'Sales Technique',
      );

      // Find months without data (not January)
      const janIndex = result.months.indexOf('Jan');
      const decIndex = result.months.indexOf('Dec');
      const novIndex = result.months.indexOf('Nov');

      // January should have data
      expect(salesTechChart!.data[janIndex]).toBe(85);

      // Other months should be 0
      expect(salesTechChart!.data[decIndex]).toBe(0);
      expect(salesTechChart!.data[novIndex]).toBe(0);
    });
  });

  describe('Prudential PH Appointment Setting - Legacy Format', () => {
    it('should handle prudentialPHAppointmentSetting scores', () => {
      const sessions = [
        {
          endedAt: new Date('2024-01-15'),
          roleplay: {
            feedback: {
              prudentialPHAppointmentSetting: JSON.stringify({
                overallScore: 88,
              }),
            },
          },
        },
      ];

      const result = generateRegularProgressData(sessions, 6);

      const appointmentChart = result.charts.find(
        (chart) => chart.name === 'Appointment Setting',
      );

      expect(appointmentChart).toBeDefined();
      expect(appointmentChart!.data.some((score) => score > 0)).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty sessions array', () => {
      const result = generateRegularProgressData([], 6);

      expect(result.charts).toHaveLength(0);
      expect(result.months).toHaveLength(6);
    });

    it('should generate correct number of months', () => {
      const result = generateRegularProgressData([], 12);

      expect(result.months).toHaveLength(12);
    });

    it('should round averages correctly', () => {
      const sessions = [
        {
          endedAt: new Date('2024-01-15'),
          roleplay: {
            feedback: {
              scorecards: [
                {
                  name: 'Sales Technique',
                  sectionType: 'custom',
                  overallScore: 83,
                  maxScore: 100,
                },
              ],
            },
          },
        },
        {
          endedAt: new Date('2024-01-20'),
          roleplay: {
            feedback: {
              scorecards: [
                {
                  name: 'Sales Technique',
                  sectionType: 'custom',
                  overallScore: 87,
                  maxScore: 100,
                },
              ],
            },
          },
        },
      ];

      const result = generateRegularProgressData(sessions, 6);
      const salesTechChart = result.charts.find(
        (chart) => chart.name === 'Sales Technique',
      );

      const janIndex = result.months.indexOf('Jan');

      // Average of 83 and 87 = 85, should be rounded
      expect(salesTechChart!.data[janIndex]).toBe(85);
    });
  });
});

describe('generateRegularProgressDataV2', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-02-15'));
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Basic Functionality', () => {
    it('should process sessions with scorecard data and return correct averages', async () => {
      const moduleId = '507f1f77bcf86cd799439011';
      const companyId = '507f1f77bcf86cd799439012';

      // Mock Module.findOne
      vi.mocked(Module.findOne).mockReturnValue({
        lean: vi.fn().mockResolvedValue({
          _id: moduleId,
          friendlyId: 'test-module',
          title: 'Test Module',
        }),
      } as any);

      // Mock Scenario.find
      vi.mocked(Scenario.find).mockReturnValue({
        populate: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue([
            {
              module: moduleId,
              company: companyId,
              scorecard: {
                sections: [
                  {
                    name: 'Sales Technique',
                    sectionType: 'sales-technique',
                  },
                  {
                    name: 'Product Knowledge',
                    sectionType: 'product-knowledge',
                  },
                ],
              },
            },
          ]),
        }),
      } as any);

      const sessions = [
        {
          endedAt: new Date('2024-01-10'),
          roleplay: {
            feedback: {
              scorecards: [
                {
                  name: 'Sales Technique',
                  overallScore: 80,
                },
                {
                  name: 'Product Knowledge',
                  overallScore: 90,
                },
              ],
            },
          },
        },
        {
          endedAt: new Date('2024-01-20'),
          roleplay: {
            feedback: {
              scorecards: [
                {
                  name: 'Sales Technique',
                  overallScore: 70,
                },
                {
                  name: 'Product Knowledge',
                  overallScore: 85,
                },
              ],
            },
          },
        },
      ];

      const result = await generateRegularProgressDataV2(
        companyId,
        6,
        'test-module',
        sessions,
      );

      expect(result.charts).toHaveLength(2);

      const salesTechChart = result.charts.find(
        (c) => c.name === 'Sales Technique',
      );
      const productKnowledgeChart = result.charts.find(
        (c) => c.name === 'Product Knowledge',
      );

      expect(salesTechChart).toBeDefined();
      expect(productKnowledgeChart).toBeDefined();

      const janIndex = result.months.indexOf('Jan');

      // Average of 80 and 70 = 75
      expect(salesTechChart!.data[janIndex]).toBe(75);

      // Average of 90 and 85 = 88 (rounded)
      expect(productKnowledgeChart!.data[janIndex]).toBe(88);
    });

    it('should return zero-filled charts when no sessions exist', async () => {
      const moduleId = '507f1f77bcf86cd799439011';
      const companyId = '507f1f77bcf86cd799439012';

      vi.mocked(Module.findOne).mockReturnValue({
        lean: vi.fn().mockResolvedValue({
          _id: moduleId,
          friendlyId: 'test-module',
        }),
      } as any);

      vi.mocked(Scenario.find).mockReturnValue({
        populate: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue([
            {
              module: moduleId,
              scorecard: {
                sections: [
                  {
                    name: 'Sales Technique',
                    sectionType: 'sales-technique',
                  },
                ],
              },
            },
          ]),
        }),
      } as any);

      const result = await generateRegularProgressDataV2(
        companyId,
        6,
        'test-module',
        [],
      );

      expect(result.charts).toHaveLength(1);
      expect(result.charts[0].name).toBe('Sales Technique');
      expect(result.charts[0].data).toEqual([0, 0, 0, 0, 0, 0]);
    });

    it('should only process scorecards that are defined in the module', async () => {
      const moduleId = '507f1f77bcf86cd799439011';
      const companyId = '507f1f77bcf86cd799439012';

      vi.mocked(Module.findOne).mockReturnValue({
        lean: vi.fn().mockResolvedValue({
          _id: moduleId,
          friendlyId: 'test-module',
        }),
      } as any);

      vi.mocked(Scenario.find).mockReturnValue({
        populate: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue([
            {
              module: moduleId,
              scorecard: {
                sections: [
                  {
                    name: 'Sales Technique',
                    sectionType: 'sales-technique',
                  },
                ],
              },
            },
          ]),
        }),
      } as any);

      const sessions = [
        {
          endedAt: new Date('2024-01-15'),
          roleplay: {
            feedback: {
              scorecards: [
                {
                  name: 'Sales Technique',
                  overallScore: 85,
                },
                {
                  name: 'Unknown Scorecard',
                  overallScore: 95,
                },
              ],
            },
          },
        },
      ];

      const result = await generateRegularProgressDataV2(
        companyId,
        6,
        'test-module',
        sessions,
      );

      // Should only have Sales Technique chart
      expect(result.charts).toHaveLength(1);
      expect(result.charts[0].name).toBe('Sales Technique');
    });
  });

  describe('Edge Cases', () => {
    it('should return empty charts when module is "all"', async () => {
      const result = await generateRegularProgressDataV2(
        'companyId',
        6,
        'all',
        [],
      );

      expect(result.charts).toHaveLength(0);
      expect(result.months).toHaveLength(6);
      expect(Module.findOne).not.toHaveBeenCalled();
    });

    it('should return empty charts when module is not provided', async () => {
      const result = await generateRegularProgressDataV2(
        'companyId',
        6,
        '',
        [],
      );

      expect(result.charts).toHaveLength(0);
      expect(Module.findOne).not.toHaveBeenCalled();
    });

    it('should return empty charts when module is not found', async () => {
      vi.mocked(Module.findOne).mockReturnValue({
        lean: vi.fn().mockResolvedValue(null),
      } as any);

      const result = await generateRegularProgressDataV2(
        'companyId',
        6,
        'nonexistent',
        [],
      );

      expect(result.charts).toHaveLength(0);
      expect(Module.findOne).toHaveBeenCalledWith({
        friendlyId: 'nonexistent',
      });
    });

    it('should return empty charts when no scenarios exist', async () => {
      const moduleId = '507f1f77bcf86cd799439011';

      vi.mocked(Module.findOne).mockReturnValue({
        lean: vi.fn().mockResolvedValue({
          _id: moduleId,
          friendlyId: 'test-module',
        }),
      } as any);

      vi.mocked(Scenario.find).mockReturnValue({
        populate: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue([]),
        }),
      } as any);

      const result = await generateRegularProgressDataV2(
        'companyId',
        6,
        'test-module',
        [],
      );

      expect(result.charts).toHaveLength(0);
    });

    it('should handle sessions without endedAt', async () => {
      const moduleId = '507f1f77bcf86cd799439011';

      vi.mocked(Module.findOne).mockReturnValue({
        lean: vi.fn().mockResolvedValue({
          _id: moduleId,
          friendlyId: 'test-module',
        }),
      } as any);

      vi.mocked(Scenario.find).mockReturnValue({
        populate: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue([
            {
              module: moduleId,
              scorecard: {
                sections: [
                  {
                    name: 'Sales Technique',
                    sectionType: 'sales-technique',
                  },
                ],
              },
            },
          ]),
        }),
      } as any);

      const sessions = [
        {
          roleplay: {
            feedback: {
              scorecards: [
                {
                  name: 'Sales Technique',
                  overallScore: 85,
                },
              ],
            },
          },
        },
      ];

      const result = await generateRegularProgressDataV2(
        'companyId',
        6,
        'test-module',
        sessions,
      );

      // Should return zero-filled data since session was skipped
      expect(result.charts[0].data).toEqual([0, 0, 0, 0, 0, 0]);
    });

    it('should handle sessions without scorecards array', async () => {
      const moduleId = '507f1f77bcf86cd799439011';

      vi.mocked(Module.findOne).mockReturnValue({
        lean: vi.fn().mockResolvedValue({
          _id: moduleId,
          friendlyId: 'test-module',
        }),
      } as any);

      vi.mocked(Scenario.find).mockReturnValue({
        populate: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue([
            {
              module: moduleId,
              scorecard: {
                sections: [
                  {
                    name: 'Sales Technique',
                    sectionType: 'sales-technique',
                  },
                ],
              },
            },
          ]),
        }),
      } as any);

      const sessions = [
        {
          endedAt: new Date('2024-01-15'),
          roleplay: {
            feedback: {},
          },
        },
      ];

      const result = await generateRegularProgressDataV2(
        'companyId',
        6,
        'test-module',
        sessions,
      );

      // Should return zero-filled data
      expect(result.charts[0].data).toEqual([0, 0, 0, 0, 0, 0]);
    });

    it('should handle invalid scorecard scores', async () => {
      const moduleId = '507f1f77bcf86cd799439011';

      vi.mocked(Module.findOne).mockReturnValue({
        lean: vi.fn().mockResolvedValue({
          _id: moduleId,
          friendlyId: 'test-module',
        }),
      } as any);

      vi.mocked(Scenario.find).mockReturnValue({
        populate: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue([
            {
              module: moduleId,
              scorecard: {
                sections: [
                  {
                    name: 'Sales Technique',
                    sectionType: 'sales-technique',
                  },
                ],
              },
            },
          ]),
        }),
      } as any);

      const sessions = [
        {
          endedAt: new Date('2024-01-15'),
          roleplay: {
            feedback: {
              scorecards: [
                {
                  name: 'Sales Technique',
                  overallScore: null,
                },
              ],
            },
          },
        },
        {
          endedAt: new Date('2024-01-16'),
          roleplay: {
            feedback: {
              scorecards: [
                {
                  name: 'Sales Technique',
                  overallScore: undefined,
                },
              ],
            },
          },
        },
        {
          endedAt: new Date('2024-01-17'),
          roleplay: {
            feedback: {
              scorecards: [
                {
                  name: 'Sales Technique',
                  overallScore: NaN,
                },
              ],
            },
          },
        },
        {
          endedAt: new Date('2024-01-18'),
          roleplay: {
            feedback: {
              scorecards: [
                {
                  name: 'Sales Technique',
                  overallScore: -1,
                },
              ],
            },
          },
        },
      ];

      const result = await generateRegularProgressDataV2(
        'companyId',
        6,
        'test-module',
        sessions,
      );

      // All invalid scores should be ignored, resulting in zeros
      expect(result.charts[0].data).toEqual([0, 0, 0, 0, 0, 0]);
    });

    it('should handle database errors gracefully', async () => {
      vi.mocked(Module.findOne).mockReturnValue({
        lean: vi.fn().mockRejectedValue(new Error('Database error')),
      } as any);

      const result = await generateRegularProgressDataV2(
        'companyId',
        6,
        'test-module',
        [],
      );

      expect(result.charts).toHaveLength(0);
      expect(result.months).toHaveLength(6);
    });
  });

  describe('Multi-month Processing', () => {
    it('should correctly aggregate scores across different months', async () => {
      const moduleId = '507f1f77bcf86cd799439011';

      vi.mocked(Module.findOne).mockReturnValue({
        lean: vi.fn().mockResolvedValue({
          _id: moduleId,
          friendlyId: 'test-module',
        }),
      } as any);

      vi.mocked(Scenario.find).mockReturnValue({
        populate: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue([
            {
              module: moduleId,
              scorecard: {
                sections: [
                  {
                    name: 'Sales Technique',
                    sectionType: 'sales-technique',
                  },
                ],
              },
            },
          ]),
        }),
      } as any);

      const sessions = [
        // November sessions
        {
          endedAt: new Date('2023-11-10'),
          roleplay: {
            feedback: {
              scorecards: [
                {
                  name: 'Sales Technique',
                  overallScore: 70,
                },
              ],
            },
          },
        },
        {
          endedAt: new Date('2023-11-20'),
          roleplay: {
            feedback: {
              scorecards: [
                {
                  name: 'Sales Technique',
                  overallScore: 80,
                },
              ],
            },
          },
        },
        // December sessions
        {
          endedAt: new Date('2023-12-15'),
          roleplay: {
            feedback: {
              scorecards: [
                {
                  name: 'Sales Technique',
                  overallScore: 90,
                },
              ],
            },
          },
        },
        // January sessions
        {
          endedAt: new Date('2024-01-10'),
          roleplay: {
            feedback: {
              scorecards: [
                {
                  name: 'Sales Technique',
                  overallScore: 85,
                },
              ],
            },
          },
        },
      ];

      const result = await generateRegularProgressDataV2(
        'companyId',
        6,
        'test-module',
        sessions,
      );

      const novIndex = result.months.indexOf('Nov');
      const decIndex = result.months.indexOf('Dec');
      const janIndex = result.months.indexOf('Jan');

      // November average: (70 + 80) / 2 = 75
      expect(result.charts[0].data[novIndex]).toBe(75);

      // December average: 90
      expect(result.charts[0].data[decIndex]).toBe(90);

      // January average: 85
      expect(result.charts[0].data[janIndex]).toBe(85);
    });

    it('should handle different month ranges correctly', async () => {
      const moduleId = '507f1f77bcf86cd799439011';

      vi.mocked(Module.findOne).mockReturnValue({
        lean: vi.fn().mockResolvedValue({
          _id: moduleId,
          friendlyId: 'test-module',
        }),
      } as any);

      vi.mocked(Scenario.find).mockReturnValue({
        populate: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue([
            {
              module: moduleId,
              scorecard: {
                sections: [
                  {
                    name: 'Sales Technique',
                    sectionType: 'sales-technique',
                  },
                ],
              },
            },
          ]),
        }),
      } as any);

      const result = await generateRegularProgressDataV2(
        'companyId',
        3,
        'test-module',
        [],
      );

      expect(result.months).toHaveLength(3);
      expect(result.charts[0].data).toHaveLength(3);
    });
  });

  describe('Scorecard Deduplication', () => {
    it('should deduplicate scorecards with the same name across scenarios', async () => {
      const moduleId = '507f1f77bcf86cd799439011';

      vi.mocked(Module.findOne).mockReturnValue({
        lean: vi.fn().mockResolvedValue({
          _id: moduleId,
          friendlyId: 'test-module',
        }),
      } as any);

      vi.mocked(Scenario.find).mockReturnValue({
        populate: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue([
            {
              module: moduleId,
              scorecard: {
                sections: [
                  {
                    name: 'Sales Technique',
                    sectionType: 'sales-technique',
                  },
                ],
              },
            },
            {
              module: moduleId,
              scorecard: {
                sections: [
                  {
                    name: 'Sales Technique',
                    sectionType: 'sales-technique',
                  },
                  {
                    name: 'Product Knowledge',
                    sectionType: 'product-knowledge',
                  },
                ],
              },
            },
          ]),
        }),
      } as any);

      const result = await generateRegularProgressDataV2(
        'companyId',
        6,
        'test-module',
        [],
      );

      // Should only have 2 unique charts
      expect(result.charts).toHaveLength(2);
      const chartNames = result.charts.map((c) => c.name);
      expect(chartNames).toContain('Sales Technique');
      expect(chartNames).toContain('Product Knowledge');
    });
  });

  describe('Color Assignment', () => {
    it('should assign correct colors based on sectionType', async () => {
      const moduleId = '507f1f77bcf86cd799439011';

      vi.mocked(Module.findOne).mockReturnValue({
        lean: vi.fn().mockResolvedValue({
          _id: moduleId,
          friendlyId: 'test-module',
        }),
      } as any);

      vi.mocked(Scenario.find).mockReturnValue({
        populate: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue([
            {
              module: moduleId,
              scorecard: {
                sections: [
                  {
                    name: 'Sales Technique',
                    sectionType: 'sales-technique',
                  },
                  {
                    name: 'Product Knowledge',
                    sectionType: 'product-knowledge',
                  },
                ],
              },
            },
          ]),
        }),
      } as any);

      const result = await generateRegularProgressDataV2(
        'companyId',
        6,
        'test-module',
        [],
      );

      const salesTechChart = result.charts.find(
        (c) => c.name === 'Sales Technique',
      );
      const productKnowledgeChart = result.charts.find(
        (c) => c.name === 'Product Knowledge',
      );

      expect(salesTechChart!.color).toBe('#1C7AEB');
      expect(productKnowledgeChart!.color).toBe('#058A62');
    });
  });
});
