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
  app.addHook('preHandler', async (request, reply) => {
    await ensureAdmin(app, request);
  });

  /**
   * @method DELETE /admin/delete-user
   * @description Delete a user and all their associated data by email.
   *              Supports dry run mode to preview what will be deleted.
   * @auth Requires admin-secret header
   */
  app.delete('/', {
    schema: {
      body: z.object({
        email: z.string().email(),
        dryRun: z.boolean().default(true),
      }),
    },
    async handler(req, reply) {
      const { email, dryRun } = req.body;

      try {
        const user = await User.findOne({ email }).lean();

        if (!user) {
          return reply.status(404).send({
            error: 'No user found with the provided email',
            email,
          });
        }

        const userId = user._id;

        // Collect counts of all related data
        const sessions = await SalesSession.find({
          user: userId,
        }).select('messages');
        const messageIds = sessions.flatMap((session) => session.messages);

        const counts = {
          user: 1,
          salesSessions: sessions.length,
          messages: messageIds.length,
          callAnalyses: await CallAnalysis.countDocuments({ user: userId }),
          userStandings: await UserStanding.countDocuments({ user: userId }),
          userModuleAccess: await UserModuleAccess.countDocuments({
            userId: userId,
          }),
          salesFeedback: await SalesFeedback.countDocuments({ user: userId }),
          callAnalysisFeedback: await CallAnalysisFeedback.countDocuments({
            user: userId,
          }),
          issueReports: await IssueReport.countDocuments({
            reporter: userId,
            reporterType: 'user',
          }),
        };

        const totalEntries = Object.values(counts).reduce((a, b) => a + b, 0);

        app.log.info(
          `[delete-user] ${dryRun ? 'DRY RUN' : 'LIVE DELETE'} for ${email}`,
        );
        app.log.info(`[delete-user] User ID: ${userId}`);
        app.log.info(`[delete-user] Entries to be deleted:`);
        for (const [key, count] of Object.entries(counts)) {
          if (count > 0) {
            app.log.info(`[delete-user]   ${key}: ${count}`);
          }
        }
        app.log.info(`[delete-user] Total entries: ${totalEntries}`);

        if (dryRun) {
          return reply.send({
            success: true,
            dryRun: true,
            message:
              'Dry run complete. No data was deleted. Set dryRun to false to execute.',
            email,
            userId: userId.toString(),
            counts,
            totalEntries,
          });
        }

        // Actually delete everything
        const deleted = {
          salesSessions: 0,
          messages: 0,
          callAnalyses: 0,
          userStandings: 0,
          userModuleAccess: 0,
          salesFeedback: 0,
          callAnalysisFeedback: 0,
          issueReports: 0,
          user: 0,
        };

        deleted.salesSessions =
          (await SalesSession.deleteMany({ user: userId })).deletedCount || 0;

        deleted.messages =
          (await Message.deleteMany({ _id: { $in: messageIds } }))
            .deletedCount || 0;

        deleted.callAnalyses =
          (await CallAnalysis.deleteMany({ user: userId })).deletedCount || 0;

        deleted.userStandings =
          (await UserStanding.deleteMany({ user: userId })).deletedCount || 0;

        deleted.userModuleAccess =
          (await UserModuleAccess.deleteMany({ userId: userId }))
            .deletedCount || 0;

        deleted.salesFeedback =
          (await SalesFeedback.deleteMany({ user: userId })).deletedCount || 0;

        deleted.callAnalysisFeedback =
          (await CallAnalysisFeedback.deleteMany({ user: userId }))
            .deletedCount || 0;

        deleted.issueReports =
          (
            await IssueReport.deleteMany({
              reporter: userId,
              reporterType: 'user',
            })
          ).deletedCount || 0;

        deleted.user =
          (await User.deleteOne({ _id: userId })).deletedCount || 0;

        app.log.info(`[delete-user] Deletion complete for ${email}`);
        for (const [key, count] of Object.entries(deleted)) {
          if (count > 0) {
            app.log.info(`[delete-user]   deleted ${key}: ${count}`);
          }
        }

        return reply.send({
          success: true,
          dryRun: false,
          message: 'User and all associated data deleted successfully',
          email,
          userId: userId.toString(),
          deleted,
        });
      } catch (error) {
        req.log.error({ err: error }, 'Error during user deletion:');
        return reply.status(500).send({
          error: 'Failed to delete user',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    },
  });
};

export default router;
