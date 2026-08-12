import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { Types } from 'mongoose';
import { SalesSession } from '../../models/SalesSession.js';
import { parseHSBCFeedbackScores } from '../../utils/manage/hsbc.js';

const router: FastifyPluginAsyncZod = async (app, _opts) => {
  /**
   * Middleware to check if the user is authenticated
   */
  app.use(app.checkAuth0JWT);
  app.addHook('preHandler', app.authenticateManage);

  /**
   * @method GET /manage/leaderboard
   * @description Get today's leaderboard entries for the company (HSBC only)
   */
  app.get('/', {
    async handler(req, reply) {
      try {
        const companyId = req.user!.company!.toString();

        // Get start of today in SGT (UTC+8)
        const now = new Date();
        const SGT_OFFSET = 8 * 60 * 60 * 1000; // 8 hours in milliseconds

        // Get current time in SGT by adding 8 hours to UTC
        const nowInSgt = new Date(now.getTime() + SGT_OFFSET);

        // Get start of day in SGT using UTC methods
        const startOfDayInSgt = Date.UTC(
          nowInSgt.getUTCFullYear(),
          nowInSgt.getUTCMonth(),
          nowInSgt.getUTCDate(),
          0,
          0,
          0,
          0,
        );

        // Convert back to UTC for database query (subtract 8 hours)
        const startOfDaySGT = new Date(startOfDayInSgt - SGT_OFFSET);

        // Simplified aggregation: fetch sessions and calculate scores in JS
        const sessions = await SalesSession.aggregate([
          // Stage 1: Match completed HSBC sessions from today
          {
            $match: {
              assessmentType: 'hsbc',
              startedAt: { $gte: startOfDaySGT },
              endedAt: { $exists: true, $ne: null },
              'roleplay.feedback.relationshipManagement': {
                $exists: true,
                $ne: null,
              },
              'roleplay.feedback.processAdherence': {
                $exists: true,
                $ne: null,
              },
              'roleplay.feedback.representation': {
                $exists: true,
                $ne: null,
              },
              'roleplay.feedback.communicationAndPresence': {
                $exists: true,
                $ne: null,
              },
            },
          },
          // Stage 2: Lookup user to filter by company
          {
            $lookup: {
              from: 'users',
              localField: 'user',
              foreignField: '_id',
              as: 'userData',
            },
          },
          // Stage 3: Unwind user data
          {
            $unwind: {
              path: '$userData',
              preserveNullAndEmptyArrays: false,
            },
          },
          // Stage 4: Filter by company and exclude testers
          {
            $match: {
              'userData.company': new Types.ObjectId(companyId),
              'userData.isTester': { $ne: true },
            },
          },
          // Stage 5: Project needed fields
          {
            $project: {
              _id: 1,
              user: 1,
              persona: 1,
              product: 1,
              roleplay: 1,
              userData: {
                name: 1,
                _id: 1,
              },
            },
          },
        ]);

        req.log.info(
          { totalSessions: sessions.length },
          'Sessions fetched, calculating scores in JS',
        );

        // Parse scores and calculate leaderboard in JavaScript
        const sessionsWithScores = sessions
          .map((session) => {
            const scoreData = parseHSBCFeedbackScores(session);

            // Skip sessions without valid scores
            if (!scoreData.isValid || !scoreData.overallScore) {
              return null;
            }

            return {
              sessionId: session._id.toString(),
              userId: session.user.toString(),
              name: session.userData.name,
              score: Math.round(scoreData.overallScore),
              personaName: session.persona?.name || 'Unknown',
              scenarioName: session.roleplay?.title || session.product?.name,
              rawScore: scoreData.overallScore,
            };
          })
          .filter(
            (entry): entry is NonNullable<typeof entry> => entry !== null,
          );

        // Group by userId and keep highest score per user
        const userBestScores = new Map<
          string,
          (typeof sessionsWithScores)[0]
        >();
        for (const entry of sessionsWithScores) {
          const existing = userBestScores.get(entry.userId);
          if (!existing || entry.rawScore > existing.rawScore) {
            userBestScores.set(entry.userId, entry);
          }
        }

        // Convert to array and sort by score descending
        const leaderboardEntries = Array.from(userBestScores.values())
          .sort((a, b) => b.score - a.score)
          .map(({ rawScore, ...entry }) => ({
            id: entry.sessionId,
            ...entry,
          }));

        return reply.send({
          success: true,
          entries: leaderboardEntries,
          metadata: {
            totalEntries: leaderboardEntries.length,
            lastUpdated: new Date().toISOString(),
          },
        });
      } catch (error) {
        req.log.error({ err: error }, 'Error fetching leaderboard:');
        return reply.status(500).send({
          success: false,
          entries: [],
          metadata: {
            totalEntries: 0,
            lastUpdated: new Date().toISOString(),
          },
          error: 'Failed to fetch leaderboard',
        });
      }
    },
  });

  app.log.info('[manage/leaderboard.ts] router registered');
};

export default router;
