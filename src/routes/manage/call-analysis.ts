import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import mongoose from 'mongoose';
import { CallAnalysis } from '../../models/CallAnalysis.js';
import { User } from '../../models/User.js';


const router: FastifyPluginAsyncZod = async (app, _opts) => {
  app.use(app.checkAuth0JWT);
  app.addHook('preHandler', app.authenticateManage);

  /**
   * @method GET /manage/call-analysis
   * @description Get paginated list of call analyses for the company
   */
  app.get('/', {
    schema: {
      querystring: z.object({
        page: z.coerce.number().optional().default(1),
        limit: z.coerce.number().optional().default(10),
        product: z.string().optional(),
        search: z.string().optional(),
        status: z.enum(['completed', 'failed', 'processing']).optional(),
        sortBy: z.enum(['createdAt', 'overallScore']).optional().default('createdAt'),
        sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
      }),
    },
    async handler(req, reply) {
      const { page, limit, product, search, status, sortBy, sortOrder } = req.query;
      const companyId = req.user!.company!.toString();

      // Build filter
      const filter: any = { company: companyId };
      const andConditions: any[] = [];

      // Product filter (supports comma-separated values, e.g. ?product=traveleasy,dentiplus)
      if (product) {
        const products = product.split(',').map((p) => p.trim());
        const includesTravelEasy = products.includes('traveleasy');

        if (products.length === 1 && !includesTravelEasy) {
          filter.product = products[0];
        } else {
          const productConditions = products
            .filter((p) => p !== 'traveleasy')
            .map((p) => ({ product: p }));

          if (includesTravelEasy) {
            productConditions.push(
              { product: 'traveleasy' } as any,
              { product: { $exists: false } } as any,
            );
          }

          andConditions.push({ $or: productConditions });
        }
      }

      // Status filter
      if (status) {
        if (status === 'processing') {
          filter.status = { $in: ['uploading', 'transcribing', 'processing'] };
        } else {
          filter.status = status;
        }
      }

      // Search filter (by file name or uploader email)
      if (search) {
        const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        // Find users matching the search email/name
        const matchingUsers = await User.find({
          company: companyId,
          $or: [
            { email: { $regex: escapedSearch, $options: 'i' } },
            { name: { $regex: escapedSearch, $options: 'i' } },
          ],
        })
          .select('_id')
          .lean();

        const matchingUserIds = matchingUsers.map((u) => u._id);

        andConditions.push({
          $or: [
            { audioFileUrl: { $regex: escapedSearch, $options: 'i' } },
            { user: { $in: matchingUserIds } },
          ],
        });
      }

      if (andConditions.length > 0) {
        filter.$and = andConditions;
      }

      // Count total for pagination
      const total = await CallAnalysis.countDocuments(filter);
      const totalPages = Math.ceil(total / limit);
      const skip = (page - 1) * limit;

      // Fetch records
      const records = await CallAnalysis.find(filter)
        .select({
          _id: 1,
          createdAt: 1,
          product: 1,
          audioFileUrl: 1,
          status: 1,
          overallScore: 1,
          msigAssessment: 1,
          user: 1,
          transcript: { $slice: -1 },
          rawTranscript: { $slice: -1 },
        })
        .populate('user', 'email name')
        .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const analyses = records.map((record) => {
        // Extract file name from S3 URL
        const fileName =
          record.audioFileUrl?.split('/').pop()?.replace(/%20/g, ' ') ||
          'Unknown';

        // Duration from last transcript segment timestamp (in seconds)
        const transcript = record.transcript || record.rawTranscript;
        const duration =
          transcript && transcript.length > 0
            ? transcript[transcript.length - 1].timestamp
            : null;

        const hasMandatoryFailures =
          record.msigAssessment?.hasMandatoryFailures ?? false;
        const score = hasMandatoryFailures ? null : (record.overallScore ?? null);
        const tier = hasMandatoryFailures
          ? 'Fail'
          : (record.msigAssessment?.tier ?? null);

        // Determine product (old records don't have product field)
        const productType = record.product || 'traveleasy';

        const user = record.user as any;

        return {
          id: record._id.toString(),
          analyzedOn: record.createdAt.toISOString(),
          product: productType,
          fileName,
          score,
          tier,
          duration,
          status: record.status,
          uploadedBy: user
            ? {
                id: user._id.toString(),
                email: user.email || '',
                name: user.name || '',
              }
            : null,
        };
      });

      return reply.send({
        analyses,
        pagination: {
          currentPage: page,
          totalPages,
          total,
          limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      });
    },
  });
  /**
   * @method GET /manage/call-analysis/summary
   * @description Get call analysis summary with totals, per-product breakdown, and score bands
   */
  app.get('/summary', {
    async handler(req, reply) {
      const companyId = new mongoose.Types.ObjectId(
        req.user!.company!.toString(),
      );

      // Aggregation: totals and per-product breakdown
      const productStats = await CallAnalysis.aggregate([
        { $match: { company: companyId } },
        {
          $group: {
            _id: { $ifNull: ['$product', 'traveleasy'] },
            totalUploaded: { $sum: 1 },
            totalAnalysed: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
            },
            totalScore: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $eq: ['$status', 'completed'] },
                      { $gt: ['$overallScore', null] },
                      { $ne: ['$msigAssessment.hasMandatoryFailures', true] },
                    ],
                  },
                  '$overallScore',
                  0,
                ],
              },
            },
            scoredCount: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $eq: ['$status', 'completed'] },
                      { $gt: ['$overallScore', null] },
                      { $ne: ['$msigAssessment.hasMandatoryFailures', true] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
            noResultCount: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $eq: ['$status', 'completed'] },
                      { $eq: ['$msigAssessment.hasMandatoryFailures', true] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ]);

      // Fetch completed scores for band breakdown, excluding mandatory failures
      const completedScores = await CallAnalysis.find(
        {
          company: companyId,
          status: 'completed',
          overallScore: { $exists: true, $ne: null },
          'msigAssessment.hasMandatoryFailures': { $ne: true },
        },
        { product: 1, overallScore: 1 },
      ).lean();

      // Product-specific band definitions
      const travelEasyBands = [
        { level: 'L1', label: 'Unsatisfactory', min: 0, max: 75 },
        { level: 'L2', label: 'Developing', min: 75, max: 80 },
        { level: 'L3', label: 'Good', min: 80, max: 85 },
        { level: 'L4', label: 'Excellent', min: 85, max: 95 },
        { level: 'L5', label: 'Exceptional', min: 95, max: Infinity },
      ];

      const msigBands = [
        { level: 'L1', label: 'Fail', min: 0, max: 85 },
        { level: 'L2', label: 'Pass', min: 85, max: 90 },
        { level: 'L3', label: 'Good', min: 90, max: 95 },
        { level: 'L4', label: 'Excellent', min: 95, max: Infinity },
      ];

      function getBandsForProduct(productId: string) {
        return productId === 'parecoveryplus' || productId === 'dentiplus'
          ? msigBands
          : travelEasyBands;
      }

      // Group scores by product, then bucket into bands
      const scoresByProduct: Record<string, number[]> = {};
      for (const record of completedScores) {
        const prod = record.product || 'traveleasy';
        if (!scoresByProduct[prod]) scoresByProduct[prod] = [];
        scoresByProduct[prod].push(record.overallScore!);
      }

      function buildBandStats(productId: string, scores: number[]) {
        const bands = getBandsForProduct(productId);
        return bands.map((band) => {
          const inBand = scores.filter((s) => s >= band.min && s < band.max);
          return {
            level: band.level,
            label: band.label,
            count: inBand.length,
            averageScore:
              inBand.length > 0
                ? Math.round(inBand.reduce((a, b) => a + b, 0) / inBand.length)
                : null,
          };
        });
      }

      // Build response
      let grandTotalUploaded = 0;
      let grandTotalAnalysed = 0;
      let grandTotalScore = 0;
      let grandScoredCount = 0;

      const byProduct = productStats.map((p) => {
        grandTotalUploaded += p.totalUploaded;
        grandTotalAnalysed += p.totalAnalysed;
        grandTotalScore += p.totalScore;
        grandScoredCount += p.scoredCount;

        const scores = scoresByProduct[p._id] || [];

        return {
          product: p._id,
          totalUploaded: p.totalUploaded,
          totalAnalysed: p.totalAnalysed,
          averageScore:
            p.scoredCount > 0 ? Math.round(p.totalScore / p.scoredCount) : null,
          bands: buildBandStats(p._id, scores),
          noResultCount: p.noResultCount,
        };
      });

      return reply.send({
        totals: {
          totalUploaded: grandTotalUploaded,
          totalAnalysed: grandTotalAnalysed,
          averageScore:
            grandScoredCount > 0
              ? Math.round(grandTotalScore / grandScoredCount)
              : null,
        },
        byProduct,
      });
    },
  });
};

export default router;
