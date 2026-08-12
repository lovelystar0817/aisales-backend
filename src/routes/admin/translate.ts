import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { ensureAdmin } from '../../utils/adminutil.js';
import { Scenario, ScenarioDocument } from '../../models/Scenario.js';
import { Module } from '../../models/Module.js';
import { Persona, PersonaDocument } from '../../models/Persona.js';
import {
  getSupportedLanguageCodes,
  isLanguageSupported,
} from '../../locale/translation.js';
import {
  translateModuleContent,
  translateScenarioContent,
} from '../../utils/scenario.js';
import { translatePersonaContent } from '../../utils/manage/persona.js';

const router: FastifyPluginAsyncZod = async (app, _opts) => {
  // Admin authentication hook
  app.addHook('preHandler', async (request, reply) => {
    await ensureAdmin(app, request);
  });

  // ==========================================================================
  // POST /admin/translate/scenarios - Trigger translation for scenarios
  // ==========================================================================
  app.post('/scenarios', {
    schema: {
      body: z.object({
        companyId: z.string(),
        scenarioId: z.string().optional(),
        targetLanguage: z.string().optional(),
      }),
      response: {
        200: z.object({
          success: z.boolean(),
          message: z.string(),
          count: z.number(),
        }),
        400: z.object({
          success: z.boolean(),
          error: z.string(),
          supportedLanguages: z.array(z.string()).optional(),
        }),
        404: z.object({
          success: z.boolean(),
          error: z.string(),
        }),
        500: z.object({
          success: z.boolean(),
          error: z.string(),
        }),
      },
    },
    handler: async (req, reply) => {
      try {
        const { companyId, scenarioId, targetLanguage } = req.body as {
          companyId: string;
          scenarioId?: string;
          targetLanguage?: string;
        };

        if (!companyId) {
          app.log.warn('Missing company ID');
          return reply.status(400).send({
            success: false,
            error: 'Missing company ID',
          });
        }

        app.log.info(
          { scenarioId, targetLanguage, companyId },
          'Scenario translation request received',
        );

        // Validate targetLanguage if provided
        if (targetLanguage && !isLanguageSupported(targetLanguage)) {
          app.log.warn({ targetLanguage }, 'Unsupported language requested');
          return reply.status(400).send({
            success: false,
            error: `Unsupported language: ${targetLanguage}`,
            supportedLanguages: getSupportedLanguageCodes(),
          });
        }

        // Skip if target is English (source language)
        if (targetLanguage?.toLowerCase() === 'en') {
          return reply.status(400).send({
            success: false,
            error: 'Cannot translate to English (source language)',
          });
        }

        let scenarios: ScenarioDocument[];

        if (scenarioId) {
          const scenario = await Scenario.findOne({
            _id: scenarioId,
            company: companyId,
          });

          if (!scenario) {
            app.log.warn({ scenarioId, companyId }, 'Scenario not found');
            return reply.status(404).send({
              success: false,
              error: 'Scenario not found',
            });
          }

          scenarios = [scenario];
        } else {
          scenarios = await Scenario.find({ company: companyId });

          if (scenarios.length === 0) {
            app.log.warn({ companyId }, 'No scenarios found for company');
            return reply.status(404).send({
              success: false,
              error: 'No scenarios found for this company',
            });
          }
        }

        app.log.info(
          { count: scenarios.length, targetLanguage },
          'Starting scenario translations',
        );

        // Trigger translations (fire and forget)
        for (const scenario of scenarios) {
          if (scenario.scenarioDetails) {
            await translateScenarioContent({
              scenarioId: scenario._id.toString(),
              scenarioDetails: scenario.scenarioDetails,
              targetLanguage,
            });
          }
        }

        const targetInfo = targetLanguage || 'all languages';
        const scenarioInfo = scenarioId
          ? `scenario ${scenarioId}`
          : `${scenarios.length} scenarios`;

        app.log.info(
          { scenarioInfo, targetInfo },
          'Scenario translation triggered successfully',
        );

        return reply.send({
          success: true,
          message: `Translation started for ${scenarioInfo} to ${targetInfo}`,
          count: scenarios.length,
        });
      } catch (error: any) {
        app.log.error(error, 'Error triggering scenario translation');
        return reply.status(500).send({
          success: false,
          error: 'Failed to trigger translation',
        });
      }
    },
  });

  // ==========================================================================
  // POST /admin/translate/modules - Trigger translation for modules
  // ==========================================================================
  app.post('/modules', {
    schema: {
      body: z.object({
        companyId: z.string(),
        moduleId: z.string().optional(),
        targetLanguage: z.string().optional(),
      }),
      response: {
        200: z.object({
          success: z.boolean(),
          message: z.string(),
        }),
        400: z.object({
          success: z.boolean(),
          error: z.string(),
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
        const { companyId, moduleId, targetLanguage } = req.body as {
          companyId?: string;
          moduleId?: string;
          targetLanguage?: string;
        };

        if (!companyId) {
          app.log.warn('Missing company id');
          return reply.status(400).send({
            success: false,
            error: 'Missing company id',
          });
        }

        app.log.info(
          { moduleId, targetLanguage, companyId },
          'Module translation request received',
        );

        const langInfo = targetLanguage
          ? `to ${targetLanguage}`
          : 'to all supported languages';

        if (moduleId) {
          const module = await Module.findOne({
            _id: moduleId,
            company: companyId,
          });

          if (!module) {
            app.log.warn({ moduleId, companyId }, 'Module not found');
            return reply.status(404).send({
              success: false,
              error: 'Module not found',
            });
          }

          app.log.info(
            { moduleId, title: module.title, targetLanguage },
            'Starting single module translation',
          );

          await translateModuleContent({
            moduleId: module._id.toString(),
            moduleContent: {
              title: module.title,
              description: module.description,
              scenarioSetup: module.scenarioSetup ?? undefined,
              objectives: module.objectives,
            },
            targetLanguage,
          });

          return reply.status(200).send({
            success: true,
            message: `Translation started for module "${module.title}" ${langInfo}`,
          });
        } else {
          const modules = await Module.find({ company: companyId });

          if (modules.length === 0) {
            app.log.info({ companyId }, 'No modules found to translate');
            return reply.status(200).send({
              success: true,
              message: 'No modules found to translate',
            });
          }

          app.log.info(
            { count: modules.length, targetLanguage },
            'Starting bulk module translation',
          );

          modules.forEach(async (module) => {
            await translateModuleContent({
              moduleId: module._id.toString(),
              moduleContent: {
                title: module.title,
                description: module.description,
                scenarioSetup: module.scenarioSetup ?? undefined,
                objectives: module.objectives,
              },
              targetLanguage,
            });
          });

          app.log.info(
            { count: modules.length },
            'Module translations triggered successfully',
          );

          return reply.status(200).send({
            success: true,
            message: `Translation started for ${modules.length} module(s) ${langInfo}`,
          });
        }
      } catch (error: any) {
        app.log.error(error, 'Failed to start module translation');
        return reply.status(500).send({
          success: false,
          error: 'Failed to start module translation',
          details:
            process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
      }
    },
  });

  // ==========================================================================
  // POST /admin/translate/personas - Trigger translation for personas
  // ==========================================================================
  app.post('/personas', {
    schema: {
      body: z.object({
        companyId: z.string(),
        personaId: z.string().optional(),
        targetLanguage: z.string().optional(),
      }),
      response: {
        200: z.object({
          success: z.boolean(),
          message: z.string(),
          count: z.number(),
        }),
        400: z.object({
          success: z.boolean(),
          error: z.string(),
          supportedLanguages: z.array(z.string()).optional(),
        }),
        404: z.object({
          success: z.boolean(),
          error: z.string(),
        }),
        500: z.object({
          success: z.boolean(),
          error: z.string(),
        }),
      },
    },
    handler: async (req, reply) => {
      try {
        const { companyId, personaId, targetLanguage } = req.body as {
          companyId: string;
          personaId?: string;
          targetLanguage?: string;
        };

        if (!companyId) {
          app.log.warn('Missing company id');
          return reply.status(400).send({
            success: false,
            error: 'Missing company id',
          });
        }

        app.log.info(
          { personaId, targetLanguage, companyId },
          'Persona translation request received',
        );

        // Validate targetLanguage if provided
        if (targetLanguage && !isLanguageSupported(targetLanguage)) {
          app.log.warn({ targetLanguage }, 'Unsupported language requested');
          return reply.status(400).send({
            success: false,
            error: `Unsupported language: ${targetLanguage}`,
            supportedLanguages: getSupportedLanguageCodes(),
          });
        }

        // Skip if target is English (source language)
        if (targetLanguage?.toLowerCase() === 'en') {
          return reply.status(400).send({
            success: false,
            error: 'Cannot translate to English (source language)',
          });
        }

        let personas: PersonaDocument[];

        if (personaId) {
          const persona = await Persona.findOne({
            $or: [{ _id: personaId }, { friendlyId: personaId }],
            company: companyId,
          });

          if (!persona) {
            app.log.warn({ personaId, companyId }, 'Persona not found');
            return reply.status(404).send({
              success: false,
              error: 'Persona not found',
            });
          }

          personas = [persona];
        } else {
          personas = await Persona.find({ company: companyId });

          if (personas.length === 0) {
            app.log.warn({ companyId }, 'No personas found for company');
            return reply.status(404).send({
              success: false,
              error: 'No personas found for this company',
            });
          }
        }

        app.log.info(
          { count: personas.length, targetLanguage },
          'Starting persona translations',
        );

        // Trigger translations (fire and forget)
        for (const persona of personas) {
          await translatePersonaContent({
            personaId: persona._id.toString(),
            occupation: persona.occupation,
            description: persona.description,
            details: persona.details || {},
            personalityDetails: persona.personalityDetails,
            targetLanguage,
          });
        }

        const targetInfo = targetLanguage || 'all languages';
        const personaInfo = personaId
          ? `persona ${personaId}`
          : `${personas.length} personas`;

        app.log.info(
          { personaInfo, targetInfo },
          'Persona translation triggered successfully',
        );

        return reply.send({
          success: true,
          message: `Translation started for ${personaInfo} to ${targetInfo}`,
          count: personas.length,
        });
      } catch (error: any) {
        app.log.error(error, 'Error triggering persona translation');
        return reply.status(500).send({
          success: false,
          error: 'Failed to trigger translation',
        });
      }
    },
  });
};

export default router;
