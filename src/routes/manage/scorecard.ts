import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import { Scorecard } from '../../models/Scorecard.js';
import { SalesSession } from '../../models/SalesSession.js';
import { Scenario } from '../../models/Scenario.js';
import { generateCustomSectionPrompts } from '../../utils/scorecard.js';
import { logAdminAction } from '../../utils/adminLogger.js';

// ============================================================================
// Types & Interfaces
// ============================================================================

interface Criteria {
  title: string;
  description: string;
  enabled?: boolean;
}

interface Section {
  name: string;
  sectionType?: 'custom' | 'product-knowledge' | 'communication-presence';
  criteria: Criteria[];
}

interface ScorecardCreateBody {
  name: string;
  sections: Section[];
}

interface ScorecardListQuery {
  page: number;
  limit: number;
  search?: string;
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;
const DEFAULT_SECTION_TYPE = 'custom';
const DEFAULT_ASSESSMENT_TYPE = 'score';

// ============================================================================
// Validation Schemas
// ============================================================================

const criteriaSchema = z.object({
  title: z.string(),
  description: z.string(),
  enabled: z.boolean().optional(),
});

const sectionSchema = z.object({
  name: z.string(),
  sectionType: z
    .enum(['custom', 'product-knowledge', 'communication-presence'])
    .optional(),
  criteria: z.array(criteriaSchema),
});

const createScorecardSchema = z.object({
  name: z.string().min(1, 'Scorecard name is required'),
  sections: z
    .array(sectionSchema)
    .min(1, 'At least one section is required')
    .refine(
      (sections) =>
        sections.some(
          (section) =>
            section.name.trim() && section.criteria.some((c) => c.title.trim()),
        ),
      {
        message: 'At least one section must have a name and valid criteria',
      },
    ),
});

const scorecardIdParamsSchema = z.object({
  id: z.string(),
});

const scorecardListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(DEFAULT_PAGE),
  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(MAX_LIMIT)
    .default(DEFAULT_LIMIT),
  search: z.string().optional(),
});

// ============================================================================
// Route Handlers
// ============================================================================

