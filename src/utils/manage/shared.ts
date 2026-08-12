import { Types } from 'mongoose';
import { ALL_SALES_MODULES } from '../../constants/modules.js';
import { User } from '../../models/User.js';
import { MIN_TOTAL_MESSAGES } from '../session.js';
import {
  HUPO_COMPANY_ID,
  HUPO_DEMO_COMPANY_ID,
  GRAB_COMPANY_ID,
  GRAB_TEST_COMPANY_ID,
} from '../constants.js';
import { NON_TEST_ACCOUNT_REGEX } from '../testaccount.js';
import {
  SalesSession,
  type SalesSessionDocument,
} from '../../models/SalesSession.js';
import {
  getManulifeTierName,
  getManulifeTierLevel,
  calculateManulifeOverallScore,
  calculateGoalReadyOverallScore,
  getGoalReadyTierName,
  getGoalReadyTierLevel,
} from '../assessment/manulife.js';
import { isProd, isStaging, isDev } from '../../env.js';
import { getProductByFriendlyId } from '../product.js';
import { getModules } from '../module.js';
import { Module } from '../../models/Module.js';
import { Scenario } from '../../models/Scenario.js';
import { Scorecard } from '../../models/Scorecard.js';

// ==================== URL GENERATION ====================

/**
 * Generate the appropriate URL based on environment and user role
 * @param role - User role (superadmin, admin, or user)
 * @param companyFriendlyId - Company friendly ID (required for user role)
 * @returns The appropriate URL for the environment and role
 */
export function getAppUrl(
  role: 'superadmin' | 'admin' | 'user',
  companyFriendlyId?: string,
): string {
  const featureEnv = process.env.FEATURE_ENV;

  // Base URLs for each environment
  let baseUrl: string;

  if (isProd) {
    baseUrl = 'https://train.hupo.co';
  } else if (isStaging && featureEnv) {
    baseUrl = `https://${featureEnv}--huposalesai.netlify.app`;
  } else if (isDev) {
    baseUrl = 'http://localhost:5361';
  } else {
    // Fallback to dev if environment is unclear
    baseUrl = 'http://localhost:5361';
  }

  // Determine path based on role
  if (role === 'superadmin' || role === 'admin') {
    return `${baseUrl}/manage`;
  } else {
    // role === 'user'
    if (!companyFriendlyId) {
      throw new Error('companyFriendlyId is required for user role');
    }
    return `${baseUrl}/${companyFriendlyId}`;
  }
}

// ==================== TEAM FILTERING ====================

/**
 * Helper function to determine the correct teams to filter by
 * @param queryTeams - Teams from query string
 * @param userRole - Role of the requesting user
 * @param userTeams - Teams the requesting user belongs to
 * @returns Array of team IDs to filter by, or undefined for no filtering
 */
export function determineTeamsFilter(
  queryTeams: string[] | undefined,
  userRole: string,
  userTeams: Types.ObjectId[] | undefined,
): string[] | undefined {
  // Case 1: If teams filter is provided from frontend, use it
  if (queryTeams && queryTeams.length > 0) {
    return queryTeams;
  }

  // Case 2: No teams filter and user is superadmin - don't filter by teams
  if (!queryTeams && userRole === 'superadmin') {
    return undefined;
  }

  // Case 3: No teams filter and user is admin - filter by admin's teams
  if (
    !queryTeams &&
    userRole === 'admin' &&
    userTeams &&
    userTeams.length > 0
  ) {
    return userTeams.map((team) => team.toString());
  }

  // Default: no team filtering
  return undefined;
}

// ==================== MODULE TYPE CHECKING ====================

/**
 * Check if a module is a legacy module (hardcoded) vs a self-serve module (database)
 * @param companyId - Company ID to check against
 * @param moduleFriendlyId - Module friendly ID to check
 * @returns True if the module is legacy, false if it's a self-serve module
 */
export function isLegacyModule(
  companyId: string,
  moduleFriendlyId: string,
): boolean {
  const legacyModules = getModules(companyId);
  return legacyModules.some(
    (module: any) => module.friendlyId === moduleFriendlyId,
  );
}

// ==================== SESSION FILTERING ====================

const PRUDENTIAL_TESTER_EMAILS = [
  'joycechanan@pruadviser.com.sg',
  'ernestloh@pruadviser.com.sg',
  'alanwongwl@pruadviser.com.sg',
  'geraldwu@prufa.com.sg',
  'jonathonhan@pruadviser.com.sg',
  'leejuerong@pruadviser.com.sg',
  'chankengleong@pruadviser.com.sg',
  'eugenechen@pruadviser.com.sg',
  'gerannngiamjj@pruadviser.com.sg',
  'josephlin@pruadviser.com.sg',
  'chenqiwei@pruadviser.com.sg',
  'chankokjun@prufa.com.sg',
  'sandraoon@pruadviser.com.sg',
  'frankie.cc.tan@prudential.com.sg',
];

const MANULIFE_TESTER_EMAILS = [
  'julianne_maverick_rivera@manulife.com',
  'anthony_carlo_leona@manulife.com',
  'jezreel_buenaventura@manulife.com',
  'gary_magaling@manulife.com',
  'rhody_ang@manulife.com',
  'lizaloraine_lopez@manulife.com',
  'shane_ouano@manulife.com',
  'kaye_pacatang@manulife.com',
  'mariajacqueline_p_janolo@manulife.com ',
  'mariel_c_tablan@manulife.com',
  'honifei_dg_rivero@manulife.com',
  'lester_raymond_laluces@manulife.com',
  'eric_v_cahatol@manulife.com',
  'webster_buitizon@manulife.com',
  'kim_nico_quinto@manulife.com',
  'ronniel_morales@manulife.com',
  'papu_nucum@manulife.com',
  'ma_elisa_cesar@manulife.com',
  'thimothy_john_torres@manulife.com',
  'arvin_james_go@manulife.com',
  'otrevor_calasin@manulife.com',
  'john_reison_m_kwan@manulife.com',
  'darlenejoy_s_hitalia@manulife.com',
  'riezeryl_clevise_go_chua@manulife.com',
  'catherine_ann_lu@manulife.com',
  'richmon_arcilla@manulife.com',
  'michael_philip_lao@manulife.com',
  'grace_p_beltran@manulife.com',
  'jen_arcega@manulife.com',
  'tracy_anne_estorninos@manulife.com',
  'aisa_rimando@manulife.com',
  'michael_tayag@manulife.com',
  'christy_cuaton@manulife.com',
  'genevir_vitasa@manulife.com',
  'margelle_anne_villar@manulife.com',
  'german_celeres_jr@manulife.com',
  'john_agustin@manulife.com',
  'arnold_eser_jose@manulife.com',
  'dennis_glenn_stewart@manulife.com',
  'alvin_tonio@manulife.com',
  'berna_gracia_c_dimarucut@manulife.com',
  'ghia_isabelle_urani@manulife.com',
  'grace_anne_camus@manulife.com',
  'christian_galvez@manulife.com',
  'paolo_javellana@manulife.com',
  'aimee_dimapilis@manulife.com',
  'jinky_sabaldica@manulife.com',
  'maritess_esparaguera@manulife.com',
  'aizanne_diaz@manulife.com',
  'franch_abregana@manulife.com',
  'paolo_bendicion@manulife.com',
  'crisogono_reyes@manulife.com',
  'glory_d_cue@manulife.com',
  'ray_salgado@manulife.com',
  'rodrigo_dormis_larobis@manulife.com',
  'alyssa_guen_jito@manulife.com',
  'meradil_cuyos@manulife.com',
  'jo_anne_babael@manulife.com',
  'nico_marte@manulife.com',
  'serafin_poblete_jr@manulife.com',
  'mitzi_jaldon@manulife.com',
  'jose_roy_aguila@manulife.com',
  'krizachin_lumanog@manulife.com',
  'bernard_go@manulife.com',
  'sheila_delarosa@manulife.com',
  'ron_magdamo@manulife.com',
  'jane_angeles_acapulco@manulife.com',
  'sheenika_marie_cavalida@manulife.com',
  'marc_bernard_lirazan@manulife.com',
];

export interface SessionFilterOptions {
  companyId?: string;
  dateFrom?: string;
  dateTo?: string;
  module?: string;
  userId?: string;
  additionalFilters?: Record<string, any>;
  teams?: string[];
  assessmentType?: string | string[];
}

