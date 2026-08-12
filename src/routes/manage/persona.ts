import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { ChatOpenAI } from '@langchain/openai';
import {
  amitPersona,
  angelinePersona,
  elainePersona,
  gracePersona,
  hafizPersona,
  marcPersona,
  michaelPersona,
  raviPersona,
  yvonnePersona,
} from '../../data/personas/index.js';
import {
  createAvatarGenerationPrompt,
  createPersonalityGenerationPrompt,
} from '../../prompts/persona.js';
import {
  convertSupportingFieldsToDetails,
  getPersonaVoiceByAccent,
  parseBulletPoints,
  getDefaultLanguageVoiceProviderIds,
  getAgeGroup,
} from '../../utils/persona.js';
import {
  DEFAULT_LANGUAGE,
  OPENAI_MODEL_GPT_4_1_MINI,
} from '../../utils/constants.js';
import { Persona, PersonaDetails } from '../../models/Persona.js';
import { Voice } from '../../models/Voice.js';
import { SalesSession } from '../../models/SalesSession.js';
import { Scenario } from '../../models/Scenario.js';
import OpenAI from 'openai';
import {
  generateDescriptionWithAI,
  uploadAvatarToS3,
} from '../../utils/manage/persona.js';
import { logAdminAction } from '../../utils/adminLogger.js';

// ============================================================================
// Types & Interfaces
// ============================================================================

interface SupportingField {
  fieldName: string;
  value: string;
}

interface PersonaCreateBody {
  name: string;
  age: number;
  gender: 'male' | 'female';
  role: string;
  personalityTrait: string;
  decisionMakingStyle: string;
  communicationStyle: string;
  image?: string | null;
  accent?: 'american' | 'british' | 'singaporean';
  supportingFields: SupportingField[];
  targetLanguages?: string[];
  languageVoices?: Record<string, string>; // { langCode: voiceId }
}

interface PersonaListQuery {
  page: number;
  limit: number;
  search?: string;
}

interface TraitItem {
  value: string;
  label: string;
}

interface PersonalityTraits {
  personality: TraitItem[];
  buyer: TraitItem[];
  communication: TraitItem[];
}

// ============================================================================
// Constants
// ============================================================================

const MAX_LANGUAGES = 10;
const MIN_TRAITS_REQUIRED = 3;

// ============================================================================
// Validation Schemas
// ============================================================================

const createPersonaSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  age: z.number().max(100, 'Age must be less than 100'),
  gender: z.enum(['male', 'female'], {
    errorMap: () => ({ message: 'Gender must be either male or female' }),
  }),
  role: z.string().min(1, 'Role is required').max(200),
  personalityTrait: z.string().min(1),
  decisionMakingStyle: z.string().min(1),
  communicationStyle: z.string().min(1),
  image: z.string().url().optional().nullable(),
  accent: z
    .enum(['american', 'british', 'singaporean'], {
      errorMap: () => ({ message: 'Invalid accent selection' }),
    })
    .optional(),
  supportingFields: z
    .array(
      z.object({
        fieldName: z.string().min(1),
        value: z.string().min(1),
      }),
    )
    .default([]),
  languageVoices: z.record(z.string(), z.string()).optional(),
});

const personalityGenerationSchema = z.object({
  traits: z.object({
    personality: z
      .array(
        z.object({
          value: z.string(),
          label: z.string(),
        }),
      )
      .default([]),
    buyer: z
      .array(
        z.object({
          value: z.string(),
          label: z.string(),
        }),
      )
      .default([]),
    communication: z
      .array(
        z.object({
          value: z.string(),
          label: z.string(),
        }),
      )
      .default([]),
  }),
});

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Build localizations object with Voice documents for all supported languages
 * based on age and gender
 */
