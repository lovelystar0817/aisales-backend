import { describe, it, expect } from 'vitest';
import * as XLSX from 'xlsx';
import { parseExcelFile } from './excelParser.js';

describe('excelParser', () => {
  describe('parseExcelFile', () => {
    it('should parse valid Excel file with correct template format', () => {
      // Create a valid Excel file with new format
      const data = [
        ['email', 'role', 'team'], // Row 1 (header)
        ['Instructions: Fill in the data below'], // Row 2 (ignored)
        [''], // Row 3 (ignored)
        [''], // Row 4 (ignored)
        ['user1@example.com', 'admin', 'Sales'], // Row 5 (data)
        ['user2@example.com', 'user', 'Marketing; Support'], // Row 6
        ['user3@example.com', 'superadmin', ''], // Row 7
      ];

      const worksheet = XLSX.utils.aoa_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      const result = parseExcelFile(buffer);

      expect(result.success).toBe(true);
      expect(result.errors).toEqual([]);
      expect(result.rows).toHaveLength(3);

      expect(result.rows[0]).toEqual({
        rowNumber: 5,
        email: 'user1@example.com',
        role: 'admin',
        team: 'Sales',
      });

      expect(result.rows[1]).toEqual({
        rowNumber: 6,
        email: 'user2@example.com',
        role: 'user',
        team: 'Marketing; Support',
      });

      expect(result.rows[2]).toEqual({
        rowNumber: 7,
        email: 'user3@example.com',
        role: 'superadmin',
        team: '',
      });
    });

    it('should handle case insensitive headers', () => {
      const data = [
        ['EMAIL', 'ROLE', 'TEAM'], // Row 1 (uppercase headers)
        [''], // Row 2 (ignored)
        [''], // Row 3 (ignored)
        [''], // Row 4 (ignored)
        ['user@example.com', 'admin', 'Sales'], // Row 5 (data)
      ];

      const worksheet = XLSX.utils.aoa_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      const result = parseExcelFile(buffer);

      expect(result.success).toBe(true);
      expect(result.rows).toHaveLength(1);
    });

    it('should skip empty rows', () => {
      const data = [
        ['email', 'role', 'team'], // Row 1 (header)
        [''], // Row 2 (ignored)
        [''], // Row 3 (ignored)
        [''], // Row 4 (ignored)
        ['user1@example.com', 'admin', 'Sales'], // Row 5
        ['', '', ''], // Row 6 (empty)
        ['user2@example.com', 'user', 'Marketing'], // Row 7
        [], // Row 8 (completely empty)
        ['user3@example.com', 'superadmin', ''], // Row 9
      ];

      const worksheet = XLSX.utils.aoa_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      const result = parseExcelFile(buffer);

      expect(result.success).toBe(true);
      expect(result.rows).toHaveLength(3);
      expect(result.rows[0].rowNumber).toBe(5);
      expect(result.rows[1].rowNumber).toBe(7);
      expect(result.rows[2].rowNumber).toBe(9);
    });

    it('should trim whitespace from values', () => {
      const data = [
        ['email', 'role', 'team'], // Row 1 (header)
        [''], // Row 2 (ignored)
        [''], // Row 3 (ignored)
        [''], // Row 4 (ignored)
        ['  user@example.com  ', ' admin ', ' Sales '], // Row 5 (with whitespace)
      ];

      const worksheet = XLSX.utils.aoa_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      const result = parseExcelFile(buffer);

      expect(result.success).toBe(true);
      expect(result.rows[0]).toEqual({
        rowNumber: 5,
        email: 'user@example.com',
        role: 'admin',
        team: 'Sales',
      });
    });

    it('should fail if file is too short (no rows)', () => {
      const data: any[] = [];

      const worksheet = XLSX.utils.aoa_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      const result = parseExcelFile(buffer);

      expect(result.success).toBe(false);
      expect(result.errors).toContain(
        'Excel file is too short. Expected header at row 1',
      );
    });

    it('should fail if header row is missing required columns', () => {
      const data = [
        ['email', 'role', 'extra'], // Row 1 (has 3 columns but 'team' is missing)
        [''], // Row 2
        [''], // Row 3
        [''], // Row 4
      ];

      const worksheet = XLSX.utils.aoa_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      const result = parseExcelFile(buffer);

      expect(result.success).toBe(false);
      expect(result.errors[0]).toContain('Required columns not found in row 1');
    });

    it('should fail if header row has wrong column names', () => {
      const data = [
        ['email', 'position', 'department'], // Row 1 (wrong column names)
        [''], // Row 2
        [''], // Row 3
        [''], // Row 4
      ];

      const worksheet = XLSX.utils.aoa_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      const result = parseExcelFile(buffer);

      expect(result.success).toBe(false);
      expect(result.errors[0]).toContain('Required columns not found in row 1');
      expect(result.errors[0]).toContain('Expected: email, role, team');
    });

    it('should fail if workbook has no sheets', () => {
      // Create an Excel file with an empty sheet
      const data: any[] = [];
      const worksheet = XLSX.utils.aoa_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      const result = parseExcelFile(buffer);

      // Empty sheet should fail because it doesn't have enough rows
      expect(result.success).toBe(false);
      expect(result.errors[0]).toContain('Expected header at row 1');
    });

    it('should handle Excel with additional columns', () => {
      const data = [
        ['email', 'role', 'team', 'extra_column'], // Row 1 (extra column)
        [''], // Row 2
        [''], // Row 3
        [''], // Row 4
        ['user@example.com', 'admin', 'Sales', 'extra_value'], // Row 5
      ];

      const worksheet = XLSX.utils.aoa_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      const result = parseExcelFile(buffer);

      expect(result.success).toBe(true);
      expect(result.rows).toHaveLength(1);
      expect(result.rows[0]).toEqual({
        rowNumber: 5,
        email: 'user@example.com',
        role: 'admin',
        team: 'Sales',
      });
    });

    it('should return empty rows array if no data after header', () => {
      const data = [
        ['email', 'role', 'team'], // Row 1 (header)
        [''], // Row 2
        [''], // Row 3
        [''], // Row 4
        // No data rows (row 5+)
      ];

      const worksheet = XLSX.utils.aoa_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      const result = parseExcelFile(buffer);

      expect(result.success).toBe(true);
      expect(result.rows).toHaveLength(0);
    });

    it('should include rows with email but empty role (for validation)', () => {
      const data = [
        ['email', 'role', 'team'], // Row 1 (header)
        [''], // Row 2
        [''], // Row 3
        [''], // Row 4
        ['user@example.com', '', 'Sales'], // Row 5 (empty role)
        ['user2@example.com', 'admin', ''], // Row 6 (valid)
      ];

      const worksheet = XLSX.utils.aoa_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      const result = parseExcelFile(buffer);

      expect(result.success).toBe(true);
      expect(result.rows).toHaveLength(2);
      expect(result.rows[0]).toEqual({
        rowNumber: 5,
        email: 'user@example.com',
        role: '', // Empty role should be included
        team: 'Sales',
      });
      expect(result.rows[1]).toEqual({
        rowNumber: 6,
        email: 'user2@example.com',
        role: 'admin',
        team: '',
      });
    });

    it('should handle corrupt buffer gracefully', () => {
      const corruptBuffer = Buffer.from('This is not a valid Excel file');

      const result = parseExcelFile(corruptBuffer);

      expect(result.success).toBe(false);
      // xlsx library might parse it as valid but too short, or throw parse error
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});