export function buildBaseUserFilter(
  companyId?: string,
  teams?: string[],
  includeDeleted = false,
  skipTesterFilter = false,
) {
  const userFilter: any = {};

  if (!skipTesterFilter) {
    userFilter.isTester = { $ne: true };
  }

  if (!includeDeleted) {
    userFilter.isDeleted = { $ne: true };
  }

  if (companyId) {
    userFilter.company = companyId;
  }

  if (teams && teams.length > 0) {
    // Filter out any empty strings and ensure all values are valid
    const validTeams = teams.filter(
      (team) => team && team.trim() !== '' && team !== 'all',
    );
    if (validTeams.length > 0) {
      userFilter.teams = { $in: validTeams };
    }
  }

  // Exclude test accounts for non-HUPO companies
  if (
    companyId &&
    companyId !== HUPO_COMPANY_ID &&
    companyId !== HUPO_DEMO_COMPANY_ID &&
    isProd
  ) {
    userFilter.email = {
      $regex: NON_TEST_ACCOUNT_REGEX,
    };
  }

  // Add tester email exclusion to the filter
  if (userFilter.email) {
    // If email filter already exists (from NON_TEST_ACCOUNT_REGEX), combine with $and
    userFilter.$and = [
      { email: userFilter.email },
      {
        email: {
          $nin: [...PRUDENTIAL_TESTER_EMAILS, ...MANULIFE_TESTER_EMAILS],
        },
      },
    ];
    delete userFilter.email;
  } else {
    userFilter.email = {
      $nin: [...PRUDENTIAL_TESTER_EMAILS, ...MANULIFE_TESTER_EMAILS],
    };
  }

  return userFilter;
}

/**
 * Base filter criteria for completed sessions:
 * - Must have endedAt set
 * - Must have minimum number of messages
 */
export const COMPLETED_SESSION_FILTER = {
  endedAt: { $exists: true, $ne: null },
  $expr: { $gte: [{ $size: '$messages' }, MIN_TOTAL_MESSAGES] },
};

export function buildSessionFilter(options: SessionFilterOptions = {}) {
  const {
    companyId,
    dateFrom,
    dateTo,
    module,
    userId,
    additionalFilters = {},
    assessmentType,
  } = options;

  // Build date filter
  const dateFilter = buildDateFilter(dateFrom, dateTo);

  // Base session filter
  const sessionFilter: any = {
    ...COMPLETED_SESSION_FILTER,
    ...additionalFilters,
  };

  // Add date filtering if provided
  if (Object.keys(dateFilter).length > 0) {
    sessionFilter.endedAt = { ...dateFilter, $exists: true, $ne: null };
  }

  // Add module filter (callType filtering)
  if (module && module !== 'all') {
    sessionFilter.callType = module;
  }

  // Add assessmentType filter if provided
  if (assessmentType) {
    if (Array.isArray(assessmentType)) {
      sessionFilter.assessmentType = { $in: assessmentType };
    } else {
      sessionFilter.assessmentType = assessmentType;
    }
  }

  // Add user filter
  if (userId) {
    sessionFilter.user = userId;
  }

  return { sessionFilter, dateFilter };
}

export async function buildSessionFilterWithCompany(
  options: SessionFilterOptions = {},
) {
  const { companyId, teams } = options;
  const { sessionFilter, dateFilter } = buildSessionFilter(options);

  // Add company and team filtering
  if (companyId || (teams && teams.length > 0)) {
    const userIds = await getUserIdsForCompany(companyId, teams);
    if (userIds && userIds.length > 0) {
      sessionFilter.user = sessionFilter.user
        ? sessionFilter.user
        : { $in: userIds };
    } else if (companyId || (teams && teams.length > 0)) {
      // If we have company or team filtering but no users found, return empty results
      sessionFilter.user = { $in: [] };
    }
  }

  return { sessionFilter, dateFilter };
}

/**
 * Build session filter with date range using startedAt and valid user filtering
 * Used for active users report to match dashboard logic
 */
export async function buildSessionFilterWithCompanyV2(
  options: SessionFilterOptions = {},
) {
  const {
    companyId,
    teams,
    dateFrom,
    dateTo,
    userId,
    additionalFilters = {},
  } = options;

  // Base session filter with completed session criteria
  const sessionFilter: any = {
    ...COMPLETED_SESSION_FILTER,
    ...additionalFilters,
  };

  // Add date filtering using startedAt instead of endedAt
  if (dateFrom || dateTo) {
    const dateFilter: any = {};
    if (dateFrom) dateFilter.$gte = new Date(dateFrom);
    if (dateTo) {
      // Set to end of day to include all records on dateTo
      const endDate = new Date(dateTo);
      endDate.setDate(endDate.getDate() + 1);
      dateFilter.$lt = endDate;
    }
    sessionFilter.startedAt = dateFilter;
  }

  // Add user filter
  if (userId) {
    sessionFilter.user = userId;
  }

  // Add company and team filtering
  if (companyId || (teams && teams.length > 0)) {
    const userIds = await getUserIdsForCompany(companyId, teams);
    if (userIds && userIds.length > 0) {
      sessionFilter.user = sessionFilter.user
        ? sessionFilter.user
        : { $in: userIds };
    } else if (companyId || (teams && teams.length > 0)) {
      sessionFilter.user = { $in: [] };
    }
  }

  return { sessionFilter };
}

// ==================== DURATION CALCULATIONS ====================

export interface DurationResult {
  totalDuration: number;
  durationCount: number;
  averageDurationMinutes: number;
  averageDurationSeconds: number;
}

export function calculateSessionDurations(sessions: any[]): DurationResult {
  let totalDuration = 0;
  let durationCount = 0;

  for (const session of sessions) {
    // Prefer roleplay.duration (actual conversation time) if available,
    // otherwise fall back to calculated session time (startedAt to endedAt)
    let durationMs = 0;

    if (session.roleplay?.duration) {
      // roleplay.duration is in seconds, convert to milliseconds
      durationMs = session.roleplay.duration * 1000;
    } else if (session.startedAt && session.endedAt) {
      durationMs =
        new Date(session.endedAt).getTime() -
        new Date(session.startedAt).getTime();
    }

    if (durationMs > 0) {
      totalDuration += durationMs;
      durationCount++;
    }
  }

  const averageDurationMinutes =
    durationCount > 0 ? Math.round(totalDuration / durationCount / 60000) : 0;
  const averageDurationSeconds =
    durationCount > 0 ? Math.round(totalDuration / durationCount / 1000) : 0;

  return {
    totalDuration,
    durationCount,
    averageDurationMinutes,
    averageDurationSeconds,
  };
}

// ==================== MONTHLY DATA AGGREGATION ====================

export interface MonthlyDataPoint {
  monthKey: string;
  monthLabel: string;
  date: Date;
}

export function generateMonthlyDataPoints(months: number): MonthlyDataPoint[] {
  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const dataPoints: MonthlyDataPoint[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(1); // Set to first day of month to avoid month boundary issues
    date.setMonth(date.getMonth() - i);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const monthKey = `${year}-${month}`;
    const monthLabel = monthNames[date.getMonth()];

    dataPoints.push({
      monthKey,
      monthLabel,
      date: new Date(date),
    });
  }

  return dataPoints;
}

export function getSessionMonthKey(session: any): string {
  if (!session.endedAt) return '';
  const endDate = new Date(session.endedAt);
  return `${endDate.getFullYear()}-${endDate.getMonth() + 1}`;
}

// ==================== GRADE/COLOR UTILITIES ====================

export interface GradeColors {
  backgroundColor: string;
  textColor: string;
}

export const GRADE_COLORS: Record<string, GradeColors> = {
  Poor: { backgroundColor: '#fee2e2', textColor: '#dc2626' },
  Fair: { backgroundColor: '#FFF4EB', textColor: '#B25300' },
  Good: { backgroundColor: '#E8F1FD', textColor: '#1C7AEB' },
  Excellent: { backgroundColor: '#E7F8F3', textColor: '#058A62' },
};

export const GRADE_LEVELS: Record<string, string> = {
  Poor: 'L1',
  Fair: 'L2',
  Good: 'L3',
  Excellent: 'L4',
};

export const STANDING_COLORS: Record<number, GradeColors> = {
  1: { backgroundColor: '#FFF4EB', textColor: '#B25300' },
  2: { backgroundColor: '#E8F1FD', textColor: '#1C7AEB' },
  3: { backgroundColor: '#E7F8F3', textColor: '#058A62' },
};

export const STANDING_NAMES: Record<number, { level: string; grade: string }> =
  {
    1: { level: 'L1', grade: 'Sales Novice' },
    2: { level: 'L2', grade: 'Skilled Advisor' },
    3: { level: 'L3', grade: 'Strategic Consultant' },
  };

export const MANULIFE_STANDING_NAMES: Record<
  number,
  { level: string; grade: string }
> = {
  1: { level: 'L1', grade: 'Failed' },
  2: { level: 'L2', grade: 'Pass' },
  3: { level: 'L3', grade: 'Champion' },
};

export const MSIG_STANDING_NAMES: Record<
  number,
  { level: string; grade: string }
> = {
  1: { level: 'L1', grade: 'Sales Novice' },
  2: { level: 'L2', grade: 'Emerging Seller' },
  3: { level: 'L3', grade: 'Skilled Advisor' },
  4: { level: 'L4', grade: 'Strategic Consultant' },
};

export const MSIG_STANDING_COLORS: Record<number, GradeColors> = {
  1: { backgroundColor: '#FFF4EB', textColor: '#B25300' }, // Orange
  2: { backgroundColor: '#E8F1FD', textColor: '#1C7AEB' }, // Blue
  3: { backgroundColor: '#E7F8F3', textColor: '#058A62' }, // Green
  4: { backgroundColor: '#EDE9FE', textColor: '#6D28D9' }, // Purple
};

