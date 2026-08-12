import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { ensureAdmin } from '../../utils/adminutil.js';
import { User } from '../../models/User.js';
import { SalesSession } from '../../models/SalesSession.js';
import { CallAnalysis } from '../../models/CallAnalysis.js';
import { UserStanding } from '../../models/UserStanding.js';
import { UserModuleAccess } from '../../models/UserModuleAccess.js';
import { SalesFeedback } from '../../models/SalesFeedback.js';
import { CallAnalysisFeedback } from '../../models/CallAnalysisFeedback.js';
import { IssueReport } from '../../models/IssueReport.js';
import { Message } from '../../models/Message.js';

const router: FastifyPluginAsyncZod = async (app, _opts) => {
  // Admin authentication hook
  app.addHook('preHandler', async (request, reply) => {
    await ensureAdmin(app, request);
  });

  /**
   * @method POST /admin/wipe-users-usage
   * @description Wipe all usage data for users by email addresses, allowing them to start afresh
   * @auth Requires admin-secret header
   */
  app.post('/', {
    schema: {
      body: z.object({
        emails: z
          .array(z.string().email())
          .min(1, 'At least one email is required')
          .max(100, 'Maximum 100 emails per request'),
      }),
    },
    async handler(req, reply) {
      const { emails } = req.body;

      try {
        app.log.info(`Starting usage data wipe for ${emails.length} emails`);

        // Find all users matching the provided emails
        const users = await User.find({
          email: { $in: emails },
        }).lean();

        if (users.length === 0) {
          return reply.status(404).send({
            error: 'No users found with the provided emails',
            providedEmails: emails,
          });
        }

        app.log.info(`Found ${users.length} users to wipe usage data`);

        const userIds = users.map((user) => user._id);

        // Results tracking
        const results = {
          totalRequested: emails.length,
          usersFound: users.length,
          wipedSummary: {
            salesSessions: 0,
            messages: 0,
            callAnalyses: 0,
            userStandings: 0,
            userModuleAccess: 0,
            salesFeedback: 0,
            callAnalysisFeedback: 0,
            issueReports: 0,
          },
          errors: [] as string[],
        };

        // Step 1: Wipe all associated usage data
        app.log.info('Collecting message IDs from SalesSessions...');
        const sessions = await SalesSession.find({
          user: { $in: userIds },
        }).select('messages');

        const messageIds = sessions.flatMap((session) => session.messages);

        app.log.info('Wiping SalesSession records...');
        const sessionResult = await SalesSession.deleteMany({
          user: { $in: userIds },
        });
        results.wipedSummary.salesSessions = sessionResult.deletedCount || 0;

        app.log.info(`Wiping ${messageIds.length} Message records...`);
        const messageResult = await Message.deleteMany({
          _id: { $in: messageIds },
        });
        results.wipedSummary.messages = messageResult.deletedCount || 0;

        app.log.info('Wiping CallAnalysis records...');
        const callAnalysisResult = await CallAnalysis.deleteMany({
          user: { $in: userIds },
        });
        results.wipedSummary.callAnalyses =
          callAnalysisResult.deletedCount || 0;

        app.log.info('Wiping UserStanding records...');
        const standingResult = await UserStanding.deleteMany({
          user: { $in: userIds },
        });
        results.wipedSummary.userStandings = standingResult.deletedCount || 0;

        app.log.info('Wiping UserModuleAccess records...');
        const moduleAccessResult = await UserModuleAccess.deleteMany({
          userId: { $in: userIds },
        });
        results.wipedSummary.userModuleAccess =
          moduleAccessResult.deletedCount || 0;

        app.log.info('Wiping SalesFeedback records...');
        const salesFeedbackResult = await SalesFeedback.deleteMany({
          user: { $in: userIds },
        });
        results.wipedSummary.salesFeedback =
          salesFeedbackResult.deletedCount || 0;

        app.log.info('Wiping CallAnalysisFeedback records...');
        const callFeedbackResult = await CallAnalysisFeedback.deleteMany({
          user: { $in: userIds },
        });
        results.wipedSummary.callAnalysisFeedback =
          callFeedbackResult.deletedCount || 0;

        app.log.info('Wiping IssueReport records...');
        const issueReportResult = await IssueReport.deleteMany({
          reporter: { $in: userIds },
          reporterType: 'user',
        });
        results.wipedSummary.issueReports = issueReportResult.deletedCount || 0;

        // Step 2: Reset user flags (isTester and isDeleted)
        app.log.info('Resetting user flags (isTester, isDeleted)...');
        await User.updateMany(
          { _id: { $in: userIds } },
          {
            $set: {
              isTester: false,
              isDeleted: false,
            },
          },
        );

        app.log.info('Usage data wipe completed successfully');

        return reply.send({
          success: true,
          message: 'Usage data wipe completed - users can start afresh',
          results,
        });
      } catch (error) {
        req.log.error({ err: error }, 'Error during usage data wipe:');
        return reply.status(500).send({
          error: 'Failed to wipe usage data',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    },
  });
};

export default router;
