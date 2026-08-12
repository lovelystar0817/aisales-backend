import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import { Module } from '../../models/Module.js';
import { Persona } from '../../models/Persona.js';
import { Scorecard } from '../../models/Scorecard.js';
import { SalesProduct } from '../../models/SalesProduct.js';
import { Scenario } from '../../models/Scenario.js';
import { SalesSession } from '../../models/SalesSession.js';
import { MODULE_GROUPS } from '../../constants/modules.js';
import {
  generateInitialScenario,
  generateModuleVisuals,
  generateScenarioPrompt,
  refineScenario,
  translateModuleContent,
  translateScenarioContent,
} from '../../utils/scenario.js';
import { parseFeedbackScores } from '../../utils/manage/shared.js';
import { parseBulletPoints } from '../../utils/persona.js';
import { logAdminAction } from '../../utils/adminLogger.js';

// ============================================================================
// Types & Interfaces
// ============================================================================

interface ScenarioUpdateBody {
  moduleId?: string;
  personaId?: string;
  scorecardId?: string;
  productId?: string;
  scenarioPreview?: {
    title: string;
    description: string;
    primaryObjection: string;
  };
  difficultyLevel?: 'easy' | 'medium' | 'hard';
  isActive?: boolean;
}

interface ScenarioListQuery {
  page: number;
  limit: number;
  search?: string;
  productId?: string;
  status: 'active' | 'inactive' | 'all';
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const DEFAULT_MODULE_ICON = '📋';
const DEFAULT_MODULE_COLOR = '#FF6B35';

// ============================================================================
// Validation Schemas
// ============================================================================

const createModuleSchema = z.object({
  title: z.string().min(1, 'Module name is required'),
  description: z.string().min(1, 'Module description is required'),
  scenarioSetup: z.string().min(1, 'Scenario setup is required'),
  objectives: z.string().min(1, 'Practice objectives are required'),
});

const previewScenarioSchema = z.object({
  moduleId: z.string(),
  personaId: z.string().optional(),
  scorecardId: z.string().optional(),
  productId: z.string().optional(),
});

const refineScenarioSchema = z.object({
  initialPreview: z.object({
    title: z.string(),
    description: z.string(),
    primaryObjection: z.string(),
    scenarioContext: z.string().optional(),
  }),
  refinementPrompt: z.string(),
});

const previewScenarioResponseSchema = z.object({
  success: z.boolean(),
  preview: z.object({
    title: z.string(),
    description: z.string(),
    primaryObjection: z.string(),
    scenarioContext: z.string().optional(),
  }),
});

const createScenarioSchema = z.object({
  moduleId: z.string(),
  personaId: z.string(),
  scorecardId: z.string(),
  productId: z.string().optional(),
  scenarioPreview: z.object({
    title: z.string(),
    description: z.string(),
    primaryObjection: z.string(),
  }),
  difficultyLevel: z.enum(['easy', 'medium', 'hard']).optional(),
  isActive: z.boolean().optional(),
});

const createScenarioResponseSchema = z.object({
  success: z.boolean(),
  scenario: z
    .object({
      id: z.string(),
      module: z.string(),
      persona: z.string(),
      scorecard: z.string(),
      product: z.string().optional(),
      scenarioDetails: z.object({
        mainObjection: z.string().optional(),
        salesDescription: z.string().optional(),
        salesGoal: z.string().optional(),
      }),
    })
    .optional(),
  error: z.string().optional(),
});

const updateScenarioSchema = z.object({
  moduleId: z.string().optional(),
  personaId: z.string().optional(),
  scorecardId: z.string().optional(),
  productId: z.string().optional(),
  scenarioPreview: z
    .object({
      title: z.string(),
      description: z.string(),
      primaryObjection: z.string(),
    })
    .optional(),
  difficultyLevel: z.enum(['easy', 'medium', 'hard']).optional(),
  isActive: z.boolean().optional(),
});

const scenarioListQuerySchema = z.object({
  page: z.coerce.number().optional().default(DEFAULT_PAGE),
  limit: z.coerce.number().optional().default(DEFAULT_LIMIT),
  search: z.string().optional(),
  productId: z.string().optional().default('all'),
  status: z.string().optional().default('all'),
});

const scenarioDetailQuerySchema = z.object({
  page: z.coerce.number().optional().default(DEFAULT_PAGE),
  limit: z.coerce.number().optional().default(DEFAULT_LIMIT),
});

// ============================================================================
// Route Handlers
// ============================================================================

const router: FastifyPluginAsyncZod = async (app, _opts) => {
  // Apply authentication middleware
  app.use(app.checkAuth0JWT);
  app.addHook('preHandler', app.authenticateManage);

  // ==========================================================================
  // MODULE ENDPOINTS
  // ==========================================================================

  // POST /manage/scenario/create-module - Create a new module
  app.post('/create-module', {
    schema: {
      body: createModuleSchema,
    },
    handler: async (req, reply) => {
      try {
        const { title, description, scenarioSetup, objectives } = req.body;
        const companyId = req.user?.company;

        // Check if a module with this title already exists in the company
        const existingModule = await Module.findOne({
          title: title.trim(),
          company: companyId,
        });

        if (existingModule) {
          return reply.status(409).send({
            success: false,
            error:
              'A scenario with this name already exists. Please choose a different name.',
            errorCode: 'NAME_ALREADY_EXISTS',
          });
        }

        // Generate slug from title
        const slug = title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');

        const { icon, backgroundColor } = await generateModuleVisuals(
          title,
          description,
          objectives,
        );

        const objectivesArr = parseBulletPoints(objectives);

        const module = await Module.create({
          title,
          description,
          scenarioSetup,
          friendlyId: `${slug}-${nanoid(6)}`,
          objectives: objectivesArr,
          icon: icon ?? DEFAULT_MODULE_ICON,
          iconBgColor: backgroundColor ?? DEFAULT_MODULE_COLOR,
          company: companyId,
          group: MODULE_GROUPS.CUSTOM,
        });

        // Trigger async translation (fire-and-forget)
        translateModuleContent({
          moduleId: module._id.toString(),
          moduleContent: {
            title: module.title,
            description: module.description,
            scenarioSetup: module.scenarioSetup ?? undefined,
            objectives: objectivesArr,
          },
        });

        // Log admin action
        await logAdminAction(req, {
          action: 'module_created',
          category: 'module',
          targetType: 'Module',
          targetId: module._id,
          targetName: module.title,
        });

        return reply.status(200).send({
          success: true,
          module: {
            _id: module._id.toString(),
            title: module.title,
            description: module.description,
            friendlyId: module.friendlyId,
            scenarioSetup: module.scenarioSetup || '',
            icon: module.icon,
            iconBgColor: module.iconBgColor || '',
          },
        });
      } catch (error: any) {
        req.log.error(error, 'Failed to create module');
        return reply.status(500).send({
          success: false,
          error: 'Failed to create module',
          details:
            process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
      }
    },
  });

  // GET /manage/scenario/modules - Get all modules for company
  app.get('/modules', {
    handler: async (req, reply) => {
      try {
        const companyId = req.user?.company;

        const modules = await Module.find({ company: companyId })
          .sort({ createdAt: -1 })
          .lean();

        // Attach roleplay count to each module
        const modulesWithCounts = await Promise.all(
          modules.map(async (module) => {
            const roleplayCount = await Scenario.countDocuments({
              module: module._id,
            });

            return {
              ...module,
              roleplays: roleplayCount,
            };
          }),
        );

        return reply.status(200).send({
          success: true,
          modules: modulesWithCounts,
        });
      } catch (error: any) {
        req.log.error(error, 'Failed to fetch modules');
        return reply.status(500).send({
          success: false,
          error: 'Failed to fetch modules',
          details:
            process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
      }
    },
  });

  // PUT /manage/scenario/modules/:id - Update a module
  app.put('/modules/:id', {
    schema: {
      params: z.object({
        id: z.string(),
      }),
      body: createModuleSchema,
      response: {
        200: z.object({
          success: z.boolean(),
          message: z.string(),
          module: z.object({
            _id: z.string(),
            title: z.string(),
            description: z.string(),
            friendlyId: z.string(),
            scenarioSetup: z.string(),
            icon: z.string(),
            iconBgColor: z.string(),
          }),
        }),
        404: z.object({
          success: z.boolean(),
          error: z.string(),
        }),
        500: z.object({
          success: z.boolean(),
          error: z.string(),
          details: z.string().optional(),
        }),
      },
    },
    handler: async (req, reply) => {
      try {
        const { id } = req.params;
        const { title, description, scenarioSetup, objectives } = req.body;
        const companyId = req.user?.company;

        // Find the module and verify it belongs to the company
        const module = await Module.findOne({
          _id: id,
          company: companyId,
        });

        if (!module) {
          return reply.status(404).send({
            success: false,
            error: 'Module not found',
          });
        }

        const { icon, backgroundColor } = await generateModuleVisuals(
          title,
          description,
          objectives,
        );

        // Update the module fields
        module.title = title;
        module.description = description;
        module.scenarioSetup = scenarioSetup;
        module.objectives = [objectives];
        module.icon = icon ?? DEFAULT_MODULE_ICON;
        module.iconBgColor = backgroundColor ?? DEFAULT_MODULE_COLOR;

        // Update slug if title changed
        const slug = title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');

        // Keep the same friendlyId suffix
        const currentSuffix = module.friendlyId.split('-').slice(-1)[0];
        module.friendlyId = `${slug}-${currentSuffix}`;

        await module.save();

        // Trigger async translation for updated content (fire-and-forget)
        translateModuleContent({
          moduleId: module._id.toString(),
          moduleContent: {
            title: module.title,
            description: module.description,
            scenarioSetup: module.scenarioSetup ?? undefined,
            objectives: module.objectives,
          },
        });

        // Log admin action
        await logAdminAction(req, {
          action: 'module_updated',
          category: 'module',
          targetType: 'Module',
          targetId: module._id,
          targetName: module.title,
        });

        return reply.status(200).send({
          success: true,
          message: 'Module updated successfully',
          module: {
            _id: module._id.toString(),
            title: module.title,
            description: module.description,
            friendlyId: module.friendlyId,
            scenarioSetup: module.scenarioSetup || '',
            icon: module.icon,
            iconBgColor: module.iconBgColor || '',
          },
        });
      } catch (error: any) {
        req.log.error(error, 'Failed to update module');
        return reply.status(500).send({
          success: false,
          error: 'Failed to update module',
          details:
            process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
      }
    },
  });

  // DELETE /manage/scenario/modules/:id - Delete a module
  app.delete('/modules/:id', {
    schema: {
      params: z.object({
        id: z.string(),
      }),
      response: {
        200: z.object({
          success: z.boolean(),
          message: z.string(),
        }),
        404: z.object({
          success: z.boolean(),
          error: z.string(),
        }),
        500: z.object({
          success: z.boolean(),
          error: z.string(),
          details: z.string().optional(),
        }),
      },
    },
    handler: async (req, reply) => {
      try {
        const { id } = req.params;
        const companyId = req.user?.company;

        // Find the module first to get its name for logging
        const module = await Module.findOne({
          _id: id,
          company: companyId,
        });

        if (!module) {
          return reply.status(404).send({
            success: false,
            error: 'Module not found',
          });
        }

        await Module.deleteOne({ _id: id, company: companyId });

        // Log admin action
        await logAdminAction(req, {
          action: 'module_deleted',
          category: 'module',
          targetType: 'Module',
          targetId: module._id,
          targetName: module.title,
        });

        return reply.status(200).send({
          success: true,
          message: 'Module deleted successfully',
        });
      } catch (error: any) {
        req.log.error(error, 'Failed to delete module');
        return reply.status(500).send({
          success: false,
          error: 'Failed to delete module',
          details:
            process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
      }
    },
  });

  // ==========================================================================
  // SCENARIO PREVIEW & GENERATION ENDPOINTS
  // ==========================================================================

  // POST /manage/scenario/preview-scenario - Generate AI preview of scenario
  app.post('/preview-scenario', {
    schema: {
      body: previewScenarioSchema,
      response: {
        200: previewScenarioResponseSchema,
        400: z.object({
          success: z.boolean(),
          error: z.string(),
          details: z.string().optional(),
        }),
        500: z.object({
          success: z.boolean(),
          error: z.string(),
          details: z.string().optional(),
        }),
      },
    },
    handler: async (req, reply) => {
      try {
        const { moduleId, personaId, scorecardId, productId } = req.body;

        // Fetch all data in parallel
        const [module, persona, scorecard, product] = await Promise.all([
          Module.findById(moduleId).lean(),
          personaId
            ? Persona.findById(personaId).lean()
            : Promise.resolve(null),
          scorecardId
            ? Scorecard.findById(scorecardId).lean()
            : Promise.resolve(null),
          productId
            ? SalesProduct.findById(productId).lean()
            : Promise.resolve(null),
        ]);

        if (!module) {
          return reply.status(400).send({
            success: false,
            error: 'Module not found',
          });
        }

        const preview = await generateInitialScenario({
          module,
          persona,
          scorecard,
          product,
        });

        return reply.status(200).send({
          success: true,
          preview,
        });
      } catch (error: any) {
        req.log.error(error, 'Failed to generate scenario preview');
        return reply.status(500).send({
          success: false,
          error: 'Failed to generate scenario preview',
          details:
            process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
      }
    },
  });

  // POST /manage/scenario/refine-scenario - Refine an existing scenario preview
  app.post('/refine-scenario', {
    schema: {
      body: refineScenarioSchema,
      response: {
        200: previewScenarioResponseSchema,
        500: z.object({
          success: z.boolean(),
          error: z.string(),
          details: z.string().optional(),
        }),
      },
    },
    handler: async (req, reply) => {
      try {
        const { initialPreview, refinementPrompt } = req.body;

        const refinedPreview = await refineScenario(
          initialPreview,
          refinementPrompt,
        );

        return reply.status(200).send({
          success: true,
          preview: refinedPreview,
        });
      } catch (error: any) {
        req.log.error(error, 'Failed to refine scenario');
        return reply.status(500).send({
          success: false,
          error: 'Failed to refine scenario',
          details:
            process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
      }
    },
  });

  // ==========================================================================
  // SCENARIO CRUD ENDPOINTS
  // ==========================================================================

  // POST /manage/scenario/create-scenario - Create a new scenario
  app.post('/create-scenario', {
    schema: {
      body: createScenarioSchema,
      response: {
        200: createScenarioResponseSchema,
        400: z.object({
          success: z.boolean(),
          error: z.string(),
          details: z.string().optional(),
        }),
        500: z.object({
          success: z.boolean(),
          error: z.string(),
          details: z.string().optional(),
        }),
      },
    },
    handler: async (req, reply) => {
      try {
        let {
          moduleId,
          personaId,
          scorecardId,
          productId,
          scenarioPreview,
          difficultyLevel,
          isActive,
        } = req.body;

        if (!productId) {
          let placeholderProduct = await SalesProduct.findOne({
            company: req.user?.company,
            isPlaceholderProduct: true,
          });

          if (!placeholderProduct) {
            const shortId = nanoid(6);
            placeholderProduct = await SalesProduct.create({
              friendlyId: `all-products-exploratory-${shortId}`,
              name: 'All Products (Exploratory)',
              company: req.user?.company,
              isPlaceholderProduct: true,
            });
          }

          productId = placeholderProduct?._id?.toString();
        }

        // Validate that all required references exist
        const [module, persona, scorecard, product] = await Promise.all([
          Module.findById(moduleId),
          Persona.findById(personaId),
          Scorecard.findById(scorecardId),
          SalesProduct.findById(productId),
        ]);

        if (!module) {
          return reply.status(400).send({
            success: false,
            error: 'Module not found',
          });
        }

        if (!persona) {
          return reply.status(400).send({
            success: false,
            error: 'Persona not found',
          });
        }

        if (!scorecard) {
          return reply.status(400).send({
            success: false,
            error: 'Scorecard not found',
          });
        }

        if (productId && !product) {
          return reply.status(400).send({
            success: false,
            error: 'Product not found',
          });
        }

        // Create the scenario
        const scenario = await Scenario.create({
          module: moduleId,
          persona: personaId,
          scorecard: scorecardId,
          product: productId,
          company: req.user?.company,
          scenarioDetails: {
            mainObjection: scenarioPreview.primaryObjection,
            salesDescription: scenarioPreview.description,
            salesGoal: scenarioPreview.title,
          },
          isActive,
          localizations: {},
          createdBy: req.user?._id,
          updatedBy: req.user?._id,
        });

        // Increment roleplayCount if product is specified
        if (productId) {
          await SalesProduct.findByIdAndUpdate(productId, {
            $inc: { roleplayCount: 1 },
          });
        }

        const populatedScenario: any = await Scenario.findById(scenario._id) //TODO: fix type
          .populate('module')
          .populate('persona')
          .populate('product')
          .exec();

        if (populatedScenario) {
          generateScenarioPrompt(populatedScenario);
        }

        if (scenario.scenarioDetails) {
          translateScenarioContent({
            scenarioId: scenario._id.toString(),
            scenarioDetails: scenario.scenarioDetails,
          });
        }

        // Log admin action
        await logAdminAction(req, {
          action: 'scenario_created',
          category: 'scenario',
          targetType: 'Scenario',
          targetId: scenario._id,
          targetName: scenarioPreview.title,
          details: {
            moduleId,
            personaId,
            productId,
          },
        });

        return reply.status(200).send({
          success: true,
          scenario: {
            id: scenario._id.toString(),
            module: scenario.module!.toString(),
            persona: scenario.persona!.toString(),
            scorecard: scenario.scorecard!.toString(),
            product: scenario.product!.toString(),
            scenarioDetails: scenario.scenarioDetails,
          },
        });
      } catch (error: any) {
        req.log.error(error, 'Failed to create scenario');
        return reply.status(500).send({
          success: false,
          error: 'Failed to create scenario',
          details:
            process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
      }
    },
  });

  // GET /manage/scenario/scenarios/:moduleId - Get all scenarios for a module
  app.get('/scenarios/:moduleId', {
    schema: {
      params: z.object({
        moduleId: z.string(),
      }),
      querystring: scenarioListQuerySchema,
    },
    handler: async (req, reply) => {
      try {
        const { moduleId } = req.params;
        const { page, limit, search, productId, status } =
          req.query as ScenarioListQuery;

        // Build query
        const query: any = { module: moduleId };

        if (search) {
          query.$or = [
            { 'scenarioDetails.salesGoal': { $regex: search, $options: 'i' } },
            {
              'scenarioDetails.salesDescription': {
                $regex: search,
                $options: 'i',
              },
            },
          ];
        }

        if (productId && productId !== 'no-product') {
          query.product = productId;
        }

        if (status && status !== 'all') {
          query.isActive = status === 'active';
        }

        let scenarios = await Scenario.find(query)
          .populate('persona', 'name image occupation age')
          .populate('scorecard', 'name')
          .populate('product', 'name isPlaceholderProduct')
          .sort({ createdAt: -1 })
          .lean();

        // Filter by product AFTER population
        if (productId && productId === 'no-product') {
          scenarios = scenarios.filter(
            (s: any) => s.product?.isPlaceholderProduct === true,
          );
        }

        // Apply pagination AFTER filtering
        const totalItems = scenarios.length;
        const totalPages = Math.ceil(totalItems / limit);
        const paginatedScenarios = scenarios.slice(
          (page - 1) * limit,
          page * limit,
        );

        // Continue with paginatedScenarios instead of scenarios
        const scenarioIds = paginatedScenarios.map((s: any) => s._id);

        // Count completed SalesSessions for each scenario
        const roleplayCounts = await SalesSession.aggregate([
          {
            $match: {
              scenario: { $in: scenarioIds },
              endedAt: { $exists: true }, // Only count completed sessions
            },
          },
          {
            $group: {
              _id: '$scenario',
              count: { $sum: 1 },
            },
          },
        ]);

        // Check which scenarios have any linked roleplays (completed or not)
        const scenariosWithLinkedRoleplays = await SalesSession.aggregate([
          {
            $match: {
              scenario: { $in: scenarioIds },
            },
          },
          {
            $group: {
              _id: '$scenario',
            },
          },
        ]);

        // Create maps/sets for quick lookup
        const roleplayCountMap = new Map(
          roleplayCounts.map((rc: any) => [rc._id.toString(), rc.count]),
        );

        const scenariosWithLinkedRoleplaysSet = new Set(
          scenariosWithLinkedRoleplays.map((item: any) => item._id.toString()),
        );

        // Transform the data for frontend
        const transformedScenarios = scenarios.map((scenario: any) => ({
          id: scenario._id.toString(),
          title: scenario.scenarioDetails?.salesGoal || 'Untitled Scenario',
          description: scenario.scenarioDetails?.salesDescription || '',
          persona: scenario.persona
            ? {
                id: scenario.persona._id.toString(),
                name: scenario.persona.name,
                image: scenario.persona.image,
                occupation: scenario.persona.occupation,
                age: scenario.persona.age,
              }
            : null,
          scorecard: scenario.scorecard
            ? {
                id: scenario.scorecard._id.toString(),
                name: scenario.scorecard.name,
              }
            : null,
          product: scenario.product
            ? {
                id: scenario.product._id.toString(),
                name: scenario.product.name,
                isPlaceholderProduct: scenario.product.isPlaceholderProduct,
              }
            : null,
          difficultyLevel: scenario.difficultyLevel,
          isActive: scenario.isActive !== false,
          roleplayCount: roleplayCountMap.get(scenario._id.toString()) || 0,
          hasLinkedRoleplay: scenariosWithLinkedRoleplaysSet.has(
            scenario._id.toString(),
          ),
          createdAt: scenario.createdAt,
          updatedAt: scenario.updatedAt,
        }));

        return reply.status(200).send({
          success: true,
          scenarios: transformedScenarios,
          pagination: {
            currentPage: page,
            totalPages,
            totalItems,
            itemsPerPage: limit,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
          },
        });
      } catch (error: any) {
        req.log.error(error, 'Failed to fetch scenarios');
        return reply.status(500).send({
          success: false,
          scenarios: [],
          pagination: {
            currentPage: 1,
            totalPages: 0,
            totalItems: 0,
            itemsPerPage: 10,
            hasNextPage: false,
            hasPreviousPage: false,
          },
          error: 'Failed to fetch scenarios',
        });
      }
    },
  });

  // GET /manage/scenario/:scenarioId - Get scenario details with completed roleplays
  app.get('/:scenarioId', {
    schema: {
      params: z.object({
        scenarioId: z.string(),
      }),
      querystring: scenarioDetailQuerySchema,
    },
    handler: async (req, reply) => {
      try {
        const { scenarioId } = req.params;
        const { page, limit } = req.query as { page: number; limit: number };

        // Fetch scenario with populated fields
        const scenario = await Scenario.findById(scenarioId)
          .populate('module', 'title description objectives')
          .populate('persona', 'name image occupation age')
          .populate('scorecard', 'name')
          .populate('product', 'name isPlaceholderProduct')
          .populate('updatedBy', 'email')
          .lean();

        if (!scenario) {
          return reply.status(404).send({
            success: false,
            error: 'Scenario not found',
          });
        }

        // Check if scenario has any linked roleplays
        const hasLinkedRoleplay = await SalesSession.exists({
          scenario: scenarioId,
        });

        // Fetch completed roleplays
        const totalItems = await SalesSession.countDocuments({
          scenario: scenarioId,
          endedAt: { $exists: true },
        });

        const completedRoleplays = await SalesSession.find({
          scenario: scenarioId,
          endedAt: { $exists: true },
        })
          .populate('user', 'name email')
          .sort({ endedAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean();

        const totalPages = Math.ceil(totalItems / limit);

        // Type-safe access to populated fields
        const module = scenario.module as any;
        const persona = scenario.persona as any;
        const scorecard = scenario.scorecard as any;
        const product = scenario.product as any;

        // Transform scenario data
        const transformedScenario = {
          id: scenario._id.toString(),
          title: scenario.scenarioDetails?.salesGoal || 'Untitled Scenario',
          description: scenario.scenarioDetails?.salesDescription || '',
          primaryObjection: scenario.scenarioDetails?.mainObjection || '',
          objectives: module.objectives || module.description || '',
          module: {
            id: module._id.toString(),
            title: module.title,
          },
          persona: {
            id: persona._id.toString(),
            name: persona.name,
            image: persona.image,
            occupation: persona.occupation,
            age: persona.age,
          },
          scorecard: {
            id: scorecard._id.toString(),
            name: scorecard.name,
          },
          product: product
            ? {
                id: product._id.toString(),
                name: product.name,
                isPlaceholderProduct: product.isPlaceholderProduct,
              }
            : undefined,
          isActive: scenario.isActive !== false,
          hasLinkedRoleplay: !!hasLinkedRoleplay,
          createdAt: scenario.createdAt,
          updatedAt: scenario.updatedAt,
          createdBy: scenario.createdBy,
          updatedBy: scenario.updatedBy,
        };

        // Transform completed roleplays
        const transformedRoleplays = completedRoleplays.map((session: any) => {
          const { overallScore } = parseFeedbackScores(session);
          return {
            id: session._id.toString(),
            completedAt: session.endedAt,
            user: {
              name: session.user.name,
              email: session.user.email,
            },
            score: overallScore,
          };
        });

        return reply.status(200).send({
          success: true,
          scenario: transformedScenario,
          completedRoleplays: transformedRoleplays,
          pagination: {
            currentPage: page,
            totalPages,
            totalItems,
            itemsPerPage: limit,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
          },
        });
      } catch (error: any) {
        req.log.error(error, 'Failed to fetch scenario details');
        return reply.status(500).send({
          success: false,
          error: 'Failed to fetch scenario details',
        });
      }
    },
  });

  // GET /manage/scenario/edit/:scenarioId - Get scenario data for editing
  app.get('/edit/:scenarioId', {
    schema: {
      params: z.object({
        scenarioId: z.string(),
      }),
    },
    handler: async (req, reply) => {
      try {
        const { scenarioId } = req.params;

        const scenario = await Scenario.findById(scenarioId)
          .populate('module', 'title description objectives')
          .populate('persona', 'name image occupation age')
          .populate('scorecard', 'name')
          .populate('product', 'name isPlaceholderProduct')
          .lean();

        if (!scenario) {
          return reply.status(404).send({
            success: false,
            error: 'Scenario not found',
          });
        }

        // Type-safe access to populated fields
        const module = scenario.module as any;
        const persona = scenario.persona as any;
        const scorecard = scenario.scorecard as any;
        const product = scenario.product as any;

        // Transform the data for the edit form
        const transformedScenario = {
          id: scenario._id.toString(),
          module: module?._id?.toString() || '',
          persona: persona?._id?.toString() || '',
          scorecard: scorecard?._id?.toString() || '',
          product: product?._id?.toString() || '',
          scenarioDetails: {
            salesGoal: scenario.scenarioDetails?.salesGoal || '',
            salesDescription: scenario.scenarioDetails?.salesDescription || '',
            mainObjection: scenario.scenarioDetails?.mainObjection || '',
          },
          isActive: scenario.isActive !== false,
          createdAt: scenario.createdAt,
          updatedAt: scenario.updatedAt,
        };

        return reply.status(200).send({
          success: true,
          scenario: transformedScenario,
        });
      } catch (error: any) {
        req.log.error(error, 'Failed to fetch scenario for editing');
        return reply.status(500).send({
          success: false,
          error: 'Failed to fetch scenario',
        });
      }
    },
  });

  // PUT /manage/scenario/update-scenario/:scenarioId - Update a scenario
  app.put('/update-scenario/:scenarioId', {
    schema: {
      params: z.object({
        scenarioId: z.string(),
      }),
      body: updateScenarioSchema,
      response: {
        200: z.object({
          success: z.boolean(),
          scenario: z
            .object({
              id: z.string(),
            })
            .optional(),
          error: z.string().optional(),
        }),
        400: z.object({
          success: z.boolean(),
          error: z.string(),
          details: z.string().optional(),
        }),
        404: z.object({
          success: z.boolean(),
          error: z.string(),
        }),
        500: z.object({
          success: z.boolean(),
          error: z.string(),
          details: z.string().optional(),
        }),
      },
    },
    handler: async (req, reply) => {
      try {
        const { scenarioId } = req.params;
        const {
          moduleId,
          personaId,
          scorecardId,
          productId,
          scenarioPreview,
          difficultyLevel,
          isActive,
        } = req.body as ScenarioUpdateBody;

        // Check if scenario exists
        const existingScenario = await Scenario.findById(scenarioId);
        if (!existingScenario) {
          return reply.status(404).send({
            success: false,
            error: 'Scenario not found',
          });
        }

        // Validate references if provided
        if (moduleId) {
          const module = await Module.findById(moduleId);
          if (!module) {
            return reply.status(400).send({
              success: false,
              error: 'Module not found',
            });
          }
        }

        if (personaId) {
          const persona = await Persona.findById(personaId);
          if (!persona) {
            return reply.status(400).send({
              success: false,
              error: 'Persona not found',
            });
          }
        }

        if (scorecardId) {
          const scorecard = await Scorecard.findById(scorecardId);
          if (!scorecard) {
            return reply.status(400).send({
              success: false,
              error: 'Scorecard not found',
            });
          }
        }

        if (productId) {
          const product = await SalesProduct.findById(productId);
          if (!product) {
            return reply.status(400).send({
              success: false,
              error: 'Product not found',
            });
          }
        }

        // Handle product change: update roleplayCount on old and new products
        if (productId !== undefined && existingScenario.product) {
          const oldProductId = existingScenario.product;
          const newProductId = productId || null;

          // Only update if product actually changed
          if (oldProductId?.toString() !== newProductId?.toString()) {
            // Decrement old product count
            if (oldProductId) {
              await SalesProduct.findByIdAndUpdate(oldProductId, {
                $inc: { roleplayCount: -1 },
              });
            }
            // Increment new product count
            if (newProductId) {
              await SalesProduct.findByIdAndUpdate(newProductId, {
                $inc: { roleplayCount: 1 },
              });
            }
          }
        } else if (
          productId !== undefined &&
          !existingScenario.product &&
          productId
        ) {
          // Scenario didn't have a product before, but now it does
          await SalesProduct.findByIdAndUpdate(productId, {
            $inc: { roleplayCount: 1 },
          });
        } else if (productId === null && existingScenario.product) {
          // Product is being removed from scenario
          await SalesProduct.findByIdAndUpdate(existingScenario.product, {
            $inc: { roleplayCount: -1 },
          });
        }

        // Build update object
        const updateData: any = {
          updatedBy: req.user?._id,
          updatedAt: new Date(),
        };

        if (moduleId) updateData.module = moduleId;
        if (personaId) updateData.persona = personaId;
        if (scorecardId) updateData.scorecard = scorecardId;
        if (productId !== undefined) updateData.product = productId || null;
        if (difficultyLevel) updateData.difficultyLevel = difficultyLevel;
        if (isActive !== undefined) updateData.isActive = isActive;

        if (scenarioPreview) {
          updateData.scenarioDetails = {
            mainObjection: scenarioPreview.primaryObjection,
            salesDescription: scenarioPreview.description,
            salesGoal: scenarioPreview.title,
          };
        }

        updateData.updatedAt = new Date();

        // Update the scenario
        const updatedScenario = await Scenario.findByIdAndUpdate(
          scenarioId,
          { $set: updateData },
          { new: true, runValidators: true },
        ).lean();

        if (!updatedScenario) {
          return reply.status(500).send({
            success: false,
            error: 'Failed to update scenario',
          });
        }

        const populatedScenario: any = await Scenario.findById(
          updatedScenario._id,
        )
          .populate('module')
          .populate('persona')
          .populate('product')
          .exec();

        if (populatedScenario) {
          generateScenarioPrompt(populatedScenario);
        }

        if (updatedScenario.scenarioDetails) {
          translateScenarioContent({
            scenarioId: updatedScenario._id.toString(),
            scenarioDetails: updatedScenario.scenarioDetails,
          });
        }

        // Log admin action
        await logAdminAction(req, {
          action: 'scenario_updated',
          category: 'scenario',
          targetType: 'Scenario',
          targetId: updatedScenario._id,
          targetName: updatedScenario.scenarioDetails?.salesGoal || 'Untitled',
          details: {
            moduleId,
            personaId,
            productId,
            isActive,
          },
        });

        return reply.status(200).send({
          success: true,
          scenario: {
            id: updatedScenario._id.toString(),
          },
        });
      } catch (error: any) {
        req.log.error(error, 'Failed to update scenario');
        return reply.status(500).send({
          success: false,
          error: 'Failed to update scenario',
          details:
            process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
      }
    },
  });

  // POST /manage/scenario/:scenarioId/update-status - Update scenario active status
  app.post('/:scenarioId/update-status', {
    schema: {
      params: z.object({
        scenarioId: z.string(),
      }),
      body: z.object({
        isActive: z.boolean().default(false),
      }),
    },
    handler: async (req, reply) => {
      try {
        const { scenarioId } = req.params;
        const { isActive } = req.body;

        console.log('scenarioId', scenarioId, 'isActive', isActive);

        const scenario = await Scenario.findByIdAndUpdate(scenarioId, {
          isActive,
          updatedBy: req.user?._id,
          updatedAt: new Date(),
        });

        if (!scenario) {
          return reply.status(404).send({
            success: false,
            error: 'Scenario not found',
          });
        }

        // Log admin action
        await logAdminAction(req, {
          action: 'scenario_status_changed',
          category: 'scenario',
          targetType: 'Scenario',
          targetId: scenario._id,
          targetName: scenario.scenarioDetails?.salesGoal || 'Untitled',
          details: {
            previousStatus: scenario.isActive,
            newStatus: isActive,
          },
        });

        return reply.status(200).send({
          success: true,
          message: 'Scenario updated successfully',
        });
      } catch (error: any) {
        req.log.error(error, 'Failed to update scenario status');
        return reply.status(500).send({
          success: false,
          error: 'Failed to update scenario status',
        });
      }
    },
  });

  // DELETE /manage/scenario/scenarios/:scenarioId - Delete a scenario
  app.delete('/scenarios/:scenarioId', {
    schema: {
      params: z.object({
        scenarioId: z.string(),
      }),
    },
    handler: async (req, reply) => {
      try {
        const { scenarioId } = req.params;

        const scenario = await Scenario.findByIdAndDelete(scenarioId);

        if (!scenario) {
          return reply.status(404).send({
            success: false,
            error: 'Scenario not found',
          });
        }

        // Decrement roleplayCount if product was specified
        if (scenario.product) {
          await SalesProduct.findByIdAndUpdate(scenario.product, {
            $inc: { roleplayCount: -1 },
          });
        }

        // Log admin action
        await logAdminAction(req, {
          action: 'scenario_deleted',
          category: 'scenario',
          targetType: 'Scenario',
          targetId: scenario._id,
          targetName: scenario.scenarioDetails?.salesGoal || 'Untitled',
        });

        return reply.status(200).send({
          success: true,
          message: 'Scenario deleted successfully',
        });
      } catch (error: any) {
        req.log.error(error, 'Failed to delete scenario');
        return reply.status(500).send({
          success: false,
          error: 'Failed to delete scenario',
        });
      }
    },
  });
};

export default router;
