import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { getAgenda } from '../../jobs/agenda.js';
import { getLanguageHeader } from '../../locale/request.js';
import { setupUniversalAuthWithManage } from '../../middleware/conditionalAuth.js';
import {
  CallAnalysis,
  isCallAnalysisComplete,
  type CallAnalysisProduct,
} from '../../models/CallAnalysis.js';
import { CallAnalysisFeedback } from '../../models/CallAnalysisFeedback.js';
import { Company, ICompany } from '../../models/Company.js';
import { uploadToS3WithTTL } from '../../services/call-analysis/s3Upload.js';
import {
  AGENDA_JOB_TYPES,
  CALL_ANALYSIS_FEATURE_VERSION,
  FILE_SIZE_LIMIT,
  SLACK_FEEDBACK_CHANNEL_ID,
  SLACK_REPORT_TYPES,
} from '../../utils/constants.js';
import { calculateFileHash } from '../../utils/fileHash.js';

const router: FastifyPluginAsyncZod = async (app, _opts) => {
  setupUniversalAuthWithManage(app);

  /**
   * @method POST /call-analysis/upload
   * @description Upload audio file for call analysis
   */
  app.route({
    url: '/upload',
    method: 'POST',
    schema: {
      consumes: ['multipart/form-data'],
      response: {
        200: z.object({
          id: z.string(),
          status: z.string(),
          product: z.string().optional(),
          fromCache: z.boolean().optional(),
        }),
        400: z.object({
          error: z.string(),
        }),
        413: z.object({
          error: z.string(),
        }),
      },
    },
    async handler(req, reply) {
      // With attachFieldsToBody: true, files are attached to req.body
      const reqBody = req.body as any;

      // Check if audio field exists
      if (!reqBody.audio || !reqBody.audio._buf) {
        return reply.code(400).send({
          error: 'No audio file uploaded',
        });
      }

      const audioField = reqBody.audio;
      const buffer = audioField._buf;
      const fileName = audioField.filename || 'audio.mp3';
      const mimeType = audioField.mimetype;
      const product = reqBody.product?.value as CallAnalysisProduct | undefined;

      // Validate file type
      if (
        mimeType !== 'audio/mpeg' &&
        mimeType !== 'audio/mp3' &&
        mimeType !== 'audio/x-mpeg'
      ) {
        return reply.code(400).send({
          error: 'Invalid file type. Please upload an MP3 file.',
        });
      }

      const maxSize = FILE_SIZE_LIMIT;
      if (buffer.length > maxSize) {
        return reply.code(413).send({
          error: 'File too large. Maximum size is 50MB.',
        });
      }

      // Calculate file hash for duplicate detection
      const fileHash = calculateFileHash(buffer);

      // Check if we already have a completed analysis for this file hash AND feature version
      const existingAnalysis = await CallAnalysis.findOne({
        fileHash,
        featureVersion: CALL_ANALYSIS_FEATURE_VERSION,
        user: req.user!._id,
        ...(product ? { product } : { product: { $exists: false } }),
        status: 'completed',
      }).lean();

      if (existingAnalysis && isCallAnalysisComplete(existingAnalysis)) {
        // Create new entry copying results from existing analysis
        const newCallAnalysis = await CallAnalysis.create({
          user: req.user!._id,
          company: req.user!.company,
          audioFileUrl: existingAnalysis.audioFileUrl,
          fileHash,
          featureVersion: CALL_ANALYSIS_FEATURE_VERSION,
          product: existingAnalysis.product,
          status: 'completed',
          rawTranscript: existingAnalysis.rawTranscript,
          transcript: existingAnalysis.transcript,
          rawAssessment: existingAnalysis.rawAssessment,
          assessment: existingAnalysis.assessment,
          rawMsigAssessment: existingAnalysis.rawMsigAssessment,
          msigAssessment: existingAnalysis.msigAssessment,
          rawOverview: existingAnalysis.rawOverview,
          overview: existingAnalysis.overview,
          processingSteps: {
            transcription: {
              status: 'completed',
              startedAt: new Date(),
              completedAt: new Date(),
            },
            transcriptPIIRemoval: {
              status: 'completed',
              startedAt: new Date(),
              completedAt: new Date(),
            },
            assessment: {
              status: 'completed',
              startedAt: new Date(),
              completedAt: new Date(),
            },
            assessmentPIIRemoval: {
              status: 'completed',
              startedAt: new Date(),
              completedAt: new Date(),
            },
            overview: {
              status: 'completed',
              startedAt: new Date(),
              completedAt: new Date(),
            },
            overviewPIIRemoval: {
              status: 'completed',
              startedAt: new Date(),
              completedAt: new Date(),
            },
          },
          completedAt: new Date(),
          new: true,
        });

        return reply.send({
          id: newCallAnalysis._id.toString(),
          status: 'completed',
          product: newCallAnalysis.product,
          fromCache: true,
        });
      }

      // First, generate a temporary ID for the S3 path
      const tempId = new (await import('mongoose')).Types.ObjectId();

      // Upload to S3 with 30-day TTL
      const s3Url = await uploadToS3WithTTL({
        namespace: 'call-analysis',
        buffer,
        fileName,
        analysisId: tempId.toString(),
        userId: req.user!._id.toString(),
        companyId: req.user!.company.toString(),
      });

      // Create CallAnalysis record with S3 URL
      const callAnalysis = await CallAnalysis.create({
        _id: tempId,
        user: req.user!._id,
        company: req.user!.company,
        audioFileUrl: s3Url,
        fileHash,
        featureVersion: CALL_ANALYSIS_FEATURE_VERSION,
        product,
        status: 'transcribing',
        processingSteps: {
          transcription: { status: 'pending' },
          transcriptPIIRemoval: { status: 'pending' },
          assessment: { status: 'pending' },
          assessmentPIIRemoval: { status: 'pending' },
          overview: { status: 'pending' },
          overviewPIIRemoval: { status: 'pending' },
        },
      });

      // Start the transcription job
      await getAgenda().now(AGENDA_JOB_TYPES.TRANSCRIBE_WITH_SPEAKERS, {
        analysisId: callAnalysis._id.toString(),
      });

      return reply.send({
        id: callAnalysis._id.toString(),
        status: 'transcribing',
        product: callAnalysis.product,
      });
    },
  });

  /**
   * @method GET /call-analysis/:id/status
   * @description Get current status and results of call analysis
   */
  app.route({
    url: '/:id/status',
    method: 'GET',
    schema: {
      params: z.object({
        id: z.string(),
      }),
      response: {
        200: z.object({
          id: z.string(),
          status: z.string(),
          processingSteps: z.object({
            transcription: z.object({
              status: z.string().optional(),
              startedAt: z.string().optional(),
              completedAt: z.string().optional(),
              error: z.string().optional(),
            }),
            transcriptPIIRemoval: z.object({
              status: z.string().optional(),
              startedAt: z.string().optional(),
              completedAt: z.string().optional(),
              error: z.string().optional(),
            }),
            assessment: z.object({
              status: z.string().optional(),
              startedAt: z.string().optional(),
              completedAt: z.string().optional(),
              error: z.string().optional(),
            }),
            assessmentPIIRemoval: z.object({
              status: z.string().optional(),
              startedAt: z.string().optional(),
              completedAt: z.string().optional(),
              error: z.string().optional(),
            }),
            overview: z.object({
              status: z.string().optional(),
              startedAt: z.string().optional(),
              completedAt: z.string().optional(),
              error: z.string().optional(),
            }),
            overviewPIIRemoval: z.object({
              status: z.string().optional(),
              startedAt: z.string().optional(),
              completedAt: z.string().optional(),
              error: z.string().optional(),
            }),
          }),
          transcript: z
            .array(
              z.object({
                speaker: z.number(),
                role: z.string(),
                timestamp: z.number(),
                content: z.string(),
              }),
            )
            .optional(),
          assessment: z
            .object({
              summary: z.string(),
              suggestedNextSteps: z.array(z.string()),
              mandatory: z.array(
                z.object({
                  criteria: z.string(),
                  evaluation: z.string(),
                  score: z.number(),
                  maxScore: z.number(),
                  weight: z.number(),
                }),
              ),
              softSkills: z.array(
                z.object({
                  criteria: z.string(),
                  evaluation: z.string(),
                  score: z.number(),
                  maxScore: z.number(),
                  weight: z.number(),
                }),
              ),
              knowledgeApplication: z.array(
                z.object({
                  criteria: z.string(),
                  evaluation: z.string(),
                  score: z.number(),
                  maxScore: z.number(),
                  weight: z.number(),
                }),
              ),
            })
            .optional(),
          overview: z
            .object({
              keyTakeaways: z.array(z.string()),
              callHealth: z.object({
                positiveSignals: z.array(z.string()),
                risksObserved: z.array(z.string()),
                recommendations: z.array(z.string()),
              }),
              actionableNextSteps: z.object({
                keyActions: z.array(z.string()),
                nextCall: z.string(),
              }),
            })
            .optional(),
          error: z
            .object({
              step: z.string(),
              message: z.string(),
              timestamp: z.string(),
            })
            .optional(),
          completedAt: z.string().optional(),
          companyLogo: z
            .object({
              url: z.string().optional(),
              height: z.string().optional(),
            })
            .optional(),
          audioFileName: z.string(),
          createdAt: z.string(),
          updatedAt: z.string(),
          new: z.boolean().optional(),
          product: z.string().optional(),
          overallScore: z.number().optional(),
          msigAssessment: z
            .object({
              sections: z.record(
                z.object({
                  sectionType: z.string(),
                  sectionWeight: z.number(),
                  description: z.string(),
                  evaluations: z.array(
                    z.object({
                      criteriaId: z.string(),
                      criteriaText: z.string(),
                      pass: z.boolean(),
                      mandatory: z.boolean(),
                      evidence: z.string(),
                    }),
                  ),
                  notApplicable: z.boolean().optional(),
                  notApplicableReason: z.string().optional(),
                }),
              ),
              overallScore: z.number(),
              tier: z.string(),
              hasMandatoryFailures: z.boolean(),
              summary: z.string(),
              suggestedNextSteps: z.array(z.string()),
            })
            .optional(),
        }),
        404: z.object({
          error: z.string(),
        }),
      },
    },
    async handler(req, reply) {
      const { id } = req.params;

      // Guest users (PDF generation): allow access to any call analysis
      // Manage users (admin/superadmin): filter by company
      // Regular users: filter by user ID
      const isGuest = req.user?.isGuest || false;
      const manageRole = (req.user as any)?.role;
      const isManageUser = manageRole === 'superadmin' || manageRole === 'admin';
      let query: any;
      if (isGuest) {
        query = { _id: id };
      } else if (isManageUser) {
        query = { _id: id, company: req.user!.company };
      } else {
        query = { _id: id, user: req.user!._id };
      }

      const callAnalysis = await CallAnalysis.findOne(query)
        .populate('company', 'logoUrl logoHeight')
        .lean();

      if (!callAnalysis) {
        return reply.code(404).send({
          error: 'Call analysis not found',
        });
      }

      // Convert dates to ISO strings
      const processingSteps = {
        transcription: {
          status: callAnalysis.processingSteps.transcription?.status,
          startedAt:
            callAnalysis.processingSteps.transcription?.startedAt?.toISOString(),
          completedAt:
            callAnalysis.processingSteps.transcription?.completedAt?.toISOString(),
          error: callAnalysis.processingSteps.transcription?.error,
        },
        transcriptPIIRemoval: {
          status: callAnalysis.processingSteps.transcriptPIIRemoval?.status,
          startedAt:
            callAnalysis.processingSteps.transcriptPIIRemoval?.startedAt?.toISOString(),
          completedAt:
            callAnalysis.processingSteps.transcriptPIIRemoval?.completedAt?.toISOString(),
          error: callAnalysis.processingSteps.transcriptPIIRemoval?.error,
        },
        assessment: {
          status: callAnalysis.processingSteps.assessment?.status,
          startedAt:
            callAnalysis.processingSteps.assessment?.startedAt?.toISOString(),
          completedAt:
            callAnalysis.processingSteps.assessment?.completedAt?.toISOString(),
          error: callAnalysis.processingSteps.assessment?.error,
        },
        assessmentPIIRemoval: {
          status: callAnalysis.processingSteps.assessmentPIIRemoval?.status,
          startedAt:
            callAnalysis.processingSteps.assessmentPIIRemoval?.startedAt?.toISOString(),
          completedAt:
            callAnalysis.processingSteps.assessmentPIIRemoval?.completedAt?.toISOString(),
          error: callAnalysis.processingSteps.assessmentPIIRemoval?.error,
        },
        overview: {
          status: callAnalysis.processingSteps.overview?.status,
          startedAt:
            callAnalysis.processingSteps.overview?.startedAt?.toISOString(),
          completedAt:
            callAnalysis.processingSteps.overview?.completedAt?.toISOString(),
          error: callAnalysis.processingSteps.overview?.error,
        },
        overviewPIIRemoval: {
          status: callAnalysis.processingSteps.overviewPIIRemoval?.status,
          startedAt:
            callAnalysis.processingSteps.overviewPIIRemoval?.startedAt?.toISOString(),
          completedAt:
            callAnalysis.processingSteps.overviewPIIRemoval?.completedAt?.toISOString(),
          error: callAnalysis.processingSteps.overviewPIIRemoval?.error,
        },
      };

      // Extract audio file name from URL
      const audioFileName = callAnalysis.audioFileUrl
        ? callAnalysis.audioFileUrl.split('/').pop() || 'audio.mp3'
        : 'audio.mp3';

      // Return the analysis with only PII-removed data
      return reply.send({
        id: callAnalysis._id.toString(),
        status: callAnalysis.status,
        product: callAnalysis.product,
        overallScore: callAnalysis.overallScore,
        processingSteps,
        transcript: callAnalysis.transcript,
        assessment: callAnalysis.assessment,
        msigAssessment: callAnalysis.msigAssessment,
        overview: callAnalysis.overview,
        error: callAnalysis.error
          ? {
              step: callAnalysis.error.step,
              message: callAnalysis.error.message,
              timestamp: callAnalysis.error.timestamp.toISOString(),
            }
          : undefined,
        completedAt: callAnalysis.completedAt?.toISOString(),
        audioFileName,
        companyLogo: {
          url: (callAnalysis.company as unknown as ICompany)?.logoUrl,
          height: (callAnalysis.company as unknown as ICompany)?.logoHeight,
        },
        createdAt: callAnalysis.createdAt.toISOString(),
        updatedAt: callAnalysis.updatedAt.toISOString(),
        new: callAnalysis.new,
      });
    },
  });

  /**
   * @method PATCH /call-analysis/:id/mark-viewed
   * @description Mark a call analysis as viewed (set new flag to false)
   */
  app.route({
    url: '/:id/mark-viewed',
    method: 'PATCH',
    schema: {
      params: z.object({
        id: z.string(),
      }),
      response: {
        200: z.object({
          success: z.boolean(),
        }),
        404: z.object({
          error: z.string(),
        }),
      },
    },
    async handler(req, reply) {
      const { id } = req.params;

      // Update the CallAnalysis to set new to false
      const result = await CallAnalysis.findOneAndUpdate(
        {
          _id: id,
          user: req.user!._id,
        },
        {
          new: false,
        },
        { new: true },
      );

      if (!result) {
        return reply.code(404).send({
          error: 'Call analysis not found',
        });
      }

      return reply.send({
        success: true,
      });
    },
  });

  /**
   * @method POST /call-analysis/feedback
   * @description Submit feedback for a call analysis
   */
  app.route({
    url: '/feedback',
    method: 'POST',
    schema: {
      body: z.object({
        analysisId: z.string(),
        responses: z
          .array(
            z.object({
              question: z.string().min(1),
              answer: z.string().min(1),
            }),
          )
          .min(1),
      }),
      response: {
        200: z.object({
          success: z.boolean(),
        }),
      },
    },
    async handler(req, reply) {
      const { analysisId, responses } = req.body;
      const language = getLanguageHeader(req);

      await CallAnalysisFeedback.create({
        user: req.user!._id,
        callAnalysis: analysisId,
        responses,
        language,
      });

      const callAnalysis =
        await CallAnalysis.findById(analysisId).select('audioFileUrl');
      const company = await Company.findById(req.user?.company).select('name');

      await getAgenda().now('post-slack-report', {
        type: SLACK_REPORT_TYPES.CALL_ANALYSIS_FEEDBACK_SUBMITTED,
        payload: {
          channel: SLACK_FEEDBACK_CHANNEL_ID,
          user: req.user,
          company,
          responses,
          audioFileName: callAnalysis?.audioFileUrl
            ? callAnalysis.audioFileUrl.split('/').pop() || 'audio.mp3'
            : 'audio.mp3',
          language,
        },
      });

      return reply.send({ success: true });
    },
  });

  // Register report sub-routes
  await app.register(import('./report.js'));

  /**
   * @method GET /call-analysis
   * @description List all call analyses for the current user
   */
  app.route({
    url: '/',
    method: 'GET',
    schema: {
      querystring: z.object({
        limit: z.coerce.number().min(1).max(100).default(10),
        offset: z.coerce.number().min(0).default(0),
      }),
      response: {
        200: z.object({
          analyses: z.array(
            z.object({
              id: z.string(),
              status: z.string(),
              product: z.string().optional(),
              audioFileName: z.string(),
              createdAt: z.string(),
              completedAt: z.string().optional(),
            }),
          ),
          total: z.number(),
        }),
      },
    },
    async handler(req, reply) {
      const { limit, offset } = req.query;

      const [analyses, total] = await Promise.all([
        CallAnalysis.find({
          user: req.user!._id,
        })
          .select('_id status audioFileUrl createdAt completedAt product')
          .sort({ createdAt: -1 })
          .limit(limit)
          .skip(offset)
          .lean(),
        CallAnalysis.countDocuments({
          user: req.user!._id,
        }),
      ]);

      return reply.send({
        analyses: analyses.map((analysis) => ({
          id: analysis._id.toString(),
          status: analysis.status,
          product: analysis.product,
          audioFileName: analysis.audioFileUrl
            ? analysis.audioFileUrl.split('/').pop() || 'audio.mp3'
            : 'audio.mp3',
          createdAt: analysis.createdAt.toISOString(),
          completedAt: analysis.completedAt?.toISOString(),
        })),
        total,
      });
    },
  });

  app.log.info('[call-analysis/index.ts] routes registered');
};

export default router;
