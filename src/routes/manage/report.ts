import ExcelJS from 'exceljs';
import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { SalesSession } from '../../models/SalesSession.js';
import { Team } from '../../models/Team.js';
import { IUser, User } from '../../models/User.js';
import { IUserStanding } from '../../models/UserStanding.js';
import { logAdminAction } from '../../utils/adminLogger.js';
import {
  calculateManulifeOverallScore,
  getManulifeTierLevel,
  getManulifeTierName,
  calculateGoalReadyOverallScore,
  getGoalReadyTierName,
  getGoalReadyTierLevel,
} from '../../utils/assessment/manulife.js';
import {
  GRAB_COMPANY_ID,
  GRAB_TEST_COMPANY_ID,
  MANULIFE_COMPANY_ID,
} from '../../utils/constants.js';
import { parseJsonSafely } from '../../utils/json.js';
import { parseAxaPhFeedbackScores } from '../../utils/manage/axa-ph.js';
import { parseBBLFeedbackScores } from '../../utils/manage/bbl.js';
import { parseGrabMexFeedbackScores } from '../../utils/manage/grab-mex.js';
import { parseHSBCFeedbackScores } from '../../utils/manage/hsbc.js';
import { getBulkUserStatistics } from '../../utils/manage/index.js';
import { parseKtAxaFeedbackScores } from '../../utils/manage/kt-axa.js';
import { parseMSIGSessionTier } from '../../utils/manage/msig.js';
import { parseMTLFeedbackScores } from '../../utils/manage/mtl.js';
import {
  buildBaseUserFilter,
  buildSessionFilterWithCompany,
  buildSessionFilterWithCompanyV2,
  calculateGrade,
  determineTeamsFilter,
  GRADE_LEVELS,
  parseFeedbackScores,
} from '../../utils/manage/shared.js';
import { parseAiaKoFeedbackScores } from '../../utils/manage/aia-ko.js';

// Batch helper to fetch all teams at once and return a lookup map
async function batchGetTeamMap(
  items: Array<{ teams?: any[] }>,
): Promise<Map<string, string>> {
  // Collect all unique team IDs
  const allTeamIds = new Set<string>();
  items.forEach((item) => {
    item.teams?.forEach((teamId) => {
      if (teamId) allTeamIds.add(teamId.toString());
    });
  });

  // If no teams, return empty map
  if (allTeamIds.size === 0) {
    return new Map();
  }

  // Fetch all teams in one query
  const teams = await Team.find({ _id: { $in: Array.from(allTeamIds) } })
    .select('_id name')
    .lean();

  // Create a map for O(1) lookups
  return new Map(teams.map((team) => [team._id.toString(), team.name]));
}

// Helper to get team names from team IDs using the batch map
function getTeamNamesFromMap(
  teamIds: any[] | undefined,
  teamMap: Map<string, string>,
): string {
  if (!teamIds || teamIds.length === 0) return '-';

  const teamNames = teamIds
    .map((id) => teamMap.get(id.toString()))
    .filter(Boolean);

  return teamNames.length > 0 ? teamNames.join(', ') : '-';
}

// Common query schema for team filtering
const teamsFilterSchema = z.object({
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
});

// Helper function to get standing value from score
function getStandingFromScore(score: number): string {
  const grade = calculateGrade(score);
  const level = GRADE_LEVELS[grade as keyof typeof GRADE_LEVELS];
  return `${level}: ${grade}`;
}

// Generic Excel report generation function
interface ExcelReportConfig {
  sheetName: string;
  filename: string;
  headers: string[];
  columnWidths: number[];
  data: any[][];
  dateFrom?: string;
  dateTo?: string;
}

function formatPeriodText(dateFrom?: string, dateTo?: string): string {
  if (dateFrom && dateTo) {
    const fromDate = new Date(dateFrom);
    const toDate = new Date(dateTo);
    const formatDate = (date: Date) =>
      date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    return `${formatDate(fromDate)}-${formatDate(toDate)}`;
  } else if (dateFrom) {
    const fromDate = new Date(dateFrom);
    return `From ${fromDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`;
  } else if (dateTo) {
    const toDate = new Date(dateTo);
    return `Until ${toDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`;
  }
  return 'All time';
}