// ==================== BREAKDOWN UTILITIES ====================

export interface BreakdownItem {
  level: string;
  grade: string;
  totalPractices: number;
  averageScore: number | null;
  backgroundColor: string;
  textColor: string;
}

export function createGradeBreakdown(): BreakdownItem[] {
  return Object.entries(GRADE_LEVELS).map(([grade, level]) => ({
    level,
    grade,
    totalPractices: 0,
    averageScore: 0,
    backgroundColor: GRADE_COLORS[grade].backgroundColor,
    textColor: GRADE_COLORS[grade].textColor,
  }));
}

export function createStandingBreakdown(
  includeNoStanding: boolean = true,
): BreakdownItem[] {
  const breakdown = Object.entries(STANDING_NAMES).map(
    ([tierLevel, { level, grade }]) => ({
      level,
      grade,
      totalPractices: 0,
      averageScore: null,
      backgroundColor: STANDING_COLORS[parseInt(tierLevel)].backgroundColor,
      textColor: STANDING_COLORS[parseInt(tierLevel)].textColor,
    }),
  );

  if (includeNoStanding) {
    breakdown.push({
      level: 'N/A',
      grade: 'No standing',
      totalPractices: 0,
      averageScore: null,
      backgroundColor: '#F3F4F6',
      textColor: '#6B7280',
    });
  }

  return breakdown;
}

export function createManulifeStandingBreakdown(
  includeNoStanding: boolean = true,
): BreakdownItem[] {
  const breakdown = Object.entries(MANULIFE_STANDING_NAMES).map(
    ([tierLevel, { level, grade }]) => ({
      level,
      grade,
      totalPractices: 0,
      averageScore: 0,
      backgroundColor: STANDING_COLORS[parseInt(tierLevel)]?.backgroundColor,
      textColor: STANDING_COLORS[parseInt(tierLevel)].textColor,
    }),
  );

  if (includeNoStanding) {
    breakdown.push({
      level: 'N/A',
      grade: 'No standing',
      totalPractices: 0,
      averageScore: 0,
      backgroundColor: '#F3F4F6',
      textColor: '#6B7280',
    });
  }

  return breakdown;
}

export function createMSIGStandingBreakdown(): BreakdownItem[] {
  const breakdown = Object.entries(MSIG_STANDING_NAMES).map(
    ([tierLevel, { level, grade }]) => ({
      level,
      grade,
      totalPractices: 0,
      averageScore: null,
      backgroundColor:
        MSIG_STANDING_COLORS[parseInt(tierLevel)].backgroundColor,
      textColor: MSIG_STANDING_COLORS[parseInt(tierLevel)].textColor,
    }),
  );

  breakdown.push({
    level: 'N/A',
    grade: 'Not available',
    totalPractices: 0,
    averageScore: null,
    backgroundColor: '#F3F4F6',
    textColor: '#6B7280',
  });

  return breakdown;
}

// ==================== COMMON STATISTICS ====================

export interface BasicStatistics {
  totalPractices: number;
  averageDurationMinutes: number;
  averageDurationSeconds: number;
  lastSessionDate: Date | null;
}

export function calculateBasicStatistics(sessions: any[]): BasicStatistics {
  const { averageDurationMinutes, averageDurationSeconds } =
    calculateSessionDurations(sessions);
  let lastSessionDate: Date | null = null;

  for (const session of sessions) {
    if (session.endedAt) {
      const sessionDate = new Date(session.endedAt);
      if (!lastSessionDate || sessionDate > lastSessionDate) {
        lastSessionDate = sessionDate;
      }
    }
  }

  return {
    totalPractices: sessions.length,
    averageDurationMinutes,
    averageDurationSeconds,
    lastSessionDate,
  };
}

// ==================== DATE RANGE UTILITIES ====================

export function buildDateRangeFilter(months: number) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);

  return {
    startDate,
    endDate,
    filter: {
      $gte: startDate,
      $lte: endDate,
    },
  };
}

// ==================== JSON PARSING UTILITIES ====================

export function parseJsonSafely(jsonString: string, defaultValue: any = {}) {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    return defaultValue;
  }
}

export async function validateUserAccess(userId: string, companyId: string) {
  const user = await User.findById(userId).lean();
  if (!user) {
    return { user: null, error: 'User not found' };
  }

  if (user.company?.toString() !== companyId) {
    return {
      user: null,
      error: 'Access denied: User does not belong to your company',
    };
  }

  return { user, error: null };
}

// ==================== FEEDBACK PARSING UTILITIES ====================

/**
 * Helper function to parse feedback scores from session
 */
export function parseFeedbackScores(session: any): {
  scores: {
    name: string;
    overallScore: number;
    maxScore: number;
    sectionType: string;
  }[];
  isValid: boolean;
  overallScore: number;
} {
  const scores = [];

  try {
    if (session?.assessmentType === 'prudential-ph-closing-call') {
      const closingCallTechnique = JSON.parse(
        String(session?.roleplay?.feedback?.prudentialPHClosingCallTechnique || '{}'),
      );
      const score = closingCallTechnique?.overallScore;
      if (score !== null && score !== undefined && !isNaN(score) && score >= 0) {
        scores.push({
          name: 'Closing Call Technique',
          overallScore: score,
          maxScore: 100,
          sectionType: 'closing-call-technique',
        });
      }
      const overallScore = scores.length > 0 ? scores[0].overallScore : 0;
      return { scores, overallScore, isValid: scores.length > 0 };
    }

    if (session?.roleplay?.feedback?.scorecards?.length > 0) {
      // Handle scorecards
      session.roleplay.feedback.scorecards.forEach((scorecard: any) => {
        if (
          scorecard.overallScore !== null &&
          scorecard.overallScore !== undefined &&
          !isNaN(scorecard.overallScore) &&
          scorecard.overallScore >= 0
        ) {
          scores.push({
            name: scorecard.name,
            overallScore: scorecard.overallScore,
            maxScore: scorecard.maxScore,
            sectionType: scorecard.sectionType,
          });
        }
      });
    } else {
      try {
        const salesTechnique = JSON.parse(
          String(session?.roleplay?.feedback?.salesTechniques || '{}'),
        );
        if (
          salesTechnique?.overallScore !== null &&
          salesTechnique?.overallScore !== undefined &&
          !isNaN(salesTechnique?.overallScore) &&
          salesTechnique?.overallScore >= 0
        ) {
          scores.push({
            name: 'Sales Technique',
            overallScore: salesTechnique.overallScore,
            maxScore: salesTechnique.maxScore,
            sectionType: 'sales-technique',
          });
        }
      } catch (e) {
        console.warn('Failed to parse salesTechniques', e);
      }

      try {
        const productKnowledge = JSON.parse(
          String(session?.roleplay?.feedback?.productKnowledge || '{}'),
        );
        if (
          productKnowledge?.overallScore !== null &&
          productKnowledge?.overallScore !== undefined &&
          !isNaN(productKnowledge?.overallScore) &&
          productKnowledge?.overallScore >= 0
        ) {
          scores.push({
            name: 'Product Knowledge',
            overallScore: productKnowledge.overallScore,
            maxScore: productKnowledge.maxScore,
            sectionType: 'product-knowledge',
          });
        }
      } catch (e) {
        console.warn('Failed to parse productKnowledge', e);
      }

      // Prudential PH Appointment Setting
      try {
        const appointmentSetting = JSON.parse(
          String(
            session?.roleplay?.feedback?.prudentialPHAppointmentSetting || '{}',
          ),
        );
        if (
          appointmentSetting?.overallScore !== null &&
          appointmentSetting?.overallScore !== undefined &&
          !isNaN(appointmentSetting?.overallScore) &&
          appointmentSetting?.overallScore >= 0
        ) {
          scores.push({
            name: 'Appointment Setting',
            overallScore: appointmentSetting.overallScore,
            maxScore: 100,
            sectionType: 'appointment-setting',
          });
        }
      } catch (e) {
        console.warn('Failed to parse prudentialPHAppointmentSetting', e);
      }

      // AIA KO End-to-End Outbound Call
      try {
        const aiaKoE2EAssessment = JSON.parse(
          String(
            session?.roleplay?.feedback?.aiaKoE2EAssessment || '{}',
          ),
        );
        if (
          aiaKoE2EAssessment?.overallScore !== null &&
          aiaKoE2EAssessment?.overallScore !== undefined &&
          !isNaN(aiaKoE2EAssessment?.overallScore) &&
          aiaKoE2EAssessment?.overallScore >= 0
        ) {
          scores.push({
            name: 'E2E Assessment',
            overallScore: aiaKoE2EAssessment.overallScore,
            maxScore: aiaKoE2EAssessment.maxScore || 100,
            sectionType: 'e2e-assessment',
          });
        }
      } catch (e) {
        console.warn('Failed to parse aiaKoE2EAssessment', e);
      }

    }

    const overallScore =
      scores.length > 0
        ? Math.round(
            scores.reduce((sum, score) => sum + score.overallScore, 0) /
              scores.length,
          )
        : 0;

    return {
      scores,
      overallScore,
      isValid: scores.length > 0,
    };
  } catch (error) {
    console.warn('Failed to parse feedback scores for session:', {
      sessionId: session._id?.toString() || 'unknown',
      error: error instanceof Error ? error.message : String(error),
    });

    return {
      scores: [],
      overallScore: 0,
      isValid: false,
    };
  }
}

