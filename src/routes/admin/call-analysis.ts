import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import archiver from 'archiver';
import { CallAnalysis } from '../../models/CallAnalysis.js';
import { S3 } from '../../libs/s3.js';
import { ensureAdmin } from '../../utils/adminutil.js';
import { generateCallAnalysisPdf } from '../../utils/pdf/generateCallAnalysisPdf.js';

const router: FastifyPluginAsyncZod = async (app, _opts) => {
  // Admin authentication hook
  app.addHook('preHandler', async (request, reply) => {
    await ensureAdmin(app, request);
  });

  /**
   * @method POST /admin/call-analysis/download
   * @description Download audio file from S3 for a given CallAnalysis ID
   * @auth Requires admin-secret header
   */
  app.post('/download', {
    schema: {
      body: z.object({
        callAnalysisId: z.string().length(24, 'Invalid CallAnalysis ID'),
      }),
    },
    async handler(req, reply) {
      try {
        const { callAnalysisId } = req.body;

        // Find the CallAnalysis record
        const callAnalysis = await CallAnalysis.findById(callAnalysisId);

        if (!callAnalysis) {
          return reply.status(404).send({
            error: 'CallAnalysis not found',
            callAnalysisId,
          });
        }

        // Extract S3 key from audioFileUrl
        // URL format: https://{bucket}.s3.{region}.amazonaws.com/{key}
        const audioFileUrl = callAnalysis.audioFileUrl;
        const urlParts = audioFileUrl.split('.amazonaws.com/');

        if (urlParts.length !== 2) {
          return reply.status(400).send({
            error: 'Invalid audioFileUrl format',
            url: audioFileUrl,
          });
        }

        const s3Key = urlParts[1];

        app.log.info(`Downloading file from S3: ${s3Key}`);

        // Download file from S3
        const fileBuffer = await S3.getFileBuffer(s3Key);

        // Extract filename from S3 key (last part of the path)
        const fileName = s3Key.split('/').pop() || 'audio.mp3';

        // Set response headers for file download
        reply.header('Content-Type', 'audio/mpeg');
        reply.header(
          'Content-Disposition',
          `attachment; filename="${fileName}"`,
        );
        reply.header('Content-Length', fileBuffer.length);

        return reply.send(fileBuffer);
      } catch (error) {
        req.log.error(
          { err: error },
          'Error downloading CallAnalysis audio file:',
        );
        return reply.status(500).send({
          error: 'Failed to download audio file',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    },
  });

  /**
   * @method POST /api/admin/call-analysis/download-all-pdfs
   * @description Download all CallAnalysis PDFs as a zip file (excluding @hupo.co users)
   * @auth Requires admin-secret header
   */
  app.post('/download-all-pdfs', {
    config: {
      timeout: 600000, // 10 minutes
    },
    schema: {
      body: z.object({
        limit: z.number().int().positive().max(500).optional().default(100),
      }),
    },
    async handler(req, reply) {
      const { limit } = req.body;

      try {
        app.log.info(`Starting bulk PDF download with limit: ${limit}`);

        // Query CallAnalysis records with completed assessments
        const callAnalyses = await CallAnalysis.find({
          status: 'completed',
          assessment: { $exists: true },
        })
          .populate<{ user: { _id: string; email: string; name: string } }>(
            'user',
            'email name',
          )
          .limit(limit)
          .sort({ createdAt: -1 })
          .lean();

        app.log.info(`Found ${callAnalyses.length} completed call analyses`);

        // Filter out @hupo.co users
        const filteredAnalyses = callAnalyses.filter(
          (analysis) =>
            analysis.user && !analysis.user.email.endsWith('@hupo.co'),
        );

        app.log.info(
          `After filtering @hupo.co: ${filteredAnalyses.length} analyses`,
        );

        if (filteredAnalyses.length === 0) {
          return reply.status(404).send({
            error: 'No CallAnalysis records found (excluding @hupo.co users)',
            totalFound: callAnalyses.length,
            afterFilter: 0,
          });
        }

        // Create zip archive
        const archive = archiver('zip', {
          zlib: { level: 6 }, // Compression level
        });

        // Set response headers
        reply.header('Content-Type', 'application/zip');
        reply.header(
          'Content-Disposition',
          `attachment; filename="call-analysis-reports-${new Date().toISOString().split('T')[0]}.zip"`,
        );

        // Pipe archive to response
        archive.pipe(reply.raw);

        // Handle archive errors
        archive.on('error', (err) => {
          app.log.error({ err }, 'Archive error:');
          throw err;
        });

        // Generate PDFs and add to archive
        for (let i = 0; i < filteredAnalyses.length; i++) {
          const analysis = filteredAnalyses[i];
          const analysisId = analysis._id.toString();

          try {
            app.log.info(
              `Generating PDF ${i + 1}/${filteredAnalyses.length}: ${analysisId}`,
            );

            // Generate PDF using utility function
            const pdfBuffer = await generateCallAnalysisPdf(analysisId);

            // Extract filename from audio URL
            const audioFileName = analysis.audioFileUrl
              ? analysis.audioFileUrl
                  .split('/')
                  .pop()
                  ?.replace(/\.[^/.]+$/, '') || `analysis-${analysisId}`
              : `analysis-${analysisId}`;

            // Sanitize filename
            const sanitizedFileName = audioFileName.replace(
              /[^a-z0-9_-]/gi,
              '_',
            );
            const pdfFileName = `${sanitizedFileName}-${analysisId}.pdf`;

            // Add PDF to archive
            archive.append(pdfBuffer, { name: pdfFileName });

            app.log.info(`Added PDF to archive: ${pdfFileName}`);
          } catch (error) {
            app.log.error(
              { err: error },
              `Failed to generate PDF for analysis ${analysisId}:`,
            );
            // Continue with next PDF even if one fails
          }
        }

        // Finalize archive (this triggers the stream to end)
        await archive.finalize();

        app.log.info('Archive finalized successfully');
      } catch (error) {
        req.log.error({ err: error }, 'Bulk PDF download error:');
        return reply.status(500).send({
          error: 'Failed to generate bulk PDFs',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    },
  });
};

export default router;
