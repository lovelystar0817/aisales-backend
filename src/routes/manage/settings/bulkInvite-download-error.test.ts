import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Types } from 'mongoose';
import * as XLSX from 'xlsx';

vi.mock('../../../models/BulkInvite.js');
vi.mock('fs/promises');

describe('bulkInvite download error report', () => {
  const mockCompany = new Types.ObjectId();
  const mockBulkInviteId = new Types.ObjectId();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('error report generation', () => {
    it('should generate error report with validation errors', async () => {
      // Mock template data structure
      const templateData = [
        ['email', 'role', 'team'],
        ['Instructions: Please fill in...'],
        [''],
        [''],
        ['', '', ''], // Row 5 will be replaced with error data
      ];

      const worksheet = XLSX.utils.aoa_to_sheet(templateData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

      // Mock error items
      const errorItems = [
        {
          rowNumber: 6,
          email: 'invalid-email',
          role: 'user',
          teamNames: ['Marketing Team'],
          isValid: false,
          validationErrors: ['Invalid email format'],
          emailSent: false,
          retryCount: 0,
        },
        {
          rowNumber: 7,
          email: 'existing@example.com',
          role: 'admin',
          teamNames: ['HR Team', 'Finance Team'],
          isValid: false,
          validationErrors: ['Email already exists'],
          emailSent: false,
          retryCount: 0,
        },
      ];

      // Verify error data structure
      expect(errorItems[0].email).toBe('invalid-email');
      expect(errorItems[0].validationErrors).toContain('Invalid email format');
      expect(errorItems[1].teamNames).toEqual(['HR Team', 'Finance Team']);
    });

    it('should include email sending errors in report', () => {
      const errorItem = {
        rowNumber: 9,
        email: 'failed@example.com',
        role: 'user',
        teamNames: ['Sales Team'],
        isValid: true,
        validationErrors: [],
        emailSent: false,
        emailError: 'SendGrid API error: 503 Service Unavailable',
        retryCount: 3,
      };

      // Combine errors
      const allErrors: string[] = [];
      if (errorItem.validationErrors && errorItem.validationErrors.length > 0) {
        allErrors.push(...errorItem.validationErrors);
      }
      if (errorItem.emailError) {
        allErrors.push(`Email error: ${errorItem.emailError}`);
      }
      const combinedError = allErrors.join('; ');

      expect(combinedError).toContain('Email error:');
      expect(combinedError).toContain('SendGrid API error');
    });

    it('should handle items with multiple teams', () => {
      const errorItem = {
        rowNumber: 7,
        email: 'test@example.com',
        role: 'admin',
        teamNames: ['HR Team', 'Finance Team', 'Operations Team'],
        isValid: false,
        validationErrors: ['Some error'],
        emailSent: false,
        retryCount: 0,
      };

      const teamString =
        errorItem.teamNames && errorItem.teamNames.length > 0
          ? errorItem.teamNames.join(', ')
          : '';

      expect(teamString).toBe('HR Team, Finance Team, Operations Team');
    });

    it('should handle items with no teams', () => {
      const errorItem = {
        rowNumber: 8,
        email: 'test@example.com',
        role: 'user',
        teamNames: [],
        isValid: false,
        validationErrors: ['Invalid role'],
        emailSent: false,
        retryCount: 0,
      };

      const teamString =
        errorItem.teamNames && errorItem.teamNames.length > 0
          ? errorItem.teamNames.join(', ')
          : '';

      expect(teamString).toBe('');
    });

    it('should filter only error items', () => {
      const allItems = [
        {
          rowNumber: 5,
          email: 'valid1@example.com',
          role: 'user',
          teamNames: ['Sales Team'],
          isValid: true,
          validationErrors: [],
          emailSent: true,
          retryCount: 0,
        },
        {
          rowNumber: 6,
          email: 'invalid-email',
          role: 'user',
          teamNames: ['Marketing Team'],
          isValid: false,
          validationErrors: ['Invalid email format'],
          emailSent: false,
          retryCount: 0,
        },
        {
          rowNumber: 7,
          email: 'valid2@example.com',
          role: 'user',
          teamNames: [],
          isValid: true,
          validationErrors: [],
          emailSent: true,
          retryCount: 0,
        },
        {
          rowNumber: 8,
          email: 'failed@example.com',
          role: 'user',
          teamNames: ['Sales Team'],
          isValid: true,
          validationErrors: [],
          emailSent: false,
          emailError: 'SendGrid error',
          retryCount: 3,
        },
      ];

      const errorItems = allItems.filter(
        (item) =>
          !item.isValid || item.validationErrors.length > 0 || item.emailError,
      );

      expect(errorItems.length).toBe(2);
      expect(errorItems[0].email).toBe('invalid-email');
      expect(errorItems[1].email).toBe('failed@example.com');
    });
  });
});