// ==================== FORMATTING UTILITIES ====================

/**
 * Helper function to format call type name for display
 */
export function formatCallTypeName(callType: string): string {
  return (
    ALL_SALES_MODULES.find((module) => module.friendlyId === callType)?.title ||
    callType
  );
}

// ==================== CALCULATION UTILITIES ====================

/**
 * Helper function to calculate session duration in seconds
 * Returns the total time between startedAt and endedAt timestamps
 */
export function calculateSessionDuration(
  startedAt: Date | undefined,
  endedAt: Date | undefined,
): number {
  if (!startedAt || !endedAt) return 0;
  return Math.round(
    (new Date(endedAt).getTime() - new Date(startedAt).getTime()) / 1000,
  );
}

/**
 * Helper function to calculate grade from average score
 */
export function calculateGrade(averageScore: number): string {
  if (averageScore >= 80) return 'Excellent';
  if (averageScore >= 60) return 'Good';
  if (averageScore >= 40) return 'Fair';
  return 'Poor';
}

// ==================== FILTER UTILITIES ====================

/**
 * Helper function to build date filter
 */
export function buildDateFilter(dateFrom?: string, dateTo?: string) {
  const dateFilter: any = {};
  if (dateFrom) dateFilter.$gte = new Date(dateFrom);
  if (dateTo) dateFilter.$lte = new Date(dateTo);
  return dateFilter;
}

/**
 * Get user IDs that match the given company and team filters
 * This is a helper function to get filtered user IDs for use in other collections
 */
export async function getFilteredUserIds(companyId?: string, teams?: string[]) {
  if (!companyId && (!teams || teams.length === 0)) {
    return null; // No filtering needed
  }

  const userFilter = buildBaseUserFilter(companyId, teams);
  return await User.find(userFilter).distinct('_id');
}

/**
 * Updated getUserIdsForCompany to support team filtering
 * Excludes test users with @hupo.co emails who are not in the HUPO company
 */
export async function getUserIdsForCompany(
  companyId?: string,
  teams?: string[],
) {
  if (!companyId && (!teams || teams.length === 0)) {
    return null;
  }

  const userFilter = buildBaseUserFilter(companyId, teams);
  return await User.find(userFilter).distinct('_id');
}

// ==================== BULK OPERATIONS TYPES ====================

export interface BulkSessionsResult {
  /** Map of userId to their sessions */
  [userId: string]: SalesSessionDocument[];
}

export interface StandingInfo {
  level: string;
  grade: string;
  count: number;
}

export interface UserStatistics {
  totalPractices: number;
  averageDurationMinutes: number;
  averageDurationSeconds: number;
  averageScore: number | null;
  lastSessionDate: Date | null;
  standings?: StandingInfo[];
}

export interface BulkUserStatisticsResult {
  [userId: string]: UserStatistics;
}

// ==================== SESSION HISTORY TYPES ====================

export interface SessionHistoryItem {
  id: string;
  type: string;
  endedAt: Date;
  durationSeconds: number;
  productName: string | null;
  personaName: string | null;
  personaOccupation: string | null;
  score: number | null;
  standing: string | null;
  standingLevel: string | null;
  standingGrade: string | null;
  isTooBrief: boolean;
}

export interface SessionHistoryResult {
  sessions: SessionHistoryItem[];
  totalSessions: number;
}

/**
 * Shared helper function to fetch and group sessions by user for bulk operations
 *
 * @param userIds - Array of user IDs to fetch sessions for
 * @param companyId - Company ID to filter sessions by
 * @param module - Optional module filter
 * @param teams - Optional teams filter
 * @param assessmentType - Optional assessment type filter
 * @param extraFilters - Optional additional filters to merge with user filter
 * @returns Promise resolving to a map of userId -> sessions[]
 */
export async function getBulkSessionsByUser(
  userIds: string[],
  companyId: string,
  module?: string,
  teams?: string[],
  assessmentType?: string | string[],
  extraFilters?: Record<string, any>,
): Promise<BulkSessionsResult> {
  if (userIds.length === 0) {
    return {};
  }

  // Build session filter for all users at once
  const { sessionFilter } = await buildSessionFilterWithCompany({
    companyId,
    teams,
    module,
    assessmentType,
    additionalFilters: {
      user: { $in: userIds },
      ...(extraFilters || {}),
    },
  });

  // Get all sessions for all users in one query
  const sessions =
    await SalesSession.find(sessionFilter).lean<SalesSessionDocument[]>();

  // Group sessions by user
  const sessionsByUser: BulkSessionsResult = {};
  userIds.forEach((userId) => {
    sessionsByUser[userId] = [];
  });

  sessions.forEach((session) => {
    const userId = session.user.toString();
    if (sessionsByUser[userId]) {
      sessionsByUser[userId].push(session);
    }
  });

  return sessionsByUser;
}
// ==================== PROGRESS DATA UTILITIES ====================

export interface ProgressChart {
  name: string;
  data: number[];
  color: string;
}

export interface ProgressDataResult {
  months: string[];
  charts: ProgressChart[];
}

/**
 * Generic function to generate progress data for regular scoring system
 *
 * BUG FIX (ClickUp: https://app.clickup.com/t/86ewnd24b - Grab Report Self Serve):
 * - OLD BEHAVIOR: Grouped by `sectionType`, causing duplicate chart entries when
 *   the same scorecard name (e.g., "Sales Technique") appeared with different
 *   sectionTypes ('sales-technique' from legacy vs 'custom' from new scorecards).
 *   This created duplicate "Sales Technique" entries with different colors.
 *
 * - NEW BEHAVIOR: Groups by `name` instead to merge all scorecards with the same
 *   display name regardless of their sectionType. This ensures each scorecard name
 *   appears exactly once in the chart, preventing duplicates during legacy migrations.
 */
export function generateRegularProgressData(
  sessions: any[],
  months: number,
): ProgressDataResult {
  // Track unique scorecard names and their associated sectionTypes
  // name -> Set of sectionTypes (for color selection)
  const scorecardMap = new Map<string, Set<string>>();

  // Store monthly data grouped by scorecard name
  const monthlyData: Record<string, Record<string, number[]>> = {};

  const monthlyDataPoints = generateMonthlyDataPoints(months);

  // Initialize monthly data structure
  for (const dataPoint of monthlyDataPoints) {
    monthlyData[dataPoint.monthLabel] = {};
  }

  // Collect all scorecard types and populate data
  for (const session of sessions) {
    if (!session.endedAt) continue;

    const sessionDate = new Date(session.endedAt);
    const monthKey = sessionDate.toLocaleDateString('en-US', {
      month: 'short',
    });

    if (!monthlyData[monthKey]) continue;

    const { scores } = parseFeedbackScores(session);

    for (const score of scores) {
      // Track this scorecard name and its sectionTypes
      if (!scorecardMap.has(score.name)) {
        scorecardMap.set(score.name, new Set());
      }
      scorecardMap.get(score.name)!.add(score.sectionType);

      // Initialize array for this scorecard name if it doesn't exist
      if (!monthlyData[monthKey][score.name]) {
        monthlyData[monthKey][score.name] = [];
      }

      // Group scores by name instead of sectionType
      monthlyData[monthKey][score.name].push(score.overallScore);
    }
  }

  // Generate chart data for each unique scorecard name
  const monthLabels = monthlyDataPoints.map((point) => point.monthLabel);
  const charts = Array.from(scorecardMap.entries()).map(
    ([name, sectionTypes]) => {
      const data = monthLabels.map((month) => {
        const scores = monthlyData[month][name] || [];
        return scores.length > 0
          ? Math.round(
              scores.reduce((a: number, b: number) => a + b, 0) / scores.length,
            )
          : 0;
      });

      // Use the first sectionType for color assignment
      // This ensures consistent colors for migrated scorecards
      const primarySectionType = Array.from(sectionTypes)[0];

      return {
        name,
        data,
        color: getScorecardColor(primarySectionType),
      };
    },
  );

  return {
    months: monthLabels,
    charts,
  };
}

/**
 * V2 of generateRegularProgressData that generates zero-filled charts
 * based on module scorecards. Completely independent from generateRegularProgressData.
 * Module and Scenario are assumed to exist.
 *
 * Key differences from V1:
 * - Requires module and companyId parameters to determine expected scorecards
 * - Returns zero-filled charts for all scorecards defined in the module's scenarios
 * - Processes scorecard data directly from session.roleplay.feedback.scorecards
 */