async function generateExcelReport(config: ExcelReportConfig): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(config.sheetName);

  // Add Period header (A1)
  worksheet.getCell('A1').value = 'Period';
  worksheet.getCell('A1').font = { bold: true };

  // Add period range (A2)
  worksheet.getCell('A2').value = formatPeriodText(
    config.dateFrom,
    config.dateTo,
  );

  // Set column widths
  config.columnWidths.forEach((width, index) => {
    worksheet.getColumn(index + 1).width = width;
  });

  // Add data headers at row 4
  config.headers.forEach((header, index) => {
    worksheet.getCell(4, index + 1).value = header;
  });

  // Style the data header row (row 4)
  worksheet.getRow(4).font = { bold: true };
  worksheet.getRow(4).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE6F3FF' },
  };

  // Add data starting from row 5
  config.data.forEach((row, rowIndex) => {
    const excelRow = rowIndex + 5;
    row.forEach((cellValue, colIndex) => {
      worksheet.getCell(excelRow, colIndex + 1).value = cellValue;
    });
  });

  return Buffer.from(await workbook.xlsx.writeBuffer());
}

const router: FastifyPluginAsyncZod = async (app, _opts) => {
  // Keep admin authentication for manage routes separately
  app.use(app.checkAuth0JWT);
  app.addHook('preHandler', app.authenticateManage);

  /**
   * @method GET /manage/report/account-creation
   * @description Generate Excel report for account creation data
   */
  app.get('/account-creation', {
    schema: {
      querystring: z.object({
        dateFrom: z.string().optional(),
        dateTo: z.string().optional(),
      }),
    },
    async handler(req, reply) {
      try {
        const companyId = req.user!.company!.toString();
        const { dateFrom, dateTo } = req.query;
        const userRole = req.user!.role;
        const userTeams = req.user!.teams;

        // Determine the correct teams to filter by
        const filteredTeams = determineTeamsFilter(
          undefined,
          userRole,
          userTeams,
        );

        // Build date filter
        const dateFilter: any = {};
        if (dateFrom) dateFilter.$gte = new Date(dateFrom);
        if (dateTo) dateFilter.$lte = new Date(dateTo);

        // Build user filter with teams
        const userFilter = buildBaseUserFilter(companyId, filteredTeams);

        if (dateFrom || dateTo) {
          userFilter.createdAt = dateFilter;
        }

        // Get users
        const users = await User.find(userFilter)
          .select('name email createdAt')
          .sort({ createdAt: -1 })
          .lean();

        // Prepare data for Excel
        const data = users.map((user) => [
          user.email,
          user.name,
          user.createdAt
            ? new Date(user.createdAt).toLocaleDateString('en-GB')
            : '',
        ]);

        // Generate Excel buffer
        const buffer = await generateExcelReport({
          sheetName: 'Account Creation Report',
          filename: 'account-creation-report.xlsx',
          headers: ['Email', 'Name', 'Account creation date'],
          columnWidths: [30, 25, 20],
          data,
          dateFrom,
          dateTo,
        });

        // Log admin action
        await logAdminAction(req, {
          action: 'report_downloaded',
          category: 'report',
          targetType: 'Report',
          targetName: 'Account Creation Report',
          details: {
            dateFrom,
            dateTo,
            teams: filteredTeams,
            recordCount: data.length,
          },
        });

        // Set response headers
        reply.type(
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        );
        reply.header(
          'Content-Disposition',
          'attachment; filename="account-creation-report.xlsx"',
        );

        return reply.send(buffer);
      } catch (error) {
        req.log.error(
          { err: error },
          'Error generating account creation report:',
        );
        return reply.status(500).send({ error: 'Failed to generate report' });
      }
    },
  });

  /**
   * @method GET /manage/report/active-users
   * @description Generate Excel report for active users data
   */
  app.get('/active-users', {
    schema: {
      querystring: z.object({
        dateFrom: z.string().optional(),
        dateTo: z.string().optional(),
      }),
    },
    async handler(req, reply) {
      try {
        const companyId = req.user!.company!.toString();
        const { dateFrom, dateTo } = req.query;
        const userRole = req.user!.role;
        const userTeams = req.user!.teams;

        // Determine the correct teams to filter by
        const filteredTeams = determineTeamsFilter(
          undefined,
          userRole,
          userTeams,
        );

        // Get session filter with date range (using startedAt to match dashboard logic)
        const { sessionFilter } = await buildSessionFilterWithCompanyV2({
          companyId,
          dateFrom,
          dateTo,
          teams: filteredTeams,
        });

        // Get sessions with user data
        const sessions = await SalesSession.find(sessionFilter)
          .populate('user', 'name email')
          .select('user endedAt')
          .lean();

        // Filter sessions first
        const filteredSessions = sessions.filter(
          (session) => session.user && session.endedAt,
        );

        // Count sessions per user
        const userSessionCounts = new Map();
        filteredSessions.forEach((session) => {
          if (session.user) {
            const user = session.user as any; // Populated user
            const userId = user._id.toString();
            if (!userSessionCounts.has(userId)) {
              userSessionCounts.set(userId, {
                email: user.email,
                name: user.name,
                sessionCount: 0,
              });
            }
            userSessionCounts.get(userId).sessionCount++;
          }
        });

        // Get all active users (sorted by session count descending)
        const activeUsers = Array.from(userSessionCounts.values()).sort(
          (a, b) => b.sessionCount - a.sessionCount,
        );

        // Prepare data for Excel
        const data = activeUsers.map((user) => [user.email, user.sessionCount]);

        // Generate Excel buffer
        const buffer = await generateExcelReport({
          sheetName: 'Active Users Report',
          filename: 'active-users-report.xlsx',
          headers: ['Email', 'Completed practices'],
          columnWidths: [30, 20],
          data,
          dateFrom,
          dateTo,
        });

        // Log admin action
        await logAdminAction(req, {
          action: 'report_downloaded',
          category: 'report',
          targetType: 'Report',
          targetName: 'Active Users Report',
          details: {
            dateFrom,
            dateTo,
            teams: filteredTeams,
            recordCount: data.length,
          },
        });

        // Set response headers
        reply.type(
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        );
        reply.header(
          'Content-Disposition',
          'attachment; filename="active-users-report.xlsx"',
        );

        return reply.send(buffer);
      } catch (error) {
        req.log.error({ err: error }, 'Error generating active users report:');
        return reply.status(500).send({ error: 'Failed to generate report' });
      }
    },
  });

  /**
   * @method GET /manage/report/repeat-users
   * @description Generate Excel report for repeat users data
   */
  app.get('/repeat-users', {
    schema: {
      querystring: z.object({
        dateFrom: z.string().optional(),
        dateTo: z.string().optional(),
      }),
    },
    async handler(req, reply) {
      try {
        const companyId = req.user!.company!.toString();
        const { dateFrom, dateTo } = req.query;
        const userRole = req.user!.role;
        const userTeams = req.user!.teams;

        // Determine the correct teams to filter by
        const filteredTeams = determineTeamsFilter(
          undefined,
          userRole,
          userTeams,
        );

        // Get session filter with date range
        const { sessionFilter } = await buildSessionFilterWithCompany({
          companyId,
          dateFrom,
          dateTo,
          teams: filteredTeams,
        });

        // Get sessions with user data
        const sessions = await SalesSession.find(sessionFilter)
          .populate('user', 'name email')
          .select('user endedAt')
          .lean();

        // Count sessions per user
        const userSessionCounts = new Map();
        sessions.forEach((session) => {
          if (session.user && session.endedAt) {
            const user = session.user as any; // Populated user
            const userId = user._id.toString();
            if (!userSessionCounts.has(userId)) {
              userSessionCounts.set(userId, {
                email: user.email,
                name: user.name,
                sessionCount: 0,
              });
            }
            userSessionCounts.get(userId).sessionCount++;
          }
        });

        // Filter only repeat users (more than 1 session)
        const repeatUsers = Array.from(userSessionCounts.values())
          .filter((user) => user.sessionCount > 1)
          .sort((a, b) => b.sessionCount - a.sessionCount);

        // Prepare data for Excel
        const data = repeatUsers.map((user) => [user.email, user.sessionCount]);

        // Generate Excel buffer
        const buffer = await generateExcelReport({
          sheetName: 'Repeat Users Report',
          filename: 'repeat-users-report.xlsx',
          headers: ['Email', 'Completed practices'],
          columnWidths: [30, 20],
          data,
          dateFrom,
          dateTo,
        });

        // Log admin action
        await logAdminAction(req, {
          action: 'report_downloaded',
          category: 'report',
          targetType: 'Report',
          targetName: 'Repeat Users Report',
          details: {
            dateFrom,
            dateTo,
            teams: filteredTeams,
            recordCount: data.length,
          },
        });

        // Set response headers
        reply.type(
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        );
        reply.header(
          'Content-Disposition',
          'attachment; filename="repeat-users-report.xlsx"',
        );

        return reply.send(buffer);
      } catch (error) {
        req.log.error({ err: error }, 'Error generating repeat users report:');
        return reply.status(500).send({ error: 'Failed to generate report' });
      }
    },
  });

  /**
   * @method GET /manage/report/completed-practices
   * @description Generate Excel report for completed practices data
   */
  app.get('/completed-practices', {
    schema: {
      querystring: z.object({
        dateFrom: z.string().optional(),
        dateTo: z.string().optional(),
        tc: z.string().optional(),
      }),
    },
    async handler(req, reply) {
      try {
        const companyId = req.user!.company!.toString();
        const { dateFrom, dateTo, tc } = req.query;
        const userRole = req.user!.role;
        const userTeams = req.user!.teams?.map((t) => t.toString()) ?? [];

        // Get session filter with date range
        const { sessionFilter } = await buildSessionFilterWithCompany({
          companyId,
          dateFrom,
          dateTo,
          teams: userRole === 'superadmin' ? [] : userTeams,
        });

        // Add filter to exclude sessions without scores (only for Grab)
        // Include sessions with either top-level scores OR scorecard-based scores (self-serve scenarios)
        const isGrabCompany = [GRAB_COMPANY_ID, GRAB_TEST_COMPANY_ID].includes(
          companyId,
        );

        if (isGrabCompany) {
          (sessionFilter as any).$or = [
            { scores: { $exists: true } },
            {
              'roleplay.feedback.scorecards': {
                $exists: true,
                $not: { $size: 0 },
              },
            },
          ];
        }

        // Get completed sessions with detailed data
        const sessions = await SalesSession.find(sessionFilter)
          .populate('user', 'name email')
          .populate('product', 'name')
          .populate('persona', 'name')
          .populate('standing')
          .populate({
            path: 'scenario',
            populate: [{ path: 'module' }, { path: 'persona', select: 'name' }],
          })
          .select(
            'user endedAt callType product persona roleplay standing scores assessmentType scenario teams',
          )
          .sort({ endedAt: -1 })
          .lean();

        // Determine if we should show the team column based on query parameter
        const shouldShowTeams = tc !== undefined;

        // Filter sessions first
        const filteredSessions = sessions.filter(
          (session) => session.user && session.endedAt,
        );

        // Batch fetch all teams if needed
        const teamMap = shouldShowTeams
          ? await batchGetTeamMap(filteredSessions)
          : new Map();

        // Prepare data for Excel
        const data = await Promise.all(
          filteredSessions.map(async (session) => {
            const user = session.user as unknown as IUser;
            const standing = session.standing as unknown as IUserStanding;

            // Format duration
            const duration = session.roleplay?.duration
              ? `${Math.floor(session.roleplay.duration / 60)
                  .toString()
                  .padStart(2, '0')}:${Math.round(
                  session.roleplay.duration % 60,
                )
                  .toString()
                  .padStart(2, '0')}`
              : '-';

            // Get standing and score
            let standingValue = '-';
            let score: string | number = '-';

            // Check assessmentType first, then fall back to company ID for Manulife
            const assessmentType = session.assessmentType;

            if (assessmentType === 'manulife-goalready') {
              // Manulife GoalReady: Calculate average from three sections
              const overallScore = calculateGoalReadyOverallScore(session);
              if (overallScore > 0) {
                const tierName = getGoalReadyTierName(overallScore);
                const tierLevel = getGoalReadyTierLevel(tierName);
                standingValue = `L${tierLevel}: ${tierName}`;
                score = overallScore.toString();
              }
            } else if (
              assessmentType === 'manulife' ||
              companyId === MANULIFE_COMPANY_ID
            ) {
              // Manulife FNA: Use section-based scoring
              const salesTechniques = parseJsonSafely(
                session?.roleplay?.feedback.salesTechniques,
              );
              const sections = salesTechniques?.sections;
              const overallScore = calculateManulifeOverallScore(sections);
              const tierName = getManulifeTierName(salesTechniques?.sections);
              const tierLevel = getManulifeTierLevel(tierName);

              standingValue = overallScore ? `L${tierLevel}: ${tierName}` : '-';
              score = overallScore?.toString();
            } else if (assessmentType === 'hsbc') {
              // HSBC: 4 scores average (relationshipManagement, processAdherence, representation, communicationAndPresence)
              const hsbcScores = parseHSBCFeedbackScores(session);
              if (hsbcScores.isValid && hsbcScores.overallScore !== null) {
                const roundedScore = Math.round(hsbcScores.overallScore);
                score = roundedScore;
                standingValue = getStandingFromScore(roundedScore);
              }
            } else if (assessmentType === 'grab-mex') {
              // Grab-MEX: 3 scores average (softSkills, salesTechnique, productKnowledge)
              const grabMexScores = parseGrabMexFeedbackScores(session);
              if (
                grabMexScores.isValid &&
                grabMexScores.overallScore !== null
              ) {
                const roundedScore = Math.round(grabMexScores.overallScore);
                score = roundedScore;
                standingValue = getStandingFromScore(roundedScore);
              }
            } else if (
              assessmentType === 'mtl-recruitment' ||
              assessmentType === 'mtl-prospect-practice'
            ) {
              // MTL: Only salesTechnique score
              const mtlScores = parseMTLFeedbackScores(session);
              if (mtlScores.isValid && mtlScores.overallScore !== null) {
                const roundedScore = Math.round(mtlScores.overallScore);
                score = roundedScore;
                standingValue = getStandingFromScore(roundedScore);
              }
            } else if (
              assessmentType === 'axa-ph-recruitment' ||
              assessmentType === 'axa-ph-objection-handling'
            ) {
              // AXA PH: Soft skills + Knowledge skills
              const axaPhScores = parseAxaPhFeedbackScores(session);
              if (axaPhScores.isValid && axaPhScores.overallScore !== null) {
                const roundedScore = Math.round(axaPhScores.overallScore);
                score = roundedScore;
                standingValue = getStandingFromScore(roundedScore);
              }
            } else if (assessmentType === 'bbl') {
              // BBL: advisoryTechnique, processAdherence
              const bblScores = parseBBLFeedbackScores(session);
              if (bblScores.isValid && bblScores.overallScore !== null) {
                const roundedScore = Math.round(bblScores.overallScore);
                score = roundedScore;
                standingValue = getStandingFromScore(roundedScore);
              }
            } else if (
              assessmentType === 'kt-axa-recruitment' ||
              assessmentType === 'kt-axa-fna' ||
              assessmentType === 'kt-axa-wealthplus'
            ) {
              // KT AXA: Soft Skills + Knowledge Skills (+ Product Knowledge for FNA/WealthPlus)
              const ktAxaScores = parseKtAxaFeedbackScores(session);
              if (ktAxaScores.isValid && ktAxaScores.overallScore !== null) {
                const roundedScore = Math.round(ktAxaScores.overallScore);
                score = roundedScore;
                standingValue = getStandingFromScore(roundedScore);
              }
            } else if (
              assessmentType === 'msig' ||
              assessmentType === 'msig-3f' ||
              assessmentType === 'msig-travel-easy'
            ) {
              // MSIG: Use tier-based scoring with correct thresholds per assessment type
              const msigTier = parseMSIGSessionTier(session);
              if (msigTier.isValid && msigTier.overallScore > 0) {
                const roundedScore = Math.round(msigTier.overallScore);
                score = roundedScore;
                standingValue = `L${msigTier.tierLevel}: ${msigTier.tierName}`;
              }
            } else if (
              assessmentType === 'aia-ko-opening-objection-call' ||
              assessmentType === 'aia-ko-product-pitch' ||
              assessmentType === 'aia-ko-end-to-end-outbound-call'
            ) {
              const aiaKoScores = parseAiaKoFeedbackScores(session);
              if (aiaKoScores.isValid && aiaKoScores.overallScore !== null) {
                const roundedScore = Math.round(aiaKoScores.overallScore);
                score = roundedScore;
                standingValue = getStandingFromScore(roundedScore);
              }
            } else if (assessmentType === 'scorecard') {
              // Scorecard-based assessments (self-serve scenarios, incl. Great Eastern)
              const scorecardScores = parseFeedbackScores(session);
              if (
                scorecardScores.isValid &&
                scorecardScores.overallScore !== null
              ) {
                const roundedScore = Math.round(scorecardScores.overallScore);
                score = roundedScore;
                standingValue = getStandingFromScore(roundedScore);
              }
            } else if (standing) {
              standingValue = standing.tierName || '-';
            } else {
              // For regular assessments without standing, calculate score from feedback
              let salesTechniquesData = null;
              let productKnowledgeData = null;

              try {
                salesTechniquesData = session.roleplay?.feedback
                  ?.salesTechniques
                  ? parseJsonSafely(session.roleplay.feedback.salesTechniques)
                  : null;
              } catch (error) {
                req.log.warn(
                  { err: error },
                  'Failed to parse salesTechniques feedback:',
                );
              }

              try {
                productKnowledgeData = session.roleplay?.feedback
                  ?.productKnowledge
                  ? parseJsonSafely(session.roleplay.feedback.productKnowledge)
                  : null;
              } catch (error) {
                req.log.warn(
                  { err: error },
                  'Failed to parse productKnowledge feedback:',
                );
              }

              const salesScore =
                salesTechniquesData?.overallScore ??
                session.scores?.salesTechnique;
              const productScore =
                productKnowledgeData?.overallScore ??
                session.scores?.productKnowledge;

              // Calculate average score from available scores
              const validScores = [salesScore, productScore].filter(
                (s) => s != null && !isNaN(s),
              );
              if (validScores.length > 0) {
                const avgScore =
                  validScores.reduce((sum, s) => sum + s, 0) /
                  validScores.length;
                const roundedScore = Math.round(avgScore);
                score = roundedScore;
                standingValue = getStandingFromScore(roundedScore);
              }
            }

            // Generate assessment link
            const assessmentLink = `https://train.hupo.co/roleplay/${session._id}/assessment`;

            // Get persona from scenario if available, otherwise fall back to legacy persona field
            const persona =
              (session.scenario as any)?.persona || session.persona;

            const row: (string | number)[] = [
              new Date(session.endedAt!).toLocaleDateString('en-GB') +
                ', ' +
                new Date(session.endedAt!).toLocaleTimeString('en-GB', {
                  hour: '2-digit',
                  minute: '2-digit',
                }),
              user.email,
            ];

            if (shouldShowTeams) {
              // Add Team column after Email
              const teamNames = getTeamNamesFromMap(session.teams, teamMap);
              row.push(teamNames);
            }

            row.push(
              (session.scenario as any)?.module?.title ??
                (session.callType
                  ? session.callType.charAt(0).toUpperCase() +
                    session.callType.slice(1).replace(/-/g, ' ')
                  : '-'),
              session.product?.name || '-',
              persona?.name || '-',
              duration,
              standingValue,
              score,
              assessmentLink,
            );

            return row;
          }),
        );

        // Generate Excel buffer
        const headers = ['Completed at', 'Email'];
        const columnWidths = [18, 30];

        if (shouldShowTeams) {
          headers.push('Team');
          columnWidths.push(25);
        }

        headers.push(
          'Module',
          'Product',
          'Persona',
          'Duration',
          'Standing',
          'Score',
          'Assessment link',
        );
        columnWidths.push(20, 20, 25, 12, 15, 10, 40);

        const buffer = await generateExcelReport({
          sheetName: 'Completed Practices Report',
          filename: 'completed-practices-report.xlsx',
          headers,
          columnWidths,
          data,
          dateFrom,
          dateTo,
        });

        // Log admin action
        await logAdminAction(req, {
          action: 'report_downloaded',
          category: 'report',
          targetType: 'Report',
          targetName: 'Completed Practices Report',
          details: {
            dateFrom,
            dateTo,
            teams: userRole === 'superadmin' ? [] : userTeams,
            recordCount: data.length,
          },
        });

        // Set response headers
        reply.type(
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        );
        reply.header(
          'Content-Disposition',
          'attachment; filename="completed-practices-report.xlsx"',
        );

        return reply.send(buffer);
      } catch (error) {
        req.log.error(
          { err: error },
          'Error generating completed practices report:',
        );
        return reply.status(500).send({ error: 'Failed to generate report' });
      }
    },
  });

  /**
   * @method GET /manage/report/users
   * @description Generate Excel report for all users data
   */
  app.get('/users', {
    schema: {
      querystring: z.object({
        dateFrom: z.string().optional(),
        dateTo: z.string().optional(),
      }),
    },
    async handler(req, reply) {
      try {
        const companyId = req.user!.company!.toString();
        const { dateFrom, dateTo } = req.query;
        const userRole = req.user!.role;
        const userTeams = req.user!.teams;

        // Determine the correct teams to filter by
        const filteredTeams = determineTeamsFilter(
          undefined,
          userRole,
          userTeams,
        );

        // Build user filter with teams
        const userFilter = buildBaseUserFilter(companyId, filteredTeams);

        // Get users
        const users = await User.find(userFilter)
          .select('_id name email status')
          .lean();

        // Get user IDs for bulk statistics
        const userIds = users.map((user) => user._id.toString());
        const bulkStats = await getBulkUserStatistics(
          userIds,
          companyId,
          undefined, // no module filter for report
        );

        // Filter users based on date range if they have sessions in that period
        let filteredUsers = users;
        if (dateFrom || dateTo) {
          const dateFilter: any = {};
          if (dateFrom) dateFilter.$gte = new Date(dateFrom);
          if (dateTo) dateFilter.$lte = new Date(dateTo);

          const { sessionFilter } = await buildSessionFilterWithCompany({
            companyId,
            dateFrom,
            dateTo,
            teams: filteredTeams,
            additionalFilters: {
              user: { $in: userIds },
            },
          });

          const sessionsInRange = await SalesSession.find(sessionFilter)
            .select('user')
            .lean();

          const userIdsWithSessions = new Set(
            sessionsInRange.map((s) => s.user.toString()),
          );

          filteredUsers = users.filter((user) =>
            userIdsWithSessions.has(user._id.toString()),
          );
        }

        // Merge users with stats and add status information
        const usersWithStats = filteredUsers.map((user) => {
          const userId = user._id.toString();
          const stats = bulkStats[userId] || {
            totalPractices: 0,
            averageDurationMinutes: 0,
            averageDurationSeconds: 0,
            averageScore: null,
            lastSessionDate: null,
          };

          return {
            email: user.email || '',
            name: user.name || 'Unknown User',
            status: user.status || 'active',
            ...stats,
          };
        });

        // Sort by status (active/non-inactive first, inactive second) then by email ascending
        usersWithStats.sort((a, b) => {
          const aIsInactive = a.status === 'inactive';
          const bIsInactive = b.status === 'inactive';

          // First, sort by inactive status (non-inactive first, inactive second)
          if (aIsInactive !== bIsInactive) {
            return aIsInactive ? 1 : -1;
          }

          // Within each status group, sort by email ascending
          return a.email.localeCompare(b.email);
        });

        // Prepare data for Excel
        const data = usersWithStats.map((user) => {
          // Format duration as MM:SS
          const formatDuration = (seconds: number): string => {
            if (seconds === 0) return '-';
            const mins = Math.floor(seconds / 60);
            const secs = Math.round(seconds % 60);
            return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
          };

          // Add " (Deactivated)" suffix for inactive users
          const isInactive = user.status === 'inactive';
          const emailDisplay = isInactive
            ? `${user.email} (Deactivated)`
            : user.email;
          const nameDisplay = isInactive
            ? `${user.name} (Deactivated)`
            : user.name;

          return [
            emailDisplay,
            nameDisplay,
            user.totalPractices,
            formatDuration(user.averageDurationSeconds),
            user.averageScore !== null ? Math.round(user.averageScore) : '-',
            user.lastSessionDate
              ? new Date(user.lastSessionDate).toLocaleDateString('en-GB')
              : '-',
          ];
        });

        // Generate Excel buffer
        const buffer = await generateExcelReport({
          sheetName: 'Users Report',
          filename: 'users-report.xlsx',
          headers: [
            'User',
            'Name',
            'Total completed practice',
            'Average practice length',
            'Average score',
            'Last practice session',
          ],
          columnWidths: [30, 25, 25, 20, 15, 20],
          data,
          dateFrom,
          dateTo,
        });

        // Log admin action
        await logAdminAction(req, {
          action: 'report_downloaded',
          category: 'report',
          targetType: 'Report',
          targetName: 'Users Report',
          details: {
            dateFrom,
            dateTo,
            teams: filteredTeams,
            recordCount: data.length,
          },
        });

        // Set response headers
        reply.type(
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        );
        reply.header(
          'Content-Disposition',
          'attachment; filename="users-report.xlsx"',
        );

        return reply.send(buffer);
      } catch (error) {
        req.log.error({ err: error }, 'Error generating users report:');
        return reply.status(500).send({ error: 'Failed to generate report' });
      }
    },
  });

  app.log.info('[manage/report.ts] routes registered');
};

export default router;
