import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import ExcelJS from 'exceljs';
import { readFile } from 'fs/promises';
import { BulkInvite } from '../../../models/BulkInvite.js';
import { parseExcelFile } from '../../../utils/bulkInvite/excelParser.js';
import { validateAllRows } from '../../../utils/bulkInvite/validator.js';
import {
  BULK_INVITE_MAX_ROWS,
  AGENDA_JOB_TYPES,
} from '../../../utils/constants.js';
import { getAgenda } from '../../../jobs/agenda.js';

const router: FastifyPluginAsyncZod = async (app, _opts) => {
  app.use(app.checkAuth0JWT);
  app.addHook('preHandler', app.authenticateManage);

  // POST /manage/settings/bulk-invite/precheck
  app.route({
    url: '/precheck',
    method: 'POST',
    schema: {
      consumes: ['multipart/form-data'],
    } as any,
    async handler(req, reply) {
      try {
        // Check permission
        if (req.user?.role !== 'superadmin') {
          return reply.status(403).send({
            error: 'Only superadmin can perform bulk invite',
          });
        }

        // Try common field names: 'file', 'excel', 'upload'
        const fileField =
          (req.body as any)?.file ||
          (req.body as any)?.excel ||
          (req.body as any)?.upload;

        req.log.info(
          {
            hasFileField: !!fileField,
            fileFieldType: fileField?.type,
            filename: fileField?.filename,
            mimetype: fileField?.mimetype,
            encoding: fileField?.encoding,
          },
          'File upload result',
        );

        if (!fileField || fileField.type !== 'file') {
          req.log.error('No file received in request');
          return reply.status(400).send({ error: 'No file uploaded' });
        }

        const data = fileField;

        // Validate file extension
        const fileName = data.filename;
        const ext = fileName.toLowerCase().split('.').pop();
        req.log.info({ fileName, extension: ext }, 'File info');

        if (!['xls', 'xlsx'].includes(ext || '')) {
          req.log.error({ fileName, extension: ext }, 'Invalid file extension');
          return reply.status(400).send({
            error: 'Invalid file format. Please upload .xls or .xlsx file',
          });
        }

        // Read file buffer
        req.log.info('Reading file buffer...');
        const buffer = await data.toBuffer();
        req.log.info(
          { bufferSize: buffer.length },
          'File buffer read successfully',
        );

        // Parse Excel
        req.log.info('Parsing Excel file...');
        const parseResult = parseExcelFile(buffer);
        req.log.info(
          {
            success: parseResult.success,
            rowCount: parseResult.success ? parseResult.rows.length : 0,
            errors: parseResult.success ? [] : parseResult.errors,
          },
          'Excel parsing result',
        );

        if (!parseResult.success) {
          req.log.error(
            { errors: parseResult.errors },
            'Failed to parse Excel',
          );
          return reply.status(400).send({
            error: 'Failed to parse Excel file',
            details: parseResult.errors,
          });
        }

        // Check max rows
        if (parseResult.rows.length > BULK_INVITE_MAX_ROWS) {
          return reply.status(400).send({
            error: `Too many rows. Maximum ${BULK_INVITE_MAX_ROWS} rows allowed`,
            rowCount: parseResult.rows.length,
          });
        }

        if (parseResult.rows.length === 0) {
          return reply.status(400).send({
            error: 'No valid rows found in the Excel file',
          });
        }

        // Validate all rows
        req.log.info(
          { rowCount: parseResult.rows.length },
          'Validating rows...',
        );
        const validatedItems = await validateAllRows(
          parseResult.rows,
          req.user.company,
        );

        // Generate summary
        const validCount = validatedItems.filter((item) => item.isValid).length;
        const invalidCount = validatedItems.length - validCount;

        req.log.info(
          {
            totalRows: validatedItems.length,
            validCount,
            invalidCount,
          },
          'Validation complete',
        );

        // If no valid rows at all, throw error
        if (validCount === 0) {
          req.log.error('No valid rows found after validation');
          return reply.status(400).send({
            error: 'No valid rows found in the Excel file',
            details:
              'All rows have validation errors. Please fix the errors and try again.',
          });
        }

        // Return result
        req.log.info('=== BULK INVITE PRECHECK - SUCCESS ===');
        return reply.send({
          success: true,
          summary: {
            totalRows: validatedItems.length,
            validCount,
            invalidCount,
            fileName,
          },
          items: validatedItems.map((item) => ({
            rowNumber: item.rowNumber,
            email: item.email,
            role: item.role,
            teams: item.teamNames,
            isValid: item.isValid,
            errors: item.validationErrors,
          })),
        });
      } catch (error: any) {
        req.log.error({ err: error }, 'Error in bulk invite precheck:');
        return reply.status(500).send({
          error: 'Failed to process file',
          details: error.message,
        });
      }
    },
  });

  // POST /manage/settings/bulk-invite/import
  app.route({
    url: '/import',
    method: 'POST',
    schema: {
      consumes: ['multipart/form-data'],
    } as any,
    async handler(req, reply) {
      try {
        // Check permission
        if (req.user?.role !== 'superadmin') {
          return reply.status(403).send({
            error: 'Only superadmin can perform bulk invite',
          });
        }

        // Try common field names: 'file', 'excel', 'upload'
        const fileField =
          (req.body as any)?.file ||
          (req.body as any)?.excel ||
          (req.body as any)?.upload;

        req.log.info(
          {
            hasFileField: !!fileField,
            fileFieldType: fileField?.type,
            filename: fileField?.filename,
            mimetype: fileField?.mimetype,
            encoding: fileField?.encoding,
          },
          'File upload result',
        );

        if (!fileField || fileField.type !== 'file') {
          req.log.error('No file received in request');
          return reply.status(400).send({ error: 'No file uploaded' });
        }

        const data = fileField;

        // Validate file extension
        const fileName = data.filename;
        const ext = fileName.toLowerCase().split('.').pop();
        req.log.info({ fileName, extension: ext }, 'File info');

        if (!['xls', 'xlsx'].includes(ext || '')) {
          req.log.error({ fileName, extension: ext }, 'Invalid file extension');
          return reply.status(400).send({
            error: 'Invalid file format. Please upload .xls or .xlsx file',
          });
        }

        // Read file buffer
        req.log.info('Reading file buffer...');
        const buffer = await data.toBuffer();
        req.log.info(
          { bufferSize: buffer.length },
          'File buffer read successfully',
        );

        // Parse Excel
        req.log.info('Parsing Excel file...');
        const parseResult = parseExcelFile(buffer);
        req.log.info(
          {
            success: parseResult.success,
            rowCount: parseResult.success ? parseResult.rows.length : 0,
            errors: parseResult.success ? [] : parseResult.errors,
          },
          'Excel parsing result',
        );

        if (!parseResult.success) {
          req.log.error(
            { errors: parseResult.errors },
            'Failed to parse Excel',
          );
          return reply.status(400).send({
            error: 'Failed to parse Excel file',
            details: parseResult.errors,
          });
        }

        // Check max rows
        if (parseResult.rows.length > BULK_INVITE_MAX_ROWS) {
          return reply.status(400).send({
            error: `Too many rows. Maximum ${BULK_INVITE_MAX_ROWS} rows allowed`,
          });
        }

        if (parseResult.rows.length === 0) {
          return reply.status(400).send({
            error: 'No valid rows found in the Excel file',
          });
        }

        // Validate all rows
        req.log.info(
          { rowCount: parseResult.rows.length },
          'Validating rows...',
        );
        const validatedItems = await validateAllRows(
          parseResult.rows,
          req.user.company,
        );

        const validCount = validatedItems.filter((item) => item.isValid).length;
        const invalidCount = validatedItems.length - validCount;

        req.log.info(
          {
            totalRows: validatedItems.length,
            validCount,
            invalidCount,
          },
          'Validation complete',
        );

        // If no valid rows at all, throw error
        if (validCount === 0) {
          req.log.error('No valid rows found after validation');
          return reply.status(400).send({
            error: 'No valid rows found in the Excel file',
            details:
              'All rows have validation errors. Please fix the errors and try again.',
          });
        }

        // Create BulkInvite record
        req.log.info('Creating BulkInvite record...');
        const bulkInvite = await BulkInvite.create({
          company: req.user.company,
          uploadedBy: req.user._id,
          uploadedByEmail: req.user.email,
          fileName,
          totalRows: validatedItems.length,
          status: 'processing',
          items: validatedItems,
          validCount,
          invalidCount,
          sentCount: 0,
          failedCount: 0,
        });

        req.log.info(
          { bulkInviteId: bulkInvite._id.toString() },
          'BulkInvite record created',
        );

        // Schedule Agenda job to process invites
        req.log.info('Scheduling Agenda job...');
        const agenda = getAgenda();
        await agenda.now(AGENDA_JOB_TYPES.PROCESS_BULK_INVITE, {
          bulkInviteId: bulkInvite._id.toString(),
        });

        req.log.info('=== BULK INVITE IMPORT - SUCCESS ===');
        return reply.status(201).send({
          success: true,
          bulkInviteId: bulkInvite._id.toString(),
          summary: {
            totalRows: validatedItems.length,
            validCount,
            invalidCount,
          },
          message:
            'Bulk invite is being processed. Invitations will be sent shortly.',
        });
      } catch (error: any) {
        req.log.error({ err: error }, 'Error in bulk invite import:');
        return reply.status(500).send({
          error: 'Failed to process import',
          details: error.message,
        });
      }
    },
  });

  // GET /manage/settings/bulk-invite/history
  app.get('/history', {
    schema: {
      querystring: z.object({
        page: z.coerce.number().min(1).default(1),
        limit: z.coerce.number().min(1).max(50).default(10),
      }),
    },
    async handler(req, reply) {
      try {
        const { page, limit } = req.query;
        const skip = (page - 1) * limit;

        const query: any = { company: req.user?.company };

        // If admin, only show their own uploads
        if (req.user?.role === 'admin') {
          query.uploadedBy = req.user._id;
        }

        const [bulkInvites, total] = await Promise.all([
          BulkInvite.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .select('-items') // Exclude items for list view
            .lean(),
          BulkInvite.countDocuments(query),
        ]);

        const totalPages = Math.ceil(total / limit);

        return reply.send({
          history: bulkInvites.map((bi) => ({
            id: bi._id.toString(),
            fileName: bi.fileName,
            uploadedBy: bi.uploadedByEmail,
            uploadedAt: bi.createdAt,
            status: bi.status,
            totalRows: bi.totalRows,
            validCount: bi.validCount,
            invalidCount: bi.invalidCount,
            sentCount: bi.sentCount,
            failedCount: bi.failedCount,
            completedAt: bi.completedAt,
          })),
          pagination: {
            currentPage: page,
            totalPages,
            total,
            limit,
          },
        });
      } catch (error: any) {
        req.log.error({ err: error }, 'Error fetching bulk invite history:');
        return reply.status(500).send({ error: 'Failed to fetch history' });
      }
    },
  });

  // GET /manage/settings/bulk-invite/:id
  app.get('/:id', {
    schema: {
      params: z.object({
        id: z.string(),
      }),
    },
    async handler(req, reply) {
      try {
        const bulkInvite = await BulkInvite.findOne({
          _id: req.params.id,
          company: req.user?.company,
        }).lean();

        if (!bulkInvite) {
          return reply.status(404).send({ error: 'Bulk invite not found' });
        }

        return reply.send({
          id: bulkInvite._id.toString(),
          fileName: bulkInvite.fileName,
          uploadedBy: bulkInvite.uploadedByEmail,
          uploadedAt: bulkInvite.createdAt,
          status: bulkInvite.status,
          totalRows: bulkInvite.totalRows,
          validCount: bulkInvite.validCount,
          invalidCount: bulkInvite.invalidCount,
          sentCount: bulkInvite.sentCount,
          failedCount: bulkInvite.failedCount,
          completedAt: bulkInvite.completedAt,
          items: bulkInvite.items.map((item) => ({
            rowNumber: item.rowNumber,
            email: item.email,
            role: item.role,
            teams: item.teamNames,
            isValid: item.isValid,
            errors: item.validationErrors,
            emailSent: item.emailSent,
            emailSentAt: item.emailSentAt,
            emailError: item.emailError,
            retryCount: item.retryCount,
          })),
        });
      } catch (error: any) {
        req.log.error({ err: error }, 'Error fetching bulk invite details:');
        return reply.status(500).send({ error: 'Failed to fetch details' });
      }
    },
  });

  // GET /manage/settings/bulk-invite/:id/download-error-report
  app.get('/:id/download-error-report', {
    schema: {
      params: z.object({
        id: z.string(),
      }),
    },
    async handler(req, reply) {
      try {
        // Fetch bulk invite record
        const bulkInvite = await BulkInvite.findOne({
          _id: req.params.id,
          company: req.user?.company,
        }).lean();

        if (!bulkInvite) {
          return reply.status(404).send({ error: 'Bulk invite not found' });
        }

        // Filter items that have errors
        const errorItems = bulkInvite.items.filter(
          (item) =>
            !item.isValid ||
            item.validationErrors.length > 0 ||
            item.emailError,
        );

        if (errorItems.length === 0) {
          return reply.status(404).send({ error: 'No error records found' });
        }

        // Load template file
        const templatePath = 'public/hupo-invite-20260210.xlsx';
        const templateBuffer = await readFile(templatePath);

        // Load workbook from template
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(templateBuffer as any);

        // Get first worksheet
        const worksheet = workbook.getWorksheet(1);
        if (!worksheet) {
          return reply
            .status(500)
            .send({ error: 'Template worksheet not found' });
        }

        // Write error data starting from row 5
        errorItems.forEach((item, index) => {
          const rowNumber = 5 + index;

          // Column A: email
          worksheet.getCell(`A${rowNumber}`).value = item.email;

          // Column B: role
          worksheet.getCell(`B${rowNumber}`).value = item.role;

          // Column C: team (join multiple teams with semicolon)
          worksheet.getCell(`C${rowNumber}`).value =
            item.teamNames && item.teamNames.length > 0
              ? item.teamNames.join('; ')
              : '';

          // Column D: error details (combine validation errors and email error)
          const allErrors: string[] = [];
          if (item.validationErrors && item.validationErrors.length > 0) {
            allErrors.push(...item.validationErrors);
          }
          if (item.emailError) {
            allErrors.push(`Email error: ${item.emailError}`);
          }
          worksheet.getCell(`D${rowNumber}`).value = allErrors.join('; ');
        });

        // Generate buffer
        const buffer = Buffer.from(await workbook.xlsx.writeBuffer());

        // Set response headers
        const fileName = `bulk-error-report-${req.params.id}.xlsx`;
        reply.type(
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        );
        reply.header(
          'Content-Disposition',
          `attachment; filename="${fileName}"`,
        );

        req.log.info(
          { bulkInviteId: req.params.id, errorCount: errorItems.length },
          'Error report downloaded',
        );

        return reply.send(buffer);
      } catch (error: any) {
        req.log.error(
          { err: error },
          'Error generating bulk invite error report:',
        );
        return reply.status(500).send({
          error: 'Failed to generate error report',
          details: error.message,
        });
      }
    },
  });
};

export default router;