export async function generateRegularProgressDataV2(
  companyId: string,
  months: number,
  module: string,
  sessions: any[],
): Promise<ProgressDataResult> {
  // Generate month labels
  const monthlyDataPoints = generateMonthlyDataPoints(months);
  const monthLabels = monthlyDataPoints.map((point) => point.monthLabel);

  try {
    // Return empty charts if module is not specified or is "all"
    if (!module || module === 'all') {
      return {
        months: monthLabels,
        charts: [],
      };
    }

    // Find the module by friendlyId
    const moduleDoc = await Module.findOne({ friendlyId: module }).lean();
    if (!moduleDoc) {
      return {
        months: monthLabels,
        charts: [],
      };
    }

    // Find all scenarios for this module and company
    const scenarios = await Scenario.find({
      module: moduleDoc._id,
      ...(companyId ? { company: companyId } : {}),
    })
      .populate('scorecard')
      .lean();

    if (!scenarios || scenarios.length === 0) {
      return {
        months: monthLabels,
        charts: [],
      };
    }

    // Extract all unique scorecard sections from scenarios
    // Map: scorecard name -> sectionType (for color assignment)
    const scorecardMap = new Map<string, string>();

    for (const scenario of scenarios) {
      const scorecard = scenario.scorecard as any;
      if (scorecard && scorecard.sections) {
        for (const section of scorecard.sections) {
          if (section.name && !scorecardMap.has(section.name)) {
            scorecardMap.set(section.name, section.sectionType || 'custom');
          }
        }
      }
    }

    // Initialize monthly data structure for each scorecard
    // Map: scorecard name -> Map: month label -> scores array
    const monthlyData: Record<string, Record<string, number[]>> = {};

    for (const scorecardName of scorecardMap.keys()) {
      monthlyData[scorecardName] = {};
      for (const dataPoint of monthlyDataPoints) {
        monthlyData[scorecardName][dataPoint.monthLabel] = [];
      }
    }

    // Process each session
    for (const session of sessions) {
      if (!session.endedAt) continue;

      const sessionDate = new Date(session.endedAt);
      const monthKey = sessionDate.toLocaleDateString('en-US', {
        month: 'short',
      });

      if (!monthlyData || !monthLabels.includes(monthKey)) continue;

      // Extract scorecards array from session
      const scorecards = session?.roleplay?.feedback?.scorecards;
      if (!Array.isArray(scorecards)) continue;

      // Process each scorecard in the session
      for (const scorecard of scorecards) {
        const { name, overallScore } = scorecard;

        // Only process if this scorecard is expected for this module
        if (
          name &&
          scorecardMap.has(name) &&
          overallScore !== null &&
          overallScore !== undefined &&
          !isNaN(overallScore) &&
          overallScore >= 0
        ) {
          monthlyData[name][monthKey].push(overallScore);
        }
      }
    }

    // Generate chart data for each scorecard
    const charts: ProgressChart[] = [];

    for (const [name, sectionType] of scorecardMap.entries()) {
      const data = monthLabels.map((month) => {
        const scores = monthlyData[name][month] || [];
        return scores.length > 0
          ? Math.round(
              scores.reduce((a: number, b: number) => a + b, 0) / scores.length,
            )
          : 0;
      });

      charts.push({
        name,
        data,
        color: getScorecardColor(sectionType),
      });
    }

    return {
      months: monthLabels,
      charts,
    };
  } catch (error) {
    console.error('Error in generateRegularProgressDataV2:', error);
    return {
      months: monthLabels,
      charts: [],
    };
  }
}

// Helper function to assign colors to scorecards
function getScorecardColor(sectionType: string): string {
  const colorMap: Record<string, string> = {
    'sales-technique': '#1C7AEB',
    'product-knowledge': '#058A62',
  };

  // Return predefined color or generate a color for custom scorecards
  return colorMap[sectionType] || generateColorForScorecard(sectionType);
}

// Generate consistent colors for custom scorecards
function generateColorForScorecard(sectionType: string): string {
  const colors = [
    '#9333EA', // Purple
    '#DC2626', // Red
    '#EA580C', // Orange
    '#CA8A04', // Yellow
    '#16A34A', // Green
    '#0891B2', // Cyan
    '#4F46E5', // Indigo
    '#DB2777', // Pink
  ];

  // Simple hash function to consistently assign colors
  let hash = 0;
  for (let i = 0; i < sectionType?.length; i++) {
    hash = sectionType.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
}

/**
 * Generic function to generate progress data for Prudential scoring system
 */
export function generatePrudentialProgressData(
  sessions: any[],
  months: number,
  module?: string,
): ProgressDataResult {
  const monthlyData: Record<
    string,
    {
      clientVerification: number[];
      frameworkExecution4C: number[];
      frameworkExecution3F: number[];
      objectionHandling: number[];
      productKnowledge: number[];
      operationalKnowledge: number[];
      counts: {
        clientVerification: number;
        frameworkExecution4C: number;
        frameworkExecution3F: number;
        objectionHandling: number;
        productKnowledge: number;
        operationalKnowledge: number;
      };
    }
  > = {};

  for (const session of sessions) {
    const monthKey = getSessionMonthKey(session);

    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = {
        clientVerification: [],
        frameworkExecution4C: [],
        frameworkExecution3F: [],
        objectionHandling: [],
        productKnowledge: [],
        operationalKnowledge: [],
        counts: {
          clientVerification: 0,
          frameworkExecution4C: 0,
          frameworkExecution3F: 0,
          objectionHandling: 0,
          productKnowledge: 0,
          operationalKnowledge: 0,
        },
      };
    }

    const feedback = session.roleplay?.feedback;
    if (!feedback) continue;

    const assessment = parseJsonSafely(feedback.salesTechniques || '{}');
    const technicalKnowledge = parseJsonSafely(
      feedback.technicalKnowledge || '{}',
    );

    const callType = session.callType || 'appointment-setting';
    const isColdCall = callType === 'cold-call';

    const frameworkExecution = assessment.frameworkExecution || {};
    if (frameworkExecution.overallScore !== undefined) {
      if (isColdCall) {
        // Cold call uses 4C framework
        monthlyData[monthKey].frameworkExecution4C.push(
          frameworkExecution.overallScore,
        );
        monthlyData[monthKey].counts.frameworkExecution4C++;
      } else {
        // Other modules use 3F framework
        monthlyData[monthKey].frameworkExecution3F.push(
          frameworkExecution.overallScore,
        );
        monthlyData[monthKey].counts.frameworkExecution3F++;
      }
    }

    // Objection Handling
    const objectionHandling = assessment.objectionHandling || {};
    if (objectionHandling.overallScore !== undefined) {
      monthlyData[monthKey].objectionHandling.push(
        objectionHandling.overallScore,
      );
      monthlyData[monthKey].counts.objectionHandling++;
    }

    // Client Verification (only for cold calls)
    if (isColdCall) {
      const clientVerification = assessment.clientVerification || {};
      if (clientVerification.completed !== undefined) {
        const score = clientVerification.completed ? 100 : 0;
        monthlyData[monthKey].clientVerification.push(score);
        monthlyData[monthKey].counts.clientVerification++;
      }
    } else {
      // Product Knowledge and Operational Knowledge (for non-cold-call modules)
      const productKnowledge = technicalKnowledge.productKnowledge || {};
      const operationalKnowledge =
        technicalKnowledge.operationalKnowledge || {};

      if (productKnowledge.overallScore !== undefined) {
        monthlyData[monthKey].productKnowledge.push(
          productKnowledge.overallScore,
        );
        monthlyData[monthKey].counts.productKnowledge++;
      }

      if (operationalKnowledge.overallScore !== undefined) {
        monthlyData[monthKey].operationalKnowledge.push(
          operationalKnowledge.overallScore,
        );
        monthlyData[monthKey].counts.operationalKnowledge++;
      }
    }
  }

  // Generate month labels and data arrays
  const monthlyDataPoints = generateMonthlyDataPoints(months);
  const monthLabels = monthlyDataPoints.map((point) => point.monthLabel);
  const clientVerificationScores = [];
  const frameworkExecution4CScores = [];
  const frameworkExecution3FScores = [];
  const objectionHandlingScores = [];
  const productKnowledgeScores = [];
  const operationalKnowledgeScores = [];

  for (const dataPoint of monthlyDataPoints) {
    // Get data for this month
    const monthData = monthlyData[dataPoint.monthKey];

    if (monthData) {
      // Calculate averages for each component
      const avgClientVerification =
        monthData.clientVerification.length > 0
          ? monthData.clientVerification.reduce(
              (sum, score) => sum + score,
              0,
            ) / monthData.clientVerification.length
          : 0;

      const avgFrameworkExecution4C =
        monthData.frameworkExecution4C.length > 0
          ? monthData.frameworkExecution4C.reduce(
              (sum, score) => sum + score,
              0,
            ) / monthData.frameworkExecution4C.length
          : 0;

      const avgFrameworkExecution3F =
        monthData.frameworkExecution3F.length > 0
          ? monthData.frameworkExecution3F.reduce(
              (sum, score) => sum + score,
              0,
            ) / monthData.frameworkExecution3F.length
          : 0;

      const avgObjectionHandling =
        monthData.objectionHandling.length > 0
          ? monthData.objectionHandling.reduce((sum, score) => sum + score, 0) /
            monthData.objectionHandling.length
          : 0;

      const avgProductKnowledge =
        monthData.productKnowledge.length > 0
          ? monthData.productKnowledge.reduce((sum, score) => sum + score, 0) /
            monthData.productKnowledge.length
          : 0;

      const avgOperationalKnowledge =
        monthData.operationalKnowledge.length > 0
          ? monthData.operationalKnowledge.reduce(
              (sum, score) => sum + score,
              0,
            ) / monthData.operationalKnowledge.length
          : 0;

      clientVerificationScores.push(Math.round(avgClientVerification));
      frameworkExecution4CScores.push(Math.round(avgFrameworkExecution4C));
      frameworkExecution3FScores.push(Math.round(avgFrameworkExecution3F));
      objectionHandlingScores.push(Math.round(avgObjectionHandling));
      productKnowledgeScores.push(Math.round(avgProductKnowledge));
      operationalKnowledgeScores.push(Math.round(avgOperationalKnowledge));
    } else {
      clientVerificationScores.push(0);
      frameworkExecution4CScores.push(0);
      frameworkExecution3FScores.push(0);
      objectionHandlingScores.push(0);
      productKnowledgeScores.push(0);
      operationalKnowledgeScores.push(0);
    }
  }

  const charts = [];

  const hasClientVerificationData = clientVerificationScores.some(
    (score) => score > 0,
  );
  if (hasClientVerificationData || module === 'cold-call') {
    charts.push({
      name: 'Client Verification',
      data: clientVerificationScores,
      color: '#058A62',
    });
  }

  const has4CData = frameworkExecution4CScores.some((score) => score > 0);
  if (has4CData || module === 'cold-call') {
    charts.push({
      name: '4C Execution',
      data: frameworkExecution4CScores,
      color: '#1C7AEB',
    });
  }

  const has3FData = frameworkExecution3FScores.some((score) => score > 0);
  if (has3FData || (module && module !== 'cold-call' && module !== 'all')) {
    charts.push({
      name: '3F Execution',
      data: frameworkExecution3FScores,
      color: '#1e40af',
    });
  }

  charts.push({
    name: 'Objection Handling',
    data: objectionHandlingScores,
    color: '#f97316',
  });

  const hasProductKnowledgeData = productKnowledgeScores.some(
    (score) => score > 0,
  );
  const hasOperationalKnowledgeData = operationalKnowledgeScores.some(
    (score) => score > 0,
  );

  if (
    hasProductKnowledgeData ||
    (module && module !== 'cold-call' && module !== 'all')
  ) {
    charts.push({
      name: 'Product Knowledge',
      data: productKnowledgeScores,
      color: '#8b5cf6',
    });
  }

  if (
    hasOperationalKnowledgeData ||
    (module && module !== 'cold-call' && module !== 'all')
  ) {
    charts.push({
      name: 'Operational Knowledge',
      data: operationalKnowledgeScores,
      color: '#ec4899',
    });
  }

  return {
    months: monthLabels,
    charts,
  };
}