async function buildDefaultLocalizations(
  age: number,
  gender: 'male' | 'female',
  role: string,
  details: PersonaDetails,
  personalityDetails: {
    persona: string;
    communicationStyle: string[];
    decisionMaking: string[];
  },
): Promise<{
  localizations: Record<string, any>;
  defaultVoice: any;
  defaultVoiceId: string;
}> {
  const voiceProviderIds = getDefaultLanguageVoiceProviderIds(age, gender);
  const ageGroup = getAgeGroup(age);
  const localizations: Record<string, any> = {};
  let defaultVoice = null;
  let defaultVoiceId = '';

  for (const [lang, providerId] of Object.entries(voiceProviderIds)) {
    // Determine provider based on voice ID pattern
    let provider: 'elevenlabs' | 'chirp' | 'cartesia' = 'elevenlabs';
    if (
      providerId.includes('th-TH-Chirp') ||
      providerId.includes('cmn-TW-Chirp')
    ) {
      provider = 'chirp' as any; // Google TTS Chirp voices
    } else if (
      providerId.includes('-') &&
      providerId.split('-').length === 5 &&
      providerId.match(/^[a-f0-9-]+$/)
    ) {
      provider = 'cartesia' as any; // Cartesia uses UUID format
    }

    // Try to find existing voice
    let voice = await Voice.findOne({
      providerId,
      provider: provider as any,
      gender,
      language: lang,
    });

    // Create voice if it doesn't exist
    if (!voice) {
      const voiceName = `${gender === 'male' ? 'Male' : 'Female'} ${ageGroup === 'young' ? 'Young' : 'Older'} (${lang.toUpperCase()})`;
      voice = await Voice.create({
        friendlyId: `${provider}-${lang}-${gender}-${ageGroup}-${providerId.substring(0, 8)}`,
        name: voiceName,
        providerId,
        provider: provider as any,
        language: lang,
        gender,
        ageGroup,
        isActive: true,
      });
    }

    // Add to localizations
    localizations[lang] = {
      occupation: role,
      details,
      voice: voice._id,
      personalityDetails,
    };

    // Note: English is not auto-generated, so this will never match
    // The default voice will be set from the first language or when accent is provided
    if (lang === 'en') {
      defaultVoice = voice;
      defaultVoiceId = voice.providerId;
    }
  }

  // English is not auto-generated, so default voice will be set when accent is provided
  // If no default voice is set, use the first available language
  if (!defaultVoice) {
    const firstLang = Object.keys(localizations)[0];
    if (firstLang) {
      defaultVoice = await Voice.findById(localizations[firstLang].voice);
      defaultVoiceId = defaultVoice?.providerId || '';
    }
  }

  return { localizations, defaultVoice, defaultVoiceId };
}

// ============================================================================
// Route Handlers
// ============================================================================

