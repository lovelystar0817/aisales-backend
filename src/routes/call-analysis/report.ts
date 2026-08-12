import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { CallAnalysis } from '../../models/CallAnalysis.js';
import { setupUniversalAuthWithManage } from '../../middleware/conditionalAuth.js';
import { generateCallAnalysisPdf } from '../../utils/pdf/generateCallAnalysisPdf.js';

const router: FastifyPluginAsyncZod = async (app) => {
  setupUniversalAuthWithManage(app);

  app.route({
    url: '/report',
    method: 'GET',
    schema: {
      querystring: z.object({
        analysisId: z.string(),
      }),
      response: {
        200: z.any(), // PDF binary data
        400: z.object({
          error: z.string(),
        }),
        404: z.object({
          error: z.string(),
        }),
        500: z.object({
          error: z.string(),
        }),
      },
    },
    handler: async (request, reply) => {
      const { analysisId } = request.query;

      try {
        // Verify the call analysis exists and belongs to the user/company
        const manageRole = (request.user as any)?.role;
        const isManageUser = manageRole === 'superadmin' || manageRole === 'admin';
        const query = isManageUser
          ? { _id: analysisId, company: request.user!.company }
          : { _id: analysisId, user: request.user!._id };
        const callAnalysis = await CallAnalysis.findOne(query).lean();

        if (!callAnalysis) {
          return reply.code(404).send({
            error: 'Call analysis not found',
          });
        }

        // Check if assessment is completed
        if (!callAnalysis.assessment && !callAnalysis.msigAssessment) {
          return reply.code(400).send({
            error: 'Assessment not yet completed',
          });
        }

        // Generate PDF using utility function
        const pdfBuffer = await generateCallAnalysisPdf(analysisId, request);

        // Extract audio file name for PDF filename
        const audioFileName = callAnalysis.audioFileUrl
          ? callAnalysis.audioFileUrl
              .split('/')
              .pop()
              ?.replace(/\.[^/.]+$/, '') || 'call-analysis'
          : 'call-analysis';

        return reply
          .header('Content-Type', 'application/pdf')
          .header(
            'Content-Disposition',
            `attachment; filename="${audioFileName}-assessment.pdf"`,
          )
          .send(pdfBuffer);
      } catch (error: unknown) {
        console.error('PDF generation error:', error);

        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        return reply.status(500).send({
          error: `Failed to generate PDF: ${errorMessage}`,
        });
      }
    },
  });
};

export default router;