/**
 * Generic function to generate progress data for Prudential scoring system
 */
export function generateManulifeProgressData(
  sessions: any[],
  months: number,
): ProgressDataResult {
  const monthlyData: Record<
    string,
    {
      // FNA sections
      introToManulife: number[];
      financialNeeds: number[];
      // GoalReady sections
      softSkills: number[];
      productKnowledge: number[];
      knowledgeSkills: number[];
      counts: {
        introToManulife: number;
        financialNeeds: number;
        softSkills: number;
        productKnowledge: number;
        knowledgeSkills: number;
      };
    }
  > = {};

  for (const session of sessions) {
    const monthKey = getSessionMonthKey(session);

    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = {
        introToManulife: [],
        financialNeeds: [],
        softSkills: [],
        productKnowledge: [],
        knowledgeSkills: [],
        counts: {
          introToManulife: 0,
          financialNeeds: 0,
          softSkills: 0,
          productKnowledge: 0,
          knowledgeSkills: 0,
        },
      };
    }

    const feedback = session.roleplay?.feedback;
    if (!feedback) continue;

    const assessment = parseJsonSafely(feedback.salesTechniques || '{}');
    const assessmentType = session.assessmentType;

    // Handle FNA sessions
    if (assessmentType === 'manulife') {
      const introToManulifeSection = assessment?.sections?.introduction;
      const introToManulifeScore =
        introToManulifeSection?.evaluations?.filter((c: any) => c.pass === true)
          ?.length ?? null;
      if (introToManulifeScore !== null) {
        monthlyData[monthKey].introToManulife.push(introToManulifeScore);
        monthlyData[monthKey].counts.introToManulife++;
      }

      const financialNeedsSection = assessment?.sections?.financialNeeds;
      const financialNeedsScore =
        financialNeedsSection?.evaluations?.filter((c: any) => c.pass === true)
          ?.length ?? null;
      if (financialNeedsScore !== null) {
        monthlyData[monthKey].financialNeeds.push(financialNeedsScore);
        monthlyData[monthKey].counts.financialNeeds++;
      }
    }
    // Handle GoalReady sessions
    else if (assessmentType === 'manulife-goalready') {
      // GoalReady uses different feedback fields with scores (max 100 each)
      const softSkillsData = parseJsonSafely(
        feedback.manulifeSoftSkills || '{}',
      );
      const softSkillsScore = softSkillsData?.score;
      if (
        softSkillsScore !== null &&
        softSkillsScore !== undefined &&
        !isNaN(softSkillsScore)
      ) {
        monthlyData[monthKey].softSkills.push(softSkillsScore);
        monthlyData[monthKey].counts.softSkills++;
      }

      const productKnowledgeData = parseJsonSafely(
        feedback.manulifeProductKnowledge || '{}',
      );
      const productKnowledgeScore = productKnowledgeData?.score;
      if (
        productKnowledgeScore !== null &&
        productKnowledgeScore !== undefined &&
        !isNaN(productKnowledgeScore)
      ) {
        monthlyData[monthKey].productKnowledge.push(productKnowledgeScore);
        monthlyData[monthKey].counts.productKnowledge++;
      }

      const salesAndNegotiationData = parseJsonSafely(
        feedback.manulifeSalesAndNegotiationSkills || '{}',
      );
      const salesAndNegotiationScore = salesAndNegotiationData?.score;
      if (
        salesAndNegotiationScore !== null &&
        salesAndNegotiationScore !== undefined &&
        !isNaN(salesAndNegotiationScore)
      ) {
        monthlyData[monthKey].knowledgeSkills.push(salesAndNegotiationScore);
        monthlyData[monthKey].counts.knowledgeSkills++;
      }
    }
  }

  // Generate month labels and data arrays
  const monthlyDataPoints = generateMonthlyDataPoints(months);
  const monthLabels = monthlyDataPoints.map((point) => point.monthLabel);
  const introToManulifeScores = [];
  const financialNeedsScores = [];
  const softSkillsScores = [];
  const productKnowledgeScores = [];
  const knowledgeSkillsScores = [];

  for (const dataPoint of monthlyDataPoints) {
    // Get data for this month
    const monthData = monthlyData[dataPoint.monthKey];

    if (monthData) {
      // Calculate averages for FNA components
      const avgIntroToManulife =
        monthData.introToManulife.length > 0
          ? monthData.introToManulife.reduce((sum, score) => sum + score, 0) /
            monthData.introToManulife.length
          : 0;

      const avgFinancialNeeds =
        monthData.financialNeeds.length > 0
          ? monthData.financialNeeds.reduce((sum, score) => sum + score, 0) /
            monthData.financialNeeds.length
          : 0;

      // Calculate averages for GoalReady components
      const avgSoftSkills =
        monthData.softSkills.length > 0
          ? monthData.softSkills.reduce((sum, score) => sum + score, 0) /
            monthData.softSkills.length
          : 0;

      const avgProductKnowledge =
        monthData.productKnowledge.length > 0
          ? monthData.productKnowledge.reduce((sum, score) => sum + score, 0) /
            monthData.productKnowledge.length
          : 0;

      const avgKnowledgeSkills =
        monthData.knowledgeSkills.length > 0
          ? monthData.knowledgeSkills.reduce((sum, score) => sum + score, 0) /
            monthData.knowledgeSkills.length
          : 0;

      introToManulifeScores.push(Math.round(avgIntroToManulife));
      financialNeedsScores.push(Math.round(avgFinancialNeeds));
      softSkillsScores.push(Math.round(avgSoftSkills));
      productKnowledgeScores.push(Math.round(avgProductKnowledge));
      knowledgeSkillsScores.push(Math.round(avgKnowledgeSkills));
    } else {
      introToManulifeScores.push(0);
      financialNeedsScores.push(0);
      softSkillsScores.push(0);
      productKnowledgeScores.push(0);
      knowledgeSkillsScores.push(0);
    }
  }
  const charts = [];

  // FNA charts
  const hasIntroToManulifeData = introToManulifeScores.some(
    (score) => score > 0,
  );
  if (hasIntroToManulifeData) {
    charts.push({
      name: 'Introduction to Manulife & Facts of Life',
      data: introToManulifeScores,
      color: '#058A62',
    });
  }

  const hasFinancialNeedsData = financialNeedsScores.some((score) => score > 0);
  if (hasFinancialNeedsData) {
    charts.push({
      name: 'Financial Needs, Goal Guide and Conclusion',
      data: financialNeedsScores,
      color: '#1C7AEB',
    });
  }

  // GoalReady charts
  const hasSoftSkillsData = softSkillsScores.some((score) => score > 0);
  if (hasSoftSkillsData) {
    charts.push({
      name: 'Soft Skills',
      data: softSkillsScores,
      color: '#058A62',
    });
  }

  const hasProductKnowledgeData = productKnowledgeScores.some(
    (score) => score > 0,
  );
  if (hasProductKnowledgeData) {
    charts.push({
      name: 'Product Knowledge',
      data: productKnowledgeScores,
      color: '#1C7AEB',
    });
  }

  const hasKnowledgeSkillsData = knowledgeSkillsScores.some(
    (score) => score > 0,
  );
  if (hasKnowledgeSkillsData) {
    charts.push({
      name: 'Sales & Negotiation Skills',
      data: knowledgeSkillsScores,
      color: '#F59E0B',
    });
  }

  return {
    months: monthLabels,
    charts,
  };
}

