import * as XLSX from 'xlsx';

export interface ParsedRow {
  rowNumber: number;
  email: string;
  role: string;
  team: string;
}

export interface ExcelParseResult {
  success: boolean;
  rows: ParsedRow[];
  errors: string[];
}

// Template format:
// Row 1: Column headers (email, role, team)
// Row 2-4: Instructions (ignored)
// Row 5+: Data
const TEMPLATE_HEADER_ROW_INDEX = 0; // 0-indexed (row 1 in Excel)
const TEMPLATE_DATA_START_INDEX = 4; // 0-indexed (row 5 in Excel)

export function parseExcelFile(buffer: Buffer): ExcelParseResult {
  const errors: string[] = [];

  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' });

    // Get first sheet
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      return {
        success: false,
        rows: [],
        errors: ['Excel file has no sheets'],
      };
    }

    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json<any>(sheet, { header: 1 });

    // Check if file has enough rows
    if (data.length <= TEMPLATE_HEADER_ROW_INDEX) {
      return {
        success: false,
        rows: [],
        errors: ['Excel file is too short. Expected header at row 1'],
      };
    }

    // Validate header row at row 1 (index 0)
    const headerRow = data[TEMPLATE_HEADER_ROW_INDEX];
    if (!headerRow || headerRow.length < 3) {
      return {
        success: false,
        rows: [],
        errors: [
          'Invalid template: Header row (row 1) must have at least 3 columns (email, role, team)',
        ],
      };
    }

    const headers = headerRow.map((h: any) =>
      String(h || '')
        .toLowerCase()
        .trim(),
    );
    const emailIndex = headers.indexOf('email');
    const roleIndex = headers.indexOf('role');
    const teamIndex = headers.indexOf('team');

    if (emailIndex === -1 || roleIndex === -1 || teamIndex === -1) {
      return {
        success: false,
        rows: [],
        errors: [
          `Invalid template: Required columns not found in row 1. Expected: email, role, team. Found: ${headers.join(', ')}`,
        ],
      };
    }

    // Parse data rows starting from row 5 (index 4)
    const rows: ParsedRow[] = [];
    for (let i = TEMPLATE_DATA_START_INDEX; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length === 0) continue; // Skip empty rows

      const email = String(row[emailIndex] || '').trim();
      const role = String(row[roleIndex] || '').trim();
      const team = String(row[teamIndex] || '').trim();

      // Skip rows with no email (considered empty)
      if (!email) continue;

      rows.push({
        rowNumber: i + 1, // Excel row number (1-based, so row 5 becomes rowNumber 5)
        email,
        role,
        team,
      });
    }

    return {
      success: true,
      rows,
      errors: [],
    };
  } catch (error: any) {
    return {
      success: false,
      rows: [],
      errors: [`Failed to parse Excel file: ${error.message}`],
    };
  }
}
