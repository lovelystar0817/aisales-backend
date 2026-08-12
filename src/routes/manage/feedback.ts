import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { SalesFeedback } from '../../models/SalesFeedback.js';
import { getUserIdsForCompany } from '../../utils/manage/shared.js';

const POST_PRACTICE_QUESTION =
  'Do you feel more prepared to engage with real prospects after this roleplay?';

const router: FastifyPluginAsyncZod = async (app, _opts) => {
  // Auth: reuse manage auth like other routes
  app.use(app.checkAuth0JWT);
  app.addHook('preHandler', app.authenticateManage);

  /**
   * @method GET /manage/feedback/survey
   * @description Returns aggregated post-practice survey results and a paginated list
   */
  app.get('/survey', {
    schema: {
      querystring: z.object({
        page: z.coerce.number().optional().default(1),
        limit: z.coerce.number().optional().default(5),
        teams: z
          .union([z.string(), z.array(z.string())])
          .optional()
          .transform((teams) => {
            if (!teams) return undefined;
            const teamArray = Array.isArray(teams) ? teams : teams.split(',');
            const filtered = teamArray.filter(
              (team) => team && team.trim() !== '' && team !== 'all',
            );
            return filtered.length > 0 ? filtered : undefined;
          }),
      }),
    },
    async handler(req, reply) {
      try {
        const companyId = req.user!.company!.toString();
        const { page, limit, teams } = req.query;

        const userIds = await getUserIdsForCompany(companyId, teams);

        if (!userIds || userIds.length === 0) {
          return reply.send({
            question: POST_PRACTICE_QUESTION,
            summary: { yes: 0, no: 0, total: 0, yesPercent: 0, noPercent: 0 },
            entries: [],
            pagination: {
              currentPage: page,
              totalPages: 0,
              total: 0,
              limit,
              hasNextPage: false,
              hasPrevPage: false,
            },
          });
        }

        const baseMatch = {
          user: { $in: userIds },
          responses: { $elemMatch: { question: POST_PRACTICE_QUESTION } },
        } as any;

        // Aggregated yes/no counts
        const counts = await SalesFeedback.aggregate([
          { $match: { user: { $in: userIds } } },
          { $unwind: '$responses' },
          { $match: { 'responses.question': POST_PRACTICE_QUESTION } },
          { $group: { _id: '$responses.answer', count: { $sum: 1 } } },
        ]);

        const yesCount = counts.find((c: any) => c._id === 'Yes')?.count || 0;
        const noCount = counts.find((c: any) => c._id === 'No')?.count || 0;
        const total = yesCount + noCount;

        // Pagination
        const totalDocuments = await SalesFeedback.countDocuments(baseMatch);
        const totalPages = Math.ceil(totalDocuments / limit);
        const skip = (page - 1) * limit;

        const items = await SalesFeedback.find(baseMatch)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate('user', 'email')
          .select('responses createdAt user language')
          .lean();

        const entries = items.map((item: any) => {
          const yesNo = item.responses.find(
            (r: any) => r.question === POST_PRACTICE_QUESTION,
          );
          const reason = item.responses.find(
            (r: any) => r.question.toLowerCase() === 'reason',
          );
          return {
            user: item.user?.email || '',
            answer: yesNo?.answer || '',
            reason: reason?.answer || '',
            language: item.language || '',
            createdAt: item.createdAt,
          };
        });

        return reply.send({
          question: POST_PRACTICE_QUESTION,
          summary: {
            yes: yesCount,
            no: noCount,
            total,
            yesPercent: total > 0 ? Math.round((yesCount / total) * 100) : 0,
            noPercent: total > 0 ? Math.round((noCount / total) * 100) : 0,
          },
          entries,
          pagination: {
            currentPage: page,
            totalPages,
            total: totalDocuments,
            limit,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
          },
        });
      } catch (error) {
        req.log.error({ err: error }, 'Error fetching survey results:');
        return reply.status(500).send({ error: 'Failed to fetch survey data' });
      }
    },
  });
};

export default router;