// ==================== PRACTICE BREAKDOWN UTILITIES ====================

export interface PracticeBreakdownItem {
  type: string;
  productName?: string | null;
  totalPractices: number;
  averageScore: number | null;
  grade?: string;
  bestScore?: {
    level: string;
    grade: string;
    score: number;
    backgroundColor: string;
    textColor: string;
  } | null;
  bestStanding?: {
    standing: string;
    tierLevel: number;
    backgroundColor: string;
    textColor: string;
  } | null;
  breakdown: BreakdownItem[];
}

/**
 * Generic function to generate practice breakdown for regular scoring system
 */

/**
 * Normalizes a product friendlyId by removing the nanoid suffix if present.
 * This ensures that products with and without suffixes are grouped together.
 * E.g., "grab-for-business-P7Zm3K" -> "grab-for-business"
 *      "grab-for-business" -> "grab-for-business"
 *
 * Only applies to Grab companies where products were migrated from constants to seeded data.
 * Uses a whitelist of known Grab product bases to avoid false positives.
 */
export function normalizeProductFriendlyId(
  friendlyId: string,
  companyId?: string,
): string {
  if (!friendlyId || friendlyId === 'no-product') {
    return friendlyId;
  }

  // Only normalize for Grab companies
  const isGrabCompany =
    companyId === GRAB_COMPANY_ID || companyId === GRAB_TEST_COMPANY_ID;

  if (!isGrabCompany) {
    return friendlyId;
  }

  // Known Grab product bases that may have nanoid suffixes
  // From src/seeder/grab/constants.ts PRODUCT_MODULE_MAPPING
  const GRAB_PRODUCT_BASES = ['grab-for-business', 'grab-mex-campaigns'];

  const parts = friendlyId.split('-');
  if (parts.length === 0) return friendlyId;

  const lastPart = parts[parts.length - 1];
  const baseWithoutSuffix = parts.slice(0, -1).join('-');

  // Only remove suffix if:
  // 1. Last part looks like a nanoid (6 alphanumeric characters)
  // 2. The base (without suffix) matches a known Grab product
  if (
    lastPart &&
    lastPart.length === 6 &&
    /^[a-zA-Z0-9]+$/.test(lastPart) &&
    GRAB_PRODUCT_BASES.includes(baseWithoutSuffix)
  ) {
    return baseWithoutSuffix;
  }

  return friendlyId;
}

export function generateRegularPracticeBreakdown(
  sessions: any[],
  companyId?: string,
  languageCode: string = 'en',
  standings: any[] = [],
): PracticeBreakdownItem[] {
  const practiceBreakdown: Record<
    string,
    {
      totalPractices: number;
      totalScore: number;
      scoreCount: number;
      productName?: string;
      bestScore?: number;
      actualProductFriendlyId?: string; // Track the first actual friendlyId for lookup
      breakdown: {
        grade: string;
        totalPractices: number;
        totalScore: number;
        scoreCount: number;
      }[];
    }
  > = {};

  for (const session of sessions) {
    const callType =
      session?.scenario?.module?.title ?? (session.callType || 'unknown');
    const rawProductFriendlyId =
      (session.product as any)?.friendlyId || 'no-product';
    const productName = (session.product as any)?.name || 'N/A';

    // Normalize the product friendlyId to remove nanoid suffixes (only for Grab)
    const productFriendlyId = normalizeProductFriendlyId(
      rawProductFriendlyId,
      companyId,
    );
    const key = `${callType}::${productFriendlyId}`;

    if (!practiceBreakdown[key]) {
      practiceBreakdown[key] = {
        totalPractices: 0,
        totalScore: 0,
        scoreCount: 0,
        productName: productName !== 'N/A' ? productName : undefined,
        actualProductFriendlyId: rawProductFriendlyId, // Store the actual friendlyId
        bestScore: undefined,
        breakdown: createGradeBreakdown().map((item) => ({
          grade: item.grade,
          totalPractices: 0,
          totalScore: 0,
          scoreCount: 0,
        })),
      };
    }

    practiceBreakdown[key].totalPractices++;

    const { overallScore, isValid } = parseFeedbackScores(session);

    if (isValid) {
      practiceBreakdown[key].totalScore += overallScore!;

      practiceBreakdown[key].scoreCount++;

      if (
        !practiceBreakdown[key].bestScore ||
        (overallScore && overallScore > practiceBreakdown[key].bestScore!)
      ) {
        practiceBreakdown[key].bestScore = overallScore;
      }

      const grade = calculateGrade(overallScore);

      const gradeData = practiceBreakdown[key].breakdown.find(
        (b) => b.grade === grade,
      );
      if (gradeData) {
        gradeData.totalPractices++;
        gradeData.totalScore += overallScore!;
        gradeData.scoreCount++;
      }
    }
  }

  return Object.entries(practiceBreakdown)
    .map(([key, stats]) => {
      const [callType, productFriendlyId] = key.split('::', 2);

      // Look up the product by friendlyId to get the localized name
      // Use the actual friendlyId from the first session in the group
      let localizedProductName = stats.productName;
      if (
        stats.actualProductFriendlyId &&
        stats.actualProductFriendlyId !== 'no-product' &&
        companyId
      ) {
        try {
          const product = getProductByFriendlyId(
            companyId,
            stats.actualProductFriendlyId,
            languageCode,
          );
          localizedProductName = product.name;
        } catch (error) {
          // If product lookup fails, fall back to the stored name
        }
      }

      const averageScore =
        stats.scoreCount > 0
          ? Math.round(stats.totalScore / stats.scoreCount)
          : 0;

      const breakdown = stats.breakdown
        .map((gradeStats) => {
          const gradeAvgScore =
            gradeStats.scoreCount > 0
              ? Math.round(gradeStats.totalScore / gradeStats.scoreCount)
              : 0;

          const colors =
            GRADE_COLORS[gradeStats.grade as keyof typeof GRADE_COLORS];

          return {
            level: GRADE_LEVELS[gradeStats.grade as keyof typeof GRADE_LEVELS],
            grade: gradeStats.grade,
            totalPractices: gradeStats.totalPractices,
            averageScore: gradeAvgScore,
            backgroundColor: colors.backgroundColor,
            textColor: colors.textColor,
          };
        })
        .sort((a, b) => (a.level || '').localeCompare(b.level || ''));

      const bestScore = stats.bestScore
        ? (() => {
            const grade = calculateGrade(stats.bestScore);
            const colors = GRADE_COLORS[grade as keyof typeof GRADE_COLORS];
            return {
              level: GRADE_LEVELS[grade as keyof typeof GRADE_LEVELS],
              grade,
              score: stats.bestScore,
              backgroundColor: colors.backgroundColor,
              textColor: colors.textColor,
            };
          })()
        : null;

      return {
        type: formatCallTypeName(callType),
        productName: localizedProductName,
        totalPractices: stats.totalPractices,
        averageScore:
          stats.scoreCount > 0 ? Math.round(averageScore * 10) / 10 : null,
        grade: calculateGrade(averageScore),
        bestScore,
        breakdown,
      };
    })
    .sort((a, b) => b.totalPractices - a.totalPractices);
}

/**
 * Generic function to generate practice breakdown for Prudential scoring system
 */