const router: FastifyPluginAsyncZod = async (app, _opts) => {
  // Apply authentication middleware
  app.use(app.checkAuth0JWT);
  app.addHook('preHandler', app.authenticateManage);

  // ==========================================================================
  // POST /manage/persona/create - Create a new persona
  // ==========================================================================
  app.post('/create', {
    schema: {
      body: createPersonaSchema,
    },
    handler: async (req, reply) => {
      try {
        const {
          name,
          age,
          gender,
          role,
          personalityTrait,
          decisionMakingStyle,
          communicationStyle,
          image,
          accent,
          supportingFields,
          languageVoices,
        } = req.body as PersonaCreateBody;

        const userId = req.user!._id;
        const companyId = req.user!.company;

        // Check if a persona with this name already exists in the company
        const existingPersona = await Persona.findOne({
          name: name.trim(),
          company: companyId,
        });

        if (existingPersona) {
          return reply.status(409).send({
            success: false,
            error:
              'A persona with this name already exists. Please choose a different name.',
            errorCode: 'NAME_ALREADY_EXISTS',
          });
        }

        const validSupportingFields = (supportingFields || []).filter(
          (field: any): field is { fieldName: string; value: string } =>
            field &&
            typeof field.fieldName === 'string' &&
            field.fieldName.trim() !== '' &&
            typeof field.value === 'string' &&
            field.value.trim() !== '',
        );

        // Convert supporting fields to details object
        const details = convertSupportingFieldsToDetails(validSupportingFields);

        // Parse bullet points into arrays for the model structure
        const decisionMakingArray = parseBulletPoints(decisionMakingStyle);
        const communicationStyleArray = parseBulletPoints(communicationStyle);

        // Construct personalityDetails matching the model structure
        const personalityDetails = {
          persona: personalityTrait,
          decisionMaking: decisionMakingArray,
          communicationStyle: communicationStyleArray,
        };

        // Handle voice selection
        let defaultVoice = null;
        let defaultVoiceId = '';
        let localizations: Record<string, any> = {};

        if (languageVoices && Object.keys(languageVoices).length > 0) {
          // User provided specific voice selections
          for (const [lang, voiceId] of Object.entries(languageVoices)) {
            const voice = await Voice.findById(voiceId);
            if (voice && voice.language === lang && voice.gender === gender) {
              localizations[lang] = {
                occupation: role,
                details: details,
                voice: voice._id,
                personalityDetails: personalityDetails,
              };

              // Use English voice as the default/root voice
              if (lang === 'en') {
                defaultVoice = voice;
                defaultVoiceId = voice.providerId;
              }
            }
          }

          // If no English voice was set, use the first available voice as default
          const langKeys = Object.keys(localizations);
          if (!defaultVoice && langKeys.length > 0) {
            const firstLang = langKeys[0];
            defaultVoice = await Voice.findById(localizations[firstLang].voice);
            defaultVoiceId = defaultVoice?.providerId || '';
          }
        } else {
          // Auto-generate voices for all supported languages (except English)
          const result = await buildDefaultLocalizations(
            age,
            gender,
            role,
            details,
            personalityDetails,
          );
          localizations = result.localizations;
          defaultVoice = result.defaultVoice;
          defaultVoiceId = result.defaultVoiceId;

          // Add English voice only if accent is provided by user
          if (accent) {
            const accentVoiceId = getPersonaVoiceByAccent(gender, accent);
            let accentVoice = await Voice.findOne({
              providerId: accentVoiceId,
              provider: 'elevenlabs',
              gender,
              accent,
            });

            if (!accentVoice) {
              accentVoice = await Voice.create({
                friendlyId: `elevenlabs-${gender}-${accent}-voice-${accentVoiceId}`,
                name: gender === 'male' ? 'Default Male' : 'Default Female',
                providerId: accentVoiceId,
                provider: 'elevenlabs',
                language: DEFAULT_LANGUAGE,
                gender,
                accent,
                isActive: true,
              });
            }

            // Add English voice with user-specified accent
            localizations.en = {
              occupation: role,
              details: details,
              voice: accentVoice._id,
              personalityDetails: personalityDetails,
            };

            // Set English as default voice
            defaultVoice = accentVoice;
            defaultVoiceId = accentVoice.providerId;
          }
        }

        // Create persona without description (will be generated async)
        const persona = await Persona.create({
          name,
          age,
          occupation: role,
          image: image || undefined,
          description: '', // Empty initially, will be updated async
          details: details,
          personalityDetails: personalityDetails,
          voiceId: defaultVoiceId,
          voice: defaultVoice,
          localizations:
            Object.keys(localizations).length > 0 ? localizations : undefined,
          annualIncome: 0,
          gender,
          company: companyId,
          createdBy: userId,
          updatedBy: userId,
          isCustom: true,
        });

        console.log('Persona created successfully:', {
          id: persona._id,
          friendlyId: persona.friendlyId,
          name: persona.name,
        });

        generateDescriptionWithAI({
          personaId: persona._id.toString(),
          name,
          age,
          role,
          gender,
          personalityTrait,
          decisionMakingStyle,
          communicationStyle,
          details,
        });

        // Log admin action
        await logAdminAction(req, {
          action: 'persona_created',
          category: 'persona',
          targetType: 'Persona',
          targetId: persona._id,
          targetName: persona.name,
          details: {
            occupation: role,
            gender,
            age,
          },
        });

        return reply.status(201).send({
          success: true,
          message: 'Persona created successfully',
          persona: {
            id: persona._id.toString(),
            friendlyId: persona.friendlyId,
            name: persona.name,
            age: persona.age,
            occupation: persona.occupation,
            image: persona.image || '',
            description: persona.description || 'Generating description...',
            details: persona.details,
            personalityDetails: persona.personalityDetails,
            annualIncome: persona.annualIncome || 0,
            voice: persona.voice,
            gender: persona.gender,
            company: persona.company,
          },
        });
      } catch (error: any) {
        console.error('Error creating persona:', error);

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
            error: 'A persona with similar details already exists',
          });
        }

        return reply.status(500).send({
          success: false,
          error: 'Failed to create persona',
        });
      }
    },
  });

  // ==========================================================================
  // GET /manage/persona/list - Get all personas for company with pagination
  // ==========================================================================
  app.get('/list', {
    handler: async (req, reply) => {
      try {
        const { page, limit, search } = req.query as PersonaListQuery;
        const companyId = req.user!.company;

        const query: any = {
          company: companyId,
        };

        if (search && search.trim()) {
          query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { occupation: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
          ];
        }

        // Get total count and calculate pagination
        const totalPersonas = await Persona.countDocuments(query);
        const totalPages = Math.ceil(totalPersonas / limit);

        // Get paginated personas
        const personas = await Persona.find(query)
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .populate('voice')
          .select('-__v')
          .lean();

        // Get persona IDs for aggregations
        const personaIds = personas.map((p: any) => p._id);

        // Count Scenarios for each persona
        const scenarioCounts = await Scenario.aggregate([
          {
            $match: {
              persona: { $in: personaIds },
            },
          },
          {
            $group: {
              _id: '$persona',
              count: { $sum: 1 },
            },
          },
        ]);

        // Check which personas have completed roleplays
        const personasWithCompletedRoleplays = await SalesSession.aggregate([
          {
            $match: {
              scenario: { $exists: true, $ne: null },
              endedAt: { $exists: true },
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
              'scenarioData.persona': { $in: personaIds },
            },
          },
          {
            $group: {
              _id: '$scenarioData.persona',
            },
          },
        ]);

        // Create maps/sets for quick lookup
        const scenarioCountMap = new Map(
          scenarioCounts.map((sc: any) => [sc._id.toString(), sc.count]),
        );

        const personasWithCompletedRoleplaysSet = new Set(
          personasWithCompletedRoleplays.map((item: any) =>
            item._id.toString(),
          ),
        );

        // Map personas with scenario count and roleplay status
        const personaDocs = personas.map((p: any) => ({
          id: p._id.toString(),
          friendlyId: p.friendlyId,
          name: p.name,
          age: p.age,
          occupation: p.occupation,
          image: p.image || '',
          description: p.description,
          details: p.details,
          personalityDetails: p.personalityDetails,
          annualIncome: p.annualIncome || 0,
          voice: p.voice,
          gender: p.gender,
          company: p.company,
          isCustom: p.isCustom,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
          scenarioCount: scenarioCountMap.get(p._id.toString()) || 0,
          hasCompletedRoleplay: personasWithCompletedRoleplaysSet.has(
            p._id.toString(),
          ),
          hasLinkedScenario: (scenarioCountMap.get(p._id.toString()) || 0) > 0,
        }));

        return reply.send({
          success: true,
          personas: personaDocs,
          pagination: {
            currentPage: page,
            totalPages,
            totalPersonas,
            limit,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
          },
        });
      } catch (error) {
        console.error('Error fetching personas:', error);
        return reply.status(500).send({
          success: false,
          error: 'Failed to fetch personas',
        });
      }
    },
  });

  // ==========================================================================
  // GET /manage/persona/:id - Get single persona
  // ==========================================================================
  app.get('/:id', {
    handler: async (req, reply) => {
      try {
        const { id } = req.params as { id: string };
        const companyId = req.user!.company;

        const persona = await Persona.findOne({
          $or: [{ _id: id }, { friendlyId: id }],
          company: companyId,
        })
          .populate('voice')
          .populate('updatedBy', 'email')
          .lean();

        if (!persona) {
          return reply.status(404).send({
            success: false,
            error: 'Persona not found',
          });
        }

        // Get scenarios that use this persona
        const scenarios = await Scenario.find({
          persona: persona._id,
        })
          .populate('persona', 'voice')
          .select('_id')
          .lean();

        const scenarioIds = scenarios.map((s) => s._id);

        // Check if there are any completed roleplays for this persona
        const hasCompletedRoleplay =
          scenarioIds.length > 0
            ? await SalesSession.exists({
                scenario: { $in: scenarioIds },
                endedAt: { $exists: true },
              })
            : false;

        // Populate voices in localizations if present
        // Convert Mongoose sub-document to plain object to properly iterate over language keys
        let localizations: Record<string, any> | undefined;
        if (persona.localizations) {
          localizations = {};
          const localizationsObj = JSON.parse(
            JSON.stringify(persona.localizations),
          );

          for (const [lang, localization] of Object.entries(localizationsObj)) {
            if (!localization || lang.startsWith('$') || lang.startsWith('_'))
              continue;
            const loc = localization as any;
            if (loc?.voice) {
              const voice = await Voice.findById(loc.voice).lean();
              localizations[lang] = {
                ...loc,
                voice,
              };
            } else {
              localizations[lang] = loc;
            }
          }
        }

        // Transform to response format
        const personaDoc = {
          id: persona._id.toString(),
          friendlyId: persona.friendlyId,
          name: persona.name,
          age: persona.age,
          occupation: persona.occupation,
          image: persona.image || '',
          description: persona.description,
          details: persona.details,
          personalityDetails: persona.personalityDetails,
          annualIncome: persona.annualIncome || 0,
          voice: persona.voice,
          gender: persona.gender,
          company: persona.company,
          isCustom: persona.isCustom,
          updatedBy: persona.updatedBy,
          createdAt: persona.createdAt,
          updatedAt: persona.updatedAt,
          hasCompletedRoleplay: !!hasCompletedRoleplay,
          hasLinkedScenario: scenarios?.length > 0,
          localizations,
        };

        return reply.send({
          success: true,
          persona: personaDoc,
        });
      } catch (error) {
        console.error('Error fetching persona:', error);
        return reply.status(500).send({
          success: false,
          error: 'Failed to fetch persona',
        });
      }
    },
  });

  // ==========================================================================
  // GET /manage/persona/:id/usage - Get scenarios that use this persona
  // ==========================================================================
  app.get('/:id/usage', {
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

        // Verify persona exists and belongs to this company
        const persona = await Persona.findOne({
          $or: [{ _id: id }, { friendlyId: id }],
          company: companyId,
        });

        if (!persona) {
          return reply.status(404).send({
            success: false,
            error: 'Persona not found',
          });
        }

        // Get total count
        const totalCount = await Scenario.countDocuments({
          persona: persona._id,
        });

        // Get paginated scenarios that use this persona
        const scenarios = await Scenario.find({
          persona: persona._id,
        })
          .populate('module', 'title')
          .populate('product', 'name')
          .select('_id module product')
          .skip(skip)
          .limit(limitNum)
          .lean();

        const formattedScenarios = scenarios.map((scenario: any) => ({
          id: scenario._id.toString(),
          title:
            `${scenario.module?.title} with ${persona?.name}` ||
            'Untitled Scenario',
          productName: scenario.product?.name || null,
        }));

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
      } catch (error) {
        console.error('Error fetching persona usage:', error);
        return reply.status(500).send({
          success: false,
          error: 'Failed to fetch persona usage',
        });
      }
    },
  });

  // ==========================================================================
  // PUT /manage/persona/:id - Update persona
  // ==========================================================================
  app.put('/:id', {
    schema: {
      body: createPersonaSchema,
    },
    handler: async (req, reply) => {
      try {
        const { id } = req.params as { id: string };
        const {
          name,
          age,
          gender,
          role,
          personalityTrait,
          decisionMakingStyle,
          communicationStyle,
          image,
          accent,
          supportingFields,
          languageVoices,
        } = req.body as PersonaCreateBody;

        const companyId = req.user!.company;

        // Find existing persona
        const existingPersona = await Persona.findOne({
          $or: [{ _id: id }, { friendlyId: id }],
          company: companyId,
        }).populate('voice');

        if (!existingPersona) {
          return reply.status(404).send({
            success: false,
            error: 'Persona not found',
          });
        }

        const validSupportingFields = (supportingFields || []).filter(
          (field: any): field is { fieldName: string; value: string } =>
            field &&
            typeof field.fieldName === 'string' &&
            field.fieldName.trim() !== '' &&
            typeof field.value === 'string' &&
            field.value.trim() !== '',
        );

        // Convert supporting fields to details object
        const details = convertSupportingFieldsToDetails(validSupportingFields);

        // Parse bullet points into arrays for the model structure
        const decisionMakingArray = parseBulletPoints(decisionMakingStyle);
        const communicationStyleArray = parseBulletPoints(communicationStyle);

        // Construct personalityDetails matching the model structure
        const personalityDetails = {
          persona: personalityTrait,
          decisionMaking: decisionMakingArray,
          communicationStyle: communicationStyleArray,
        };

        // Handle voice selection
        let defaultVoice = null;
        let defaultVoiceId = '';
        let localizations: Record<string, any> = {};

        if (languageVoices && Object.keys(languageVoices).length > 0) {
          // User provided specific voice selections
          for (const [lang, voiceId] of Object.entries(languageVoices)) {
            const voice = await Voice.findById(voiceId);
            if (voice && voice.language === lang && voice.gender === gender) {
              localizations[lang] = {
                occupation: role,
                details: details,
                voice: voice._id,
                personalityDetails: personalityDetails,
              };

              // Use English voice as the default/root voice
              if (lang === 'en') {
                defaultVoice = voice;
                defaultVoiceId = voice.providerId;
              }
            }
          }

          // If no English voice was set, use the first available voice as default
          const langKeys = Object.keys(localizations);
          if (!defaultVoice && langKeys.length > 0) {
            const firstLang = langKeys[0];
            defaultVoice = await Voice.findById(localizations[firstLang].voice);
            defaultVoiceId = defaultVoice?.providerId || '';
          }
        } else {
          // Auto-generate voices for all supported languages (except English)
          const result = await buildDefaultLocalizations(
            age,
            gender,
            role,
            details,
            personalityDetails,
          );
          localizations = result.localizations;
          defaultVoice = result.defaultVoice;
          defaultVoiceId = result.defaultVoiceId;

          // Add English voice only if accent is provided by user
          if (accent) {
            const accentVoiceId = getPersonaVoiceByAccent(gender, accent);
            const existingVoice: any = existingPersona.voice;

            let accentVoice = null;
            if (
              existingVoice &&
              existingVoice.gender === gender &&
              existingVoice.accent === accent
            ) {
              accentVoice = existingVoice;
            }

            if (!accentVoice) {
              const foundVoice = await Voice.findOne({
                providerId: accentVoiceId,
                provider: 'elevenlabs',
                gender,
                accent,
              });
              if (foundVoice) {
                accentVoice = foundVoice;
              }
            }

            if (!accentVoice) {
              accentVoice = await Voice.create({
                friendlyId: `elevenlabs-${gender}-${accent}-voice-${accentVoiceId}`,
                name: gender === 'male' ? 'Default Male' : 'Default Female',
                providerId: accentVoiceId,
                provider: 'elevenlabs',
                language: DEFAULT_LANGUAGE,
                gender,
                accent,
                isActive: true,
              });
            }

            // Add English voice with user-specified accent
            localizations.en = {
              occupation: role,
              details: details,
              voice: accentVoice._id,
              personalityDetails: personalityDetails,
            };

            // Set English as default voice
            defaultVoice = accentVoice;
            defaultVoiceId = accentVoice.providerId;
          }
        }

        // Update persona fields
        existingPersona.name = name;
        existingPersona.age = age;
        existingPersona.occupation = role;
        existingPersona.image = image || existingPersona.image;
        existingPersona.details = details;
        existingPersona.personalityDetails = personalityDetails;
        existingPersona.annualIncome = 0;
        existingPersona.voiceId = defaultVoiceId;
        existingPersona.voice = defaultVoice;
        if (Object.keys(localizations).length > 0) {
          existingPersona.localizations = localizations as any;
        }
        existingPersona.gender = gender;
        existingPersona.updatedBy = req.user!._id;

        await existingPersona.save();

        console.log('Persona updated successfully:', {
          id: existingPersona._id,
          friendlyId: existingPersona.friendlyId,
          name: existingPersona.name,
        });

        // Generate description asynchronously (fire and forget)
        generateDescriptionWithAI({
          personaId: existingPersona._id.toString(),
          name,
          age,
          role,
          gender,
          personalityTrait,
          decisionMakingStyle,
          communicationStyle,
          details,
        });

        // Log admin action
        await logAdminAction(req, {
          action: 'persona_updated',
          category: 'persona',
          targetType: 'Persona',
          targetId: existingPersona._id,
          targetName: existingPersona.name,
          details: {
            occupation: role,
            gender,
            age,
          },
        });

        return reply.send({
          success: true,
          message: 'Persona updated successfully',
          persona: {
            id: existingPersona._id.toString(),
            friendlyId: existingPersona.friendlyId,
            name: existingPersona.name,
            age: existingPersona.age,
            occupation: existingPersona.occupation,
            image: existingPersona.image || '',
            description:
              existingPersona.description || 'Updating description...',
            details: existingPersona.details,
            personalityDetails: existingPersona.personalityDetails,
            annualIncome: existingPersona.annualIncome || 0,
            voice: existingPersona.voice,
            gender: existingPersona.gender,
            company: existingPersona.company,
          },
        });
      } catch (error: any) {
        console.error('Error updating persona:', error);

        if (error.name === 'ValidationError') {
          return reply.status(400).send({
            success: false,
            error: 'Validation error',
            details: error.message,
          });
        }

        return reply.status(500).send({
          success: false,
          error: 'Failed to update persona',
        });
      }
    },
  });

  // ==========================================================================
  // DELETE /manage/persona/:id - Delete a persona
  // ==========================================================================
  app.delete('/:id', {
    handler: async (req, reply) => {
      try {
        const { id } = req.params as { id: string };
        const companyId = req.user!.company;

        const persona = await Persona.findOneAndDelete({
          $or: [{ _id: id }],
          company: companyId,
        });

        if (!persona) {
          return reply.status(404).send({
            success: false,
            error: 'Persona not found or cannot be deleted',
          });
        }

        // Log admin action
        await logAdminAction(req, {
          action: 'persona_deleted',
          category: 'persona',
          targetType: 'Persona',
          targetId: persona._id,
          targetName: persona.name,
        });

        return reply.send({
          success: true,
          message: 'Persona deleted successfully',
        });
      } catch (error) {
        console.error('Error deleting persona:', error);
        return reply.status(500).send({
          success: false,
          error: 'Failed to delete persona',
        });
      }
    },
  });

  // ==========================================================================
  // GET /manage/persona/persona-avatars - Get all persona avatars
  // ==========================================================================
  app.get('/persona-avatars', {
    handler: async (req, reply) => {
      try {
        const allPersonas = [
          marcPersona,
          gracePersona,
          amitPersona,
          angelinePersona,
          raviPersona,
          elainePersona,
          yvonnePersona,
          michaelPersona,
          hafizPersona,
        ];

        const avatars = allPersonas.map((persona) => ({
          id: persona.base.id,
          image: persona.base.image,
        }));

        return reply.send(avatars);
      } catch (error) {
        console.error('Error fetching persona avatars:', error);
        return reply.status(500).send({
          success: false,
          error: 'Failed to fetch persona avatars',
        });
      }
    },
  });

  // ==========================================================================
  // POST /manage/persona/generate-personality - Generate personality text from traits
  // ==========================================================================
  app.post('/generate-personality', {
    schema: {
      body: personalityGenerationSchema,
    },
    handler: async (req, reply) => {
      try {
        const { traits } = req.body as { traits: PersonalityTraits };

        const totalTraits =
          traits.personality.length +
          traits.buyer.length +
          traits.communication.length;

        if (totalTraits < MIN_TRAITS_REQUIRED) {
          return reply.status(400).send({
            success: false,
            error: `At least ${MIN_TRAITS_REQUIRED} traits must be provided`,
          });
        }

        const model = new ChatOpenAI({ modelName: OPENAI_MODEL_GPT_4_1_MINI });
        const prompt = createPersonalityGenerationPrompt(traits);
        const response = await model.invoke(prompt);
        const generatedText = response.content as string;

        // Parse the JSON response
        const cleanedText = generatedText
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim();
        const parsed = JSON.parse(cleanedText);

        return reply.send({
          success: true,
          personalityTrait: parsed.personalityTrait,
          decisionMakingStyle: parsed.decisionMakingStyle,
          communicationStyle: parsed.communicationStyle,
        });
      } catch (error) {
        console.error('Error generating personality:', error);
        return reply.status(500).send({
          success: false,
          error: 'Failed to generate personality description',
        });
      }
    },
  });

  app.post('/generate-avatar', {
    schema: {
      body: z.object({
        name: z.string().min(1, 'Name is required').max(100),
        age: z.number().max(100, 'Age must be less than 100'),
        gender: z.enum(['male', 'female'], {
          errorMap: () => ({ message: 'Gender must be either male or female' }),
        }),
        role: z.string().min(1, 'Role is required').max(200),
        location: z.string().min(1, 'Location is required').max(200),
      }),
    },
    handler: async (req, reply) => {
      try {
        const { name, gender, age, role, location } = req.body as {
          name: string;
          gender: 'male' | 'female';
          age: number;
          role: string;
          location: string;
        };

        const prompt = createAvatarGenerationPrompt({
          gender,
          age,
          role,
          location,
        });

        const openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
        });
        // Use OpenAI SDK
        const response = await openai.images.generate({
          model: 'gpt-image-1',
          prompt: prompt,
          n: 1,
          size: '1024x1024',
        });

        console.log('Avatar generated, uploading to S3...');

        const base64Data = response?.data?.[0].b64_json;
        if (!base64Data) {
          throw new Error('No image data received from OpenAI');
        }

        // Upload to S3 using existing utility
        const imageUrl = await uploadAvatarToS3({
          base64Data,
          companyId: req.user!.company!.toString(),
          personaName: name,
        });

        console.log('Avatar uploaded successfully:', imageUrl);

        return reply.status(200).send({
          success: true,
          imageUrl: imageUrl,
        });
      } catch (error: any) {
        console.error('Error generating avatar:', error);
        return reply.status(500).send({
          success: false,
          error: 'Failed to generate avatar',
          details:
            process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
      }
    },
  });
};

export default router;
