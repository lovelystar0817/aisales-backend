import { Types } from 'mongoose';
import { ManageUser } from '../../models/ManageUser.js';
import { User } from '../../models/User.js';
import { Team } from '../../models/Team.js';
import { ParsedRow } from './excelParser.js';
import { IBulkInviteItem } from '../../models/BulkInvite.js';

const VALID_ROLES = ['superadmin', 'admin', 'user'];

export interface ValidationContext {
  company: Types.ObjectId;
  existingEmails: Set<string>;
  teamsByName: Map<string, Types.ObjectId>;
}

export async function prepareValidationContext(
  company: Types.ObjectId,
): Promise<ValidationContext> {
  // Fetch all existing emails (case insensitive)
  const [manageUsers, users, teams] = await Promise.all([
    ManageUser.find({ company, isDeleted: { $ne: true } }, { email: 1 }).lean(),
    User.find({ company, isDeleted: { $ne: true } }, { email: 1 }).lean(),
    Team.find({ company }, { name: 1 }).lean(),
  ]);

  const existingEmails = new Set<string>();
  manageUsers.forEach((u) => {
    if (u.email) existingEmails.add(u.email.toLowerCase());
  });
  users.forEach((u) => {
    if (u.email) existingEmails.add(u.email.toLowerCase());
  });

  const teamsByName = new Map<string, Types.ObjectId>();
  teams.forEach((t) => {
    teamsByName.set(t.name.toLowerCase().trim(), t._id);
  });

  return {
    company,
    existingEmails,
    teamsByName,
  };
}

export function validateRow(
  row: ParsedRow,
  context: ValidationContext,
): IBulkInviteItem {
  const errors: string[] = [];

  // Validate email is not empty
  const normalizedEmail = row.email.toLowerCase().trim();
  if (!normalizedEmail) {
    errors.push('Email is required');
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (normalizedEmail && !emailRegex.test(normalizedEmail)) {
    errors.push('Invalid email format');
  }

  // Check if email already exists
  if (normalizedEmail && context.existingEmails.has(normalizedEmail)) {
    errors.push('Email already exists in the system');
  }

  // Validate role is not empty
  const normalizedRole = row.role.toLowerCase().trim();
  if (!normalizedRole) {
    errors.push('Role is required');
  } else if (!VALID_ROLES.includes(normalizedRole)) {
    errors.push(`Invalid role. Must be one of: ${VALID_ROLES.join(', ')}`);
  }

  // Validate and parse teams
  // If role is superadmin, teams should be empty
  const teamNames: string[] = [];
  if (normalizedRole === 'superadmin') {
    // Superadmin should not have teams, leave empty
  } else if (row.team) {
    const teams = row.team
      .split(';')
      .map((t) => t.trim())
      .filter((t) => t);

    for (const teamName of teams) {
      // Clean team name: only alphanumeric and spaces
      const cleanedTeamName = teamName.replace(/[^a-zA-Z0-9\s]/g, '').trim();

      if (!cleanedTeamName) {
        errors.push(`Invalid team name: "${teamName}"`);
        continue;
      }

      // Check if team exists
      if (!context.teamsByName.has(cleanedTeamName.toLowerCase())) {
        errors.push(`Team not found: "${cleanedTeamName}"`);
      } else {
        teamNames.push(cleanedTeamName);
      }
    }
  }

  return {
    rowNumber: row.rowNumber,
    email: normalizedEmail,
    role: normalizedRole as 'superadmin' | 'admin' | 'user',
    teamNames,
    isValid: errors.length === 0,
    validationErrors: errors,
    emailSent: false,
    retryCount: 0,
  };
}

export async function validateAllRows(
  rows: ParsedRow[],
  company: Types.ObjectId,
): Promise<IBulkInviteItem[]> {
  const context = await prepareValidationContext(company);

  // Track emails within this import to detect duplicates
  const emailsInImport = new Set<string>();

  return rows.map((row) => {
    const item = validateRow(row, context);

    // Check for duplicate within the same import
    if (emailsInImport.has(item.email)) {
      item.isValid = false;
      item.validationErrors.push('Duplicate email in this import');
    } else {
      emailsInImport.add(item.email);
      // Add to context for subsequent rows
      context.existingEmails.add(item.email);
    }

    return item;
  });
}