export function generatePrudentialPracticeBreakdown(
  sessions: any[],
  standings: any[],
  companyId?: string,
  languageCode: string = 'en',
): PracticeBreakdownItem[] {
  const practiceBreakdown: Record<
    string,
    {
      totalPractices: number;
      tierCounts: Record<number, number>;
      productName?: string;
      bestStanding?: {
        tierName: string;
        tierLevel: number;
      };
    }
  > = {};

  for (const session of sessions) {
    const callType = session.callType || 'unknown';
    const productFriendlyId =
      (session.product as any)?.friendlyId || 'no-product';
    const productName = (session.product as any)?.name || 'N/A';
    const key = `${callType}::${productFriendlyId}`;

    if (!practiceBreakdown[key]) {
      practiceBreakdown[key] = {
        totalPractices: 0,
        tierCounts: { 1: 0, 2: 0, 3: 0 },
        productName: productName !== 'N/A' ? productName : undefined,
        bestStanding: undefined,
      };
    }

    practiceBreakdown[key].totalPractices++;
  }

  for (const standing of standings) {
    const session = standing.session as any;
    const callType = session?.callType || 'unknown';
    const productFriendlyId = session?.product?.friendlyId || 'no-product';
    const key = `${callType}::${productFriendlyId}`;

    if (practiceBreakdown[key]) {
      practiceBreakdown[key].tierCounts[standing.tierLevel] =
        (practiceBreakdown[key].tierCounts[standing.tierLevel] || 0) + 1;

      if (
        !practiceBreakdown[key].bestStanding ||
        standing.tierLevel > practiceBreakdown[key].bestStanding!.tierLevel
      ) {
        practiceBreakdown[key].bestStanding = {
          tierName: standing.tierName,
          tierLevel: standing.tierLevel,
        };
      }
    }
  }

  return Object.entries(practiceBreakdown)
    .map(([key, data]) => {
      const [callType, productFriendlyId] = key.split('::', 2);

      // Look up the product by friendlyId to get the localized name
      let localizedProductName = data.productName;
      if (
        productFriendlyId &&
        productFriendlyId !== 'no-product' &&
        companyId
      ) {
        try {
          const product = getProductByFriendlyId(
            companyId,
            productFriendlyId,
            languageCode,
          );
          localizedProductName = product.name;
        } catch (error) {
          // If product lookup fails, fall back to the stored name
        }
      }

      const sessionsWithStanding =
        data.tierCounts[1] + data.tierCounts[2] + data.tierCounts[3];
      const sessionsWithoutStanding =
        data.totalPractices - sessionsWithStanding;

      const breakdown = createStandingBreakdown(true).map((item, index) => {
        if (item.level === 'N/A') {
          return {
            ...item,
            totalPractices: sessionsWithoutStanding,
          };
        } else {
          const tierLevel = index + 1;
          return {
            ...item,
            totalPractices: data.tierCounts[tierLevel] || 0,
          };
        }
      });

      return {
        type: formatCallTypeName(callType),
        productName: localizedProductName,
        totalPractices: data.totalPractices,
        averageScore: null,
        grade: 'Standings-based',
        bestStanding: data.bestStanding
          ? (() => {
              const colors = STANDING_COLORS[data.bestStanding.tierLevel];
              return {
                standing: data.bestStanding.tierName,
                tierLevel: data.bestStanding.tierLevel,
                backgroundColor: colors.backgroundColor,
                textColor: colors.textColor,
              };
            })()
          : null,
        breakdown,
      };
    })
    .sort((a, b) => b.totalPractices - a.totalPractices);
}

/**
 * Generic function to generate practice breakdown for manulife scoring system
 * Supports both FNA and GoalReady assessment types
 */
export function generateManulifePracticeBreakdown(
  sessions: any[],
  languageCode: string = 'en',
  companyId?: string,
): PracticeBreakdownItem[] {
  const practiceBreakdown: Record<
    string,
    {
      totalPractices: number;
      tierData: Record<number, { count: number; totalScore: number }>;
      totalScore: number;
      productName?: string;
      assessmentType?: string;
      bestStanding?: {
        tierName: string;
        tierLevel: number;
      } | null;
    }
  > = {};

  for (const session of sessions) {
    const callType = session.callType || 'unknown';
    const assessmentType = session.assessmentType;
    const productName = (session.product as any)?.name || 'N/A';
    const productFriendlyId = (session.product as any)?.friendlyId || 'N/A';
    const key = `${callType}::${productFriendlyId}`;

    // Calculate score based on assessment type
    let sessionScore = 0;
    let tierName = '';
    let tierLevel = 0;
    let hasValidData = false;

    if (assessmentType === 'manulife') {
      // FNA assessment - use salesTechniques sections
      const salesTechniques = parseJsonSafely(
        session.roleplay.feedback.salesTechniques,
      );
      const sections = salesTechniques?.sections;
      sessionScore = calculateManulifeOverallScore(sections);

      if (sections) {
        tierName = getManulifeTierName(sections, languageCode);
        tierLevel = getManulifeTierLevel(tierName);
        hasValidData = true;
      }
    } else if (assessmentType === 'manulife-goalready') {
      // GoalReady assessment - use three separate feedback fields
      sessionScore = calculateGoalReadyOverallScore(session);

      if (sessionScore > 0) {
        tierName = getGoalReadyTierName(sessionScore, languageCode);
        tierLevel = getGoalReadyTierLevel(tierName);
        hasValidData = true;
      }
    }

    if (!practiceBreakdown[key]) {
      practiceBreakdown[key] = {
        totalPractices: 0,
        totalScore: 0,
        tierData: {
          0: { count: 0, totalScore: 0 }, // No standing
          1: { count: 0, totalScore: 0 },
          2: { count: 0, totalScore: 0 },
          3: { count: 0, totalScore: 0 },
        },
        productName: productName !== 'N/A' ? productName : undefined,
        assessmentType,
        bestStanding: undefined,
      };
    }

    practiceBreakdown[key].totalPractices++;
    practiceBreakdown[key].totalScore += sessionScore;

    if (hasValidData) {
      // Track count and score for this tier
      practiceBreakdown[key].tierData[tierLevel].count++;
      practiceBreakdown[key].tierData[tierLevel].totalScore += sessionScore;

      if (
        !practiceBreakdown[key].bestStanding ||
        tierLevel > practiceBreakdown[key].bestStanding!.tierLevel
      ) {
        practiceBreakdown[key].bestStanding = {
          tierName,
          tierLevel,
        };
      }
    } else {
      // Session without standing - GoalReady has no tier 0, use tier 1 instead
      const fallbackTier = assessmentType === 'manulife-goalready' ? 1 : 0;
      practiceBreakdown[key].tierData[fallbackTier].count++;
      practiceBreakdown[key].tierData[fallbackTier].totalScore += sessionScore;
    }
  }

  return Object.entries(practiceBreakdown)
    .map(([key, data]) => {
      const [callType, productFriendlyId] = key.split('::', 2);

      // Look up the product by friendlyId to get the localized name
      let localizedProductName = data.productName;
      if (
        productFriendlyId &&
        productFriendlyId !== 'no-product' &&
        companyId
      ) {
        try {
          const product = getProductByFriendlyId(
            companyId,
            productFriendlyId,
            languageCode,
          );
          localizedProductName = product.name;
        } catch (error) {
          // If product lookup fails, fall back to the stored name
        }
      }

      const isGoalReady = data.assessmentType === 'manulife-goalready';
      const breakdown = createManulifeStandingBreakdown(!isGoalReady).map(
        (item, index) => {
          if (item.level === 'N/A') {
            // Tier 0 - No standing
            const tierData = data.tierData[0];
            return {
              ...item,
              totalPractices: tierData.count,
              averageScore:
                tierData.count > 0
                  ? Math.round(tierData.totalScore / tierData.count)
                  : 0,
            };
          } else {
            // Tiers 1, 2, 3
            const tierLevel = index + 1;
            const tierData = data.tierData[tierLevel];
            return {
              ...item,
              totalPractices: tierData.count,
              averageScore:
                tierData.count > 0
                  ? Math.round(tierData.totalScore / tierData.count)
                  : 0,
            };
          }
        },
      );

      return {
        type: formatCallTypeName(callType),
        productName: localizedProductName,
        totalPractices: data.totalPractices,
        averageScore: Math.round(data.totalScore / data.totalPractices),
        grade: 'Standings-based',
        bestStanding: data.bestStanding
          ? (() => {
              const colors = STANDING_COLORS[data.bestStanding.tierLevel];
              return {
                standing: data.bestStanding.tierName,
                tierLevel: data.bestStanding.tierLevel,
                backgroundColor: colors?.backgroundColor,
                textColor: colors?.textColor,
              };
            })()
          : null,
        breakdown,
      };
    })
    .sort((a, b) => b.totalPractices - a.totalPractices);
}

export function calculateOverallAverageScore(sessions: SalesSessionDocument[]) {
  let totalScore = 0;
  let sessionCount = 0;

  for (const session of sessions) {
    const { overallScore, isValid } = parseFeedbackScores(session);

    if (isValid && overallScore !== null) {
      totalScore += overallScore;
      sessionCount++;
    }
  }

  const overallAverageScore =
    sessionCount > 0 ? Math.round(totalScore / sessionCount) : 0;

  return {
    overallAverageScore,
  };
}
