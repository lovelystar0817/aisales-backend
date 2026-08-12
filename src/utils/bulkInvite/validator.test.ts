import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Types } from 'mongoose';
import {
  prepareValidationContext,
  validateRow,
  validateAllRows,
} from './validator.js';
import { ManageUser } from '../../models/ManageUser.js';
import { User } from '../../models/User.js';
import { Team } from '../../models/Team.js';
import { ParsedRow } from './excelParser.js';

vi.mock('../../models/ManageUser.js');
vi.mock('../../models/User.js');
vi.mock('../../models/Team.js');

describe('validator', () => {
  const companyId = new Types.ObjectId();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('prepareValidationContext', () => {
    it('should prepare validation context with existing emails and teams', async () => {
      const mockManageUsers = [
        { email: 'admin1@example.com' },
        { email: 'admin2@example.com' },
      ];

      const mockUsers = [
        { email: 'user1@example.com' },
        { email: 'user2@example.com' },
      ];

      const mockTeams = [
        { _id: new Types.ObjectId(), name: 'Sales' },
        { _id: new Types.ObjectId(), name: 'Marketing' },
      ];

      vi.mocked(ManageUser.find).mockReturnValue({
        lean: vi.fn().mockResolvedValue(mockManageUsers),
      } as any);

      vi.mocked(User.find).mockReturnValue({
        lean: vi.fn().mockResolvedValue(mockUsers),
      } as any);

      vi.mocked(Team.find).mockReturnValue({
        lean: vi.fn().mockResolvedValue(mockTeams),
      } as any);

      const context = await prepareValidationContext(companyId);

      expect(context.company).toBe(companyId);
      expect(context.existingEmails.has('admin1@example.com')).toBe(true);
      expect(context.existingEmails.has('admin2@example.com')).toBe(true);
      expect(context.existingEmails.has('user1@example.com')).toBe(true);
      expect(context.existingEmails.has('user2@example.com')).toBe(true);
      expect(context.teamsByName.has('sales')).toBe(true);
      expect(context.teamsByName.has('marketing')).toBe(true);
    });

    it('should handle case insensitive emails', async () => {
      const mockManageUsers = [{ email: 'Admin@Example.COM' }];
      const mockUsers = [{ email: 'User@EXAMPLE.com' }];

      vi.mocked(ManageUser.find).mockReturnValue({
        lean: vi.fn().mockResolvedValue(mockManageUsers),
      } as any);

      vi.mocked(User.find).mockReturnValue({
        lean: vi.fn().mockResolvedValue(mockUsers),
      } as any);

      vi.mocked(Team.find).mockReturnValue({
        lean: vi.fn().mockResolvedValue([]),
      } as any);

      const context = await prepareValidationContext(companyId);

      expect(context.existingEmails.has('admin@example.com')).toBe(true);
      expect(context.existingEmails.has('user@example.com')).toBe(true);
    });
  });

  describe('validateRow', () => {
    let context: Awaited<ReturnType<typeof prepareValidationContext>>;

    beforeEach(async () => {
      const salesTeamId = new Types.ObjectId();
      const marketingTeamId = new Types.ObjectId();

      context = {
        company: companyId,
        existingEmails: new Set(['existing@example.com']),
        teamsByName: new Map([
          ['sales', salesTeamId],
          ['marketing', marketingTeamId],
        ]),
      };
    });

    it('should validate a valid row', () => {
      const row: ParsedRow = {
        rowNumber: 6,
        email: 'newuser@example.com',
        role: 'admin',
        team: 'Sales',
      };

      const result = validateRow(row, context);

      expect(result.isValid).toBe(true);
      expect(result.validationErrors).toHaveLength(0);
      expect(result.email).toBe('newuser@example.com');
      expect(result.role).toBe('admin');
      expect(result.teamNames).toEqual(['Sales']);
    });

    it('should reject empty email', () => {
      const row: ParsedRow = {
        rowNumber: 6,
        email: '',
        role: 'admin',
        team: 'Sales',
      };

      const result = validateRow(row, context);

      expect(result.isValid).toBe(false);
      expect(result.validationErrors).toContain('Email is required');
    });

    it('should reject invalid email format', () => {
      const row: ParsedRow = {
        rowNumber: 6,
        email: 'invalid-email',
        role: 'admin',
        team: 'Sales',
      };

      const result = validateRow(row, context);

      expect(result.isValid).toBe(false);
      expect(result.validationErrors).toContain('Invalid email format');
    });

    it('should reject existing email', () => {
      const row: ParsedRow = {
        rowNumber: 6,
        email: 'existing@example.com',
        role: 'admin',
        team: 'Sales',
      };

      const result = validateRow(row, context);

      expect(result.isValid).toBe(false);
      expect(result.validationErrors).toContain(
        'Email already exists in the system',
      );
    });

    it('should reject empty role', () => {
      const row: ParsedRow = {
        rowNumber: 6,
        email: 'user@example.com',
        role: '',
        team: 'Sales',
      };

      const result = validateRow(row, context);

      expect(result.isValid).toBe(false);
      expect(result.validationErrors).toContain('Role is required');
    });

    it('should reject invalid role', () => {
      const row: ParsedRow = {
        rowNumber: 6,
        email: 'user@example.com',
        role: 'invalid_role',
        team: 'Sales',
      };

      const result = validateRow(row, context);

      expect(result.isValid).toBe(false);
      expect(result.validationErrors).toContain(
        'Invalid role. Must be one of: superadmin, admin, user',
      );
    });

    it('should accept all valid roles', () => {
      const roles = ['admin', 'user'];

      roles.forEach((role) => {
        const row: ParsedRow = {
          rowNumber: 6,
          email: `${role}@example.com`,
          role,
          team: 'Sales',
        };

        const result = validateRow(row, context);

        expect(result.isValid).toBe(true);
        expect(result.role).toBe(role);
        expect(result.teamNames).toEqual(['Sales']);
      });
    });

    it('should accept superadmin role and ignore teams', () => {
      const row: ParsedRow = {
        rowNumber: 6,
        email: 'superadmin@example.com',
        role: 'superadmin',
        team: 'Sales',
      };

      const result = validateRow(row, context);

      expect(result.isValid).toBe(true);
      expect(result.role).toBe('superadmin');
      expect(result.teamNames).toEqual([]);
    });

    it('should handle case insensitive role validation', () => {
      const row: ParsedRow = {
        rowNumber: 6,
        email: 'user@example.com',
        role: 'ADMIN',
        team: 'Sales',
      };

      const result = validateRow(row, context);

      expect(result.isValid).toBe(true);
      expect(result.role).toBe('admin');
    });

    it('should parse multiple teams separated by semicolon', () => {
      const row: ParsedRow = {
        rowNumber: 6,
        email: 'user@example.com',
        role: 'admin',
        team: 'Sales; Marketing',
      };

      const result = validateRow(row, context);

      expect(result.isValid).toBe(true);
      expect(result.teamNames).toEqual(['Sales', 'Marketing']);
    });

    it('should reject non-existent team', () => {
      const row: ParsedRow = {
        rowNumber: 6,
        email: 'user@example.com',
        role: 'admin',
        team: 'NonExistentTeam',
      };

      const result = validateRow(row, context);

      expect(result.isValid).toBe(false);
      expect(result.validationErrors).toContain(
        'Team not found: "NonExistentTeam"',
      );
    });

    it('should clean team names (alphanumeric and spaces only)', () => {
      const row: ParsedRow = {
        rowNumber: 6,
        email: 'user@example.com',
        role: 'admin',
        team: 'Sales!!!',
      };

      const result = validateRow(row, context);

      expect(result.isValid).toBe(true);
      expect(result.teamNames).toEqual(['Sales']);
    });

    it('should reject invalid team name with only special characters', () => {
      const row: ParsedRow = {
        rowNumber: 6,
        email: 'user@example.com',
        role: 'admin',
        team: '!!!',
      };

      const result = validateRow(row, context);

      expect(result.isValid).toBe(false);
      expect(result.validationErrors).toContain('Invalid team name: "!!!"');
    });

    it('should allow empty team for non-superadmin roles', () => {
      const row: ParsedRow = {
        rowNumber: 6,
        email: 'user@example.com',
        role: 'admin',
        team: '',
      };

      const result = validateRow(row, context);

      expect(result.isValid).toBe(true);
      expect(result.teamNames).toEqual([]);
    });

    it('should clear teams for superadmin even if teams are provided', () => {
      const row: ParsedRow = {
        rowNumber: 6,
        email: 'superadmin@example.com',
        role: 'superadmin',
        team: 'Sales; Marketing',
      };

      const result = validateRow(row, context);

      expect(result.isValid).toBe(true);
      expect(result.teamNames).toEqual([]);
    });

    it('should accumulate multiple validation errors', () => {
      const row: ParsedRow = {
        rowNumber: 6,
        email: 'invalid-email',
        role: 'invalid_role',
        team: 'NonExistentTeam',
      };

      const result = validateRow(row, context);

      expect(result.isValid).toBe(false);
      expect(result.validationErrors).toHaveLength(3);
      expect(result.validationErrors).toContain('Invalid email format');
      expect(result.validationErrors).toContain(
        'Invalid role. Must be one of: superadmin, admin, user',
      );
      expect(result.validationErrors).toContain(
        'Team not found: "NonExistentTeam"',
      );
    });

    it('should handle empty email and empty role', () => {
      const row: ParsedRow = {
        rowNumber: 6,
        email: '',
        role: '',
        team: 'Sales',
      };

      const result = validateRow(row, context);

      expect(result.isValid).toBe(false);
      expect(result.validationErrors).toHaveLength(2);
      expect(result.validationErrors).toContain('Email is required');
      expect(result.validationErrors).toContain('Role is required');
    });

    it('should normalize email to lowercase', () => {
      const row: ParsedRow = {
        rowNumber: 6,
        email: 'User@EXAMPLE.COM',
        role: 'admin',
        team: 'Sales',
      };

      const result = validateRow(row, context);

      expect(result.email).toBe('user@example.com');
    });

    it('should handle whitespace in team names', () => {
      const row: ParsedRow = {
        rowNumber: 6,
        email: 'user@example.com',
        role: 'admin',
        team: ' Sales ; Marketing ',
      };

      const result = validateRow(row, context);

      expect(result.isValid).toBe(true);
      expect(result.teamNames).toEqual(['Sales', 'Marketing']);
    });
  });

  describe('validateAllRows', () => {
    beforeEach(() => {
      const mockManageUsers = [{ email: 'existing@example.com' }];
      const mockUsers: any[] = [];
      const mockTeams = [
        { _id: new Types.ObjectId(), name: 'Sales' },
        { _id: new Types.ObjectId(), name: 'Marketing' },
      ];

      vi.mocked(ManageUser.find).mockReturnValue({
        lean: vi.fn().mockResolvedValue(mockManageUsers),
      } as any);

      vi.mocked(User.find).mockReturnValue({
        lean: vi.fn().mockResolvedValue(mockUsers),
      } as any);

      vi.mocked(Team.find).mockReturnValue({
        lean: vi.fn().mockResolvedValue(mockTeams),
      } as any);
    });

    it('should validate all rows and detect duplicates within import', async () => {
      const rows: ParsedRow[] = [
        {
          rowNumber: 6,
          email: 'user1@example.com',
          role: 'admin',
          team: 'Sales',
        },
        {
          rowNumber: 7,
          email: 'user2@example.com',
          role: 'user',
          team: 'Marketing',
        },
        {
          rowNumber: 8,
          email: 'user1@example.com', // Duplicate
          role: 'user',
          team: 'Sales',
        },
      ];

      const results = await validateAllRows(rows, companyId);

      expect(results).toHaveLength(3);
      expect(results[0].isValid).toBe(true);
      expect(results[1].isValid).toBe(true);
      expect(results[2].isValid).toBe(false);
      expect(results[2].validationErrors).toContain(
        'Duplicate email in this import',
      );
    });

    it('should mark subsequent rows as having duplicate email after first valid one', async () => {
      const rows: ParsedRow[] = [
        {
          rowNumber: 6,
          email: 'newuser@example.com',
          role: 'admin',
          team: 'Sales',
        },
        {
          rowNumber: 7,
          email: 'newuser@example.com', // Duplicate in same import
          role: 'user',
          team: 'Marketing',
        },
        {
          rowNumber: 8,
          email: 'newuser@example.com', // Third duplicate
          role: 'superadmin',
          team: '',
        },
      ];

      const results = await validateAllRows(rows, companyId);

      expect(results[0].isValid).toBe(true);
      expect(results[1].isValid).toBe(false);
      expect(results[1].validationErrors).toContain(
        'Duplicate email in this import',
      );
      expect(results[2].isValid).toBe(false);
      expect(results[2].validationErrors).toContain(
        'Duplicate email in this import',
      );
    });

    it('should check against existing emails in database', async () => {
      const rows: ParsedRow[] = [
        {
          rowNumber: 6,
          email: 'existing@example.com', // Already exists
          role: 'admin',
          team: 'Sales',
        },
      ];

      const results = await validateAllRows(rows, companyId);

      expect(results[0].isValid).toBe(false);
      expect(results[0].validationErrors).toContain(
        'Email already exists in the system',
      );
    });

    it('should handle empty rows array', async () => {
      const rows: ParsedRow[] = [];

      const results = await validateAllRows(rows, companyId);

      expect(results).toHaveLength(0);
    });

    it('should handle case insensitive duplicate detection', async () => {
      const rows: ParsedRow[] = [
        {
          rowNumber: 6,
          email: 'User@Example.com',
          role: 'admin',
          team: 'Sales',
        },
        {
          rowNumber: 7,
          email: 'user@example.com', // Same email, different case
          role: 'user',
          team: 'Marketing',
        },
      ];

      const results = await validateAllRows(rows, companyId);

      expect(results[0].isValid).toBe(true);
      expect(results[1].isValid).toBe(false);
      expect(results[1].validationErrors).toContain(
        'Duplicate email in this import',
      );
    });
  });
});