const router: FastifyPluginAsyncZod = async (app, _opts) => {
  // Apply authentication middleware
  app.use(app.checkAuth0JWT);
  app.addHook('preHandler', app.authenticateManage);

  // ==========================================================================
  // POST /manage/scorecard/create - Create a new scorecard
  // ==========================================================================
  app.post('/create', {
    schema: {
      body: createScorecardSchema,
    },
    handler: async (req, reply) => {
      try {
        const { name, sections } = req.body as ScorecardCreateBody;
        const userId = req.user!._id;
        const companyId = req.user!.company;

        // Check if a scorecard with this name already exists in the company
        const existingScorecard = await Scorecard.findOne({
          name: name.trim(),
          company: companyId,
        });

        if (existingScorecard) {
          return reply.status(409).send({
            success: false,
            error:
              'A scorecard with this name already exists. Please choose a different name.',
            errorCode: 'NAME_ALREADY_EXISTS',
          });
        }

        // Filter and validate sections
        const validSections = sections
          .filter(
            (section) =>
              section.name.trim() &&
              section.criteria.some((c) => c.title.trim()),
          )
          .map((section) => ({
            name: section.name.trim(),
            sectionType: section.sectionType || DEFAULT_SECTION_TYPE,
            criteria: section.criteria
              .filter((c) => c.title.trim())
              .map((c) => ({
                title: c.title.trim(),
                description: c.description.trim(),
                enabled: c.enabled !== undefined ? c.enabled : true,
              })),
          }));

        if (validSections.length === 0) {
          return reply.status(400).send({
            success: false,
            error: 'At least one section with valid criteria is required',
          });
        }

        console.log('Creating new scorecard...', {
          name: name.trim(),
          sectionsCount: validSections.length,
          totalCriteria: validSections.reduce(
            (sum, s) => sum + s.criteria.length,
            0,
          ),
        });

        // Generate unique friendlyId
        const slug = name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');

        // Create the scorecard
        const scorecard = await Scorecard.create({
          name: name.trim(),
          friendlyId: `${slug}-${nanoid(6)}`,
          company: companyId,
          sections: validSections,
          assessmentType: DEFAULT_ASSESSMENT_TYPE,
          isCustom: true,
          createdBy: userId,
          updatedBy: userId,
        });

        generateCustomSectionPrompts(scorecard);

        // Log admin action
        await logAdminAction(req, {
          action: 'scorecard_created',
          category: 'scorecard',
          targetType: 'Scorecard',
          targetId: scorecard._id,
          targetName: scorecard.name,
          details: {
            sectionsCount: validSections.length,
            totalCriteria: validSections.reduce(
              (sum, s) => sum + s.criteria.length,
              0,
            ),
          },
        });

        return reply.status(201).send({
          success: true,
          message: 'Scorecard created successfully',
          scorecard: {
            id: scorecard._id.toString(),
            friendlyId: scorecard.friendlyId,
            name: scorecard.name,
            sections: validSections,
            company: scorecard.company,
          },
        });
      } catch (error: any) {
        console.error('Error creating scorecard:', error);

        if (error.name === 'ValidationError') {
          return reply.status(400).send({
            success: false,
            error: 'Validation error',
            details: error.message,
          });
        }

        if (error.code === 11000) {
          return reply.status(409).send({
            success: false,
            error: 'A scorecard with this ID already exists',
            details: 'Please try again',
          });
        }

        return reply.status(500).send({
          success: false,
          error: 'Failed to create scorecard',
          details:
            process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
      }
    },
  });

  // ==========================================================================
  // GET /manage/scorecard - List all scorecards for company
  // ==========================================================================
  app.get('/', {
    schema: {
      querystring: scorecardListQuerySchema,
    },
    handler: async (req, reply) => {
      try {
        const companyId = req.user!.company;
        const { page, limit, search } = req.query as ScorecardListQuery;

        // Calculate pagination values
        const skip = (page - 1) * limit;

        // Build search filter
        const searchFilter: any = { company: companyId };

        if (search) {
          searchFilter.$or = [
            { name: { $regex: search, $options: 'i' } },
            { 'sections.name': { $regex: search, $options: 'i' } },
          ];
        }

        // Get total count
        const totalScorecards = await Scorecard.countDocuments(searchFilter);

        // Calculate pagination metadata
        const totalPages = Math.ceil(totalScorecards / limit);
        const hasNextPage = page < totalPages;
        const hasPreviousPage = page > 1;

        // Fetch paginated scorecards
        const scorecards = await Scorecard.find(searchFilter)
          .select('_id friendlyId name sections createdAt updatedAt')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean();

        // Get scorecard IDs for aggregations
        const scorecardIds = scorecards.map((s: any) => s._id);

        // Check which scorecards have completed roleplays
        const scorecardsWithCompletedRoleplays = await SalesSession.aggregate([
          {
            $match: {
              scenario: { $exists: true, $ne: null },
              endedAt: { $exists: true }, // Only completed sessions
            },
          },
          {
            $lookup: {
              from: 'scenarios',
              localField: 'scenario',
              foreignField: '_id',
              as: 'scenarioData',
            },
          },
          {
            $unwind: '$scenarioData',
          },
          {
            $match: {
              'scenarioData.scorecard': { $in: scorecardIds },
            },
          },
          {
            $group: {
              _id: '$scenarioData.scorecard',
            },
          },
        ]);

        // Count Scenarios for each scorecard
        const scenarioCounts = await Scenario.aggregate([
          {
            $match: {
              scorecard: { $in: scorecardIds },
            },
          },
          {
            $group: {
              _id: '$scorecard',
              count: { $sum: 1 },
            },
          },
        ]);

        // Create sets/maps for quick lookup
        const scorecardsWithCompletedRoleplaysSet = new Set(
          scorecardsWithCompletedRoleplays.map((item: any) =>
            item._id.toString(),
          ),
        );

        const scenarioCountMap = new Map(
          scenarioCounts.map((sc: any) => [sc._id.toString(), sc.count]),
        );

        return reply.send({
          success: true,
          scorecards: scorecards.map((scorecard: any) => ({
            id: scorecard._id.toString(),
            friendlyId: scorecard.friendlyId,
            name: scorecard.name,
            sections: scorecard.sections,
            sectionsCount: scorecard.sections?.length || 0,
            scenarioCount: scenarioCountMap.get(scorecard._id.toString()) || 0,
            hasCompletedRoleplay: scorecardsWithCompletedRoleplaysSet.has(
              scorecard._id.toString(),
            ),
            hasLinkedScenario:
              scenarioCountMap.get(scorecard._id.toString()) > 0,
            createdAt: scorecard.createdAt,
            updatedAt: scorecard.updatedAt,
          })),
          pagination: {
            currentPage: page,
            totalPages,
            totalScorecards,
            hasNextPage,
            hasPreviousPage,
            itemsPerPage: limit,
          },
        });
      } catch (error: any) {
        console.error('Error fetching scorecards:', error);
        return reply.status(500).send({
          success: false,
          error: 'Failed to fetch scorecards',
        });
      }
    },
  });
  // ==========================================================================
  // GET /manage/scorecard/:id - Get a single scorecard by ID
  // ==========================================================================
  app.get('/:id', {
    schema: {
      params: scorecardIdParamsSchema,
    },
    handler: async (req, reply) => {
      try {
        const { id } = req.params as { id: string };
        const companyId = req.user!.company;

        const scorecard = await Scorecard.findOne({
          _id: id,
          company: companyId,
        })
          .populate('updatedBy', 'email')
          .lean();

        if (!scorecard) {
          return reply.status(404).send({
            success: false,
            error: 'Scorecard not found',
          });
        }

        // Get scenarios that use this scorecard
        const scenarios = await Scenario.find({
          scorecard: scorecard._id,
        })
          .select('_id')
          .lean();

        const scenarioIds = scenarios.map((s) => s._id);

        // Check if there's at least one completed roleplay
        const hasCompletedRoleplay =
          scenarioIds.length > 0
            ? await SalesSession.exists({
                scenario: { $in: scenarioIds },
                endedAt: { $exists: true }, // Only completed sessions
              })
            : false;

        return reply.send({
          success: true,
          scorecard: {
            id: scorecard._id.toString(),
            friendlyId: scorecard.friendlyId,
            name: scorecard.name,
            sections: scorecard.sections,
            hasCompletedRoleplay: !!hasCompletedRoleplay,
            hasLinkedScenario: scenarios?.length > 0,
            createdAt: scorecard.createdAt,
            updatedAt: scorecard.updatedAt,
            updatedBy: scorecard.updatedBy,
          },
        });
      } catch (error: any) {
        console.error('Error fetching scorecard:', error);

        if (error.name === 'CastError') {
          return reply.status(400).send({
            success: false,
            error: 'Invalid scorecard ID format',
          });
        }

        return reply.status(500).send({
          success: false,
          error: 'Failed to fetch scorecard',
        });
      }
    },
  });

  // ==========================================================================
  // GET /manage/scorecard/:id/usage - Get scenarios that use this scorecard
  // ==========================================================================
  app.get('/:id/usage', {
    schema: {
      params: scorecardIdParamsSchema,
    },
    handler: async (req, reply) => {
      try {
        const { id } = req.params as { id: string };
        const { page = '1', limit = '10' } = req.query as {
          page?: string;
          limit?: string;
        };
        const companyId = req.user!.company;

        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const skip = (pageNum - 1) * limitNum;

        // Verify scorecard exists and belongs to this company
        const scorecard = await Scorecard.findOne({
          _id: id,
          company: companyId,
        });

        if (!scorecard) {
          return reply.status(404).send({
            success: false,
            error: 'Scorecard not found',
          });
        }

        // Get total count
        const totalCount = await Scenario.countDocuments({
          scorecard: scorecard._id,
        });

        // Get paginated scenarios that use this scorecard
        const scenarios = await Scenario.find({
          scorecard: scorecard._id,
        })
          .populate('module', 'title')
          .populate('persona', 'name')
          .populate('product', 'name')
          .select('_id module persona product')
          .skip(skip)
          .limit(limitNum)
          .lean();

        // Format scenarios
        const formattedScenarios = scenarios.map((scenario: any) => {
          const moduleTitle = scenario.module?.title || 'Unknown Module';
          const personaName = scenario.persona?.name || 'Unknown Persona';
          const title = `${moduleTitle} with ${personaName}`;

          return {
            id: scenario._id.toString(),
            title,
            productName: scenario.product?.name || null,
          };
        });

        const totalPages = Math.ceil(totalCount / limitNum);

        return reply.send({
          success: true,
          scenarios: formattedScenarios,
          pagination: {
            currentPage: pageNum,
            totalPages,
            totalItems: totalCount,
            itemsPerPage: limitNum,
            hasNextPage: pageNum < totalPages,
            hasPreviousPage: pageNum > 1,
          },
        });
      } catch (error: any) {
        console.error('Error fetching scorecard usage:', error);

        if (error.name === 'CastError') {
          return reply.status(400).send({
            success: false,
            error: 'Invalid scorecard ID format',
          });
        }

        return reply.status(500).send({
          success: false,
          error: 'Failed to fetch scorecard usage',
        });
      }
    },
  });

  // ==========================================================================
  // PUT /manage/scorecard/:id - Update a scorecard
  // ==========================================================================
  app.put('/:id', {
    schema: {
      params: scorecardIdParamsSchema,
      body: createScorecardSchema,
    },
    handler: async (req, reply) => {
      try {
        const { id } = req.params as { id: string };
        const { name, sections } = req.body as ScorecardCreateBody;
        const companyId = req.user!.company;

        // Check if scorecard exists and belongs to user's company
        const existingScorecard = await Scorecard.findOne({
          _id: id,
          company: companyId,
        });

        if (!existingScorecard) {
          return reply.status(404).send({
            success: false,
            error:
              'Scorecard not found or you do not have permission to edit it',
          });
        }

        // Filter and validate sections
        const validSections = sections
          .filter(
            (section) =>
              section.name.trim() &&
              section.criteria.some((c) => c.title.trim()),
          )
          .map((section) => ({
            name: section.name.trim(),
            sectionType: section.sectionType || DEFAULT_SECTION_TYPE,
            criteria: section.criteria
              .filter(
                (c) =>
                  c.title.trim() &&
                  (section.sectionType !== 'product-knowledge' || c.enabled),
              )
              .map((c) => ({
                title: c.title.trim(),
                description: c.description.trim(),
                enabled: c.enabled !== undefined ? c.enabled : true,
              })),
          }));

        if (validSections.length === 0) {
          return reply.status(400).send({
            success: false,
            error: 'At least one section with valid criteria is required',
          });
        }

        // Update the scorecard
        existingScorecard.name = name.trim();
        existingScorecard.sections = validSections;
        existingScorecard.updatedBy = req.user!._id;
        await existingScorecard.save();

        generateCustomSectionPrompts(existingScorecard);

        // Log admin action
        await logAdminAction(req, {
          action: 'scorecard_updated',
          category: 'scorecard',
          targetType: 'Scorecard',
          targetId: existingScorecard._id,
          targetName: existingScorecard.name,
          details: {
            sectionsCount: validSections.length,
            totalCriteria: validSections.reduce(
              (sum, s) => sum + s.criteria.length,
              0,
            ),
          },
        });

        return reply.send({
          success: true,
          message: 'Scorecard updated successfully',
          scorecard: {
            id: existingScorecard._id.toString(),
            friendlyId: existingScorecard.friendlyId,
            name: existingScorecard.name,
            sections: validSections,
            company: existingScorecard.company,
            updatedAt: existingScorecard.updatedAt,
          },
        });
      } catch (error: any) {
        console.error('Error updating scorecard:', error);

        if (error.name === 'ValidationError') {
          return reply.status(400).send({
            success: false,
            error: 'Validation error',
            details: error.message,
          });
        }

        if (error.name === 'CastError') {
          return reply.status(400).send({
            success: false,
            error: 'Invalid scorecard ID format',
          });
        }

        return reply.status(500).send({
          success: false,
          error: 'Failed to update scorecard',
          details:
            process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
      }
    },
  });

  // ==========================================================================
  // DELETE /manage/scorecard/:id - Delete a scorecard
  // ==========================================================================
  app.delete('/:id', {
    schema: {
      params: scorecardIdParamsSchema,
    },
    handler: async (req, reply) => {
      try {
        const { id } = req.params as { id: string };
        const companyId = req.user!.company;

        // Check if scorecard exists and belongs to user's company
        const scorecard = await Scorecard.findOne({
          _id: id,
          company: companyId,
        });

        if (!scorecard) {
          return reply.status(404).send({
            success: false,
            error:
              'Scorecard not found or you do not have permission to delete it',
          });
        }

        await Scorecard.deleteOne({ _id: id });

        // Log admin action
        await logAdminAction(req, {
          action: 'scorecard_deleted',
          category: 'scorecard',
          targetType: 'Scorecard',
          targetId: scorecard._id,
          targetName: scorecard.name,
        });

        return reply.send({
          success: true,
          message: 'Scorecard deleted successfully',
        });
      } catch (error: any) {
        console.error('Error deleting scorecard:', error);

        if (error.name === 'CastError') {
          return reply.status(400).send({
            success: false,
            error: 'Invalid scorecard ID format',
          });
        }

        return reply.status(500).send({
          success: false,
          error: 'Failed to delete scorecard',
          details:
            process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
      }
    },
  });
};

export default router;
