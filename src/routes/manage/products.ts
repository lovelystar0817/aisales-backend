import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { randomUUID } from 'node:crypto';
import { SalesProduct } from '../../models/SalesProduct.js';
import { ProductIngestion } from '../../models/ProductIngestion.js';
import { Scenario } from '../../models/Scenario.js';
import { ManageUser, ManageUserDocument } from '../../models/ManageUser.js';
import { SalesProductCompetitor } from '../../models/SalesProductCompetitor.js';
import { getAgenda } from '../../jobs/agenda.js';
import { AGENDA_JOB_TYPES, FILE_SIZE_LIMIT } from '../../utils/constants.js';
import { ProductFileService } from '../../services/products/fileOperations.js';
import { logAdminAction } from '../../utils/adminLogger.js';
import { S3 } from '../../libs/s3.js';

// Utility functions
const ALLOWED_MIME_TYPES = [
  'text/plain',
  'text/markdown',
  'application/json',
  'text/csv',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
  'application/vnd.openxmlformats-officedocument.presentationml.presentation', // PPTX
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // XLSX
];

function slugify(value: string): string {
  return (value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

const router: FastifyPluginAsyncZod = async (app, _opts) => {
  // Admin auth
  app.use(app.checkAuth0JWT);
  app.addHook('preHandler', app.authenticateManage);

  // POST /manage/products/presigned-urls - Generate presigned upload URLs
  app.post('/presigned-urls', {
    schema: {
      body: z.object({
        files: z.array(
          z.object({
            fileName: z.string(),
            fileSize: z.number(),
            mimeType: z.string(),
          }),
        ),
        name: z.string().optional(),
        duplicateId: z.string().nullish(),
      }),
      response: {
        200: z.object({
          ingestionId: z.string().uuid(),
          uploads: z.array(
            z.object({
              fileName: z.string(),
              uploadUrl: z.string().optional(),
              s3Key: z.string(),
              copied: z.boolean().optional(),
            }),
          ),
        }),
        400: z.object({
          error: z.string(),
        }),
        409: z.object({
          success: z.boolean(),
          error: z.string(),
          errorCode: z.string(),
        }),
      },
    },
    async handler(req, reply) {
      const { files, name, duplicateId } = req.body;
      const companyId = req.user?.company;

      // Check if a product with this name already exists in the company
      if (name && name.trim() !== '') {
        const existingProduct = await SalesProduct.findOne({
          name: name.trim(),
          company: companyId,
        });

        if (existingProduct) {
          return reply.code(409).send({
            success: false,
            error:
              'A product with this name already exists. Please choose a different name.',
            errorCode: 'NAME_ALREADY_EXISTS',
          });
        }
      }

      // Validate files
      if (!files || files.length === 0) {
        return reply.code(400).send({ error: 'No files specified' });
      }

      if (files.length > 5) {
        return reply.code(400).send({ error: 'Maximum 5 files allowed' });
      }

      // Check file types and sizes
      for (const file of files) {
        if (!ALLOWED_MIME_TYPES.includes(file.mimeType)) {
          return reply.code(400).send({
            error: `Unsupported file type: ${file.mimeType}`,
          });
        }
        if (file.fileSize > FILE_SIZE_LIMIT) {
          return reply.code(400).send({
            error: `File "${file.fileName}" is too large (max 50MB)`,
          });
        }
      }

      // Generate ingestion ID
      const ingestionId = randomUUID();

      // Handle file duplication - copy files that exist in source, generate URLs for new files
      let sourceFileMap = new Map<string, any>();
      if (duplicateId) {
        const sourceProduct = await SalesProduct.findOne({
          $or: [{ _id: duplicateId }, { friendlyId: duplicateId }],
          company: companyId,
        });

        if (sourceProduct) {
          const sourceIngestion = await ProductIngestion.findOne({
            publishedProductId: sourceProduct._id,
            status: 'published',
          }).sort({ createdAt: -1 });

          if (sourceIngestion && sourceIngestion.files) {
            // Create a map of source files by name for quick lookup
            sourceIngestion.files.forEach((sf) => {
              sourceFileMap.set(sf.fileName, sf);
            });
          }
        }
      }

      // Process each file - copy from source if exists, otherwise generate upload URL
      const uploads = await Promise.all(
        files.map(async (file) => {
          const newS3Key = `product-ingestions/${ingestionId}/${file.fileName}`;
          const sourceFile = sourceFileMap.get(file.fileName);

          if (sourceFile) {
            // File exists in source metadata - try to copy from S3
            try {
              await S3.copyFileInProductBucket(
                sourceFile.s3Key,
                newS3Key,
                sourceFile.mimeType,
              );

              return {
                fileName: file.fileName,
                s3Key: newS3Key,
                copied: true,
              };
            } catch (error) {
              // Source file missing from S3 - generate upload URL instead
              console.warn(
                `Source file ${file.fileName} not found in S3, generating upload URL`,
              );

              const uploadUrl =
                await req.server.s3.getPresignedUploadUrlForProductUpload(
                  newS3Key,
                  file.mimeType,
                );

              return {
                fileName: file.fileName,
                uploadUrl,
                s3Key: newS3Key,
                copied: false,
              };
            }
          } else {
            // New file - generate presigned URL for upload
            const uploadUrl =
              await req.server.s3.getPresignedUploadUrlForProductUpload(
                newS3Key,
                file.mimeType,
              );

            return {
              fileName: file.fileName,
              uploadUrl,
              s3Key: newS3Key,
              copied: false,
            };
          }
        }),
      );

      return reply.send({
        ingestionId,
        uploads,
      });
    },
  });

  // POST /manage/products/:id/presigned-urls - Generate presigned upload URLs for editing
  app.post('/:id/presigned-urls', {
    schema: {
      params: z.object({ id: z.string().min(1) }),
      body: z.object({
        files: z.array(
          z.object({
            fileName: z.string(),
            fileSize: z.number(),
            mimeType: z.string(),
          }),
        ),
      }),
      response: {
        200: z.object({
          uploads: z.array(
            z.object({
              fileName: z.string(),
              uploadUrl: z.string(),
              s3Key: z.string(),
            }),
          ),
        }),
        400: z.object({
          error: z.string(),
        }),
        404: z.object({
          error: z.string(),
        }),
      },
    },
    async handler(req, reply) {
      const { id } = req.params as { id: string };
      const { files } = req.body;
      const companyId = req.user!.company;

      // Verify product exists and belongs to this company
      const product = await SalesProduct.findOne({
        $or: [{ _id: id }, { friendlyId: id }],
        company: companyId,
      }).lean();

      if (!product) {
        return reply.status(404).send({
          error: 'Product not found',
        });
      }

      // Find related ProductIngestion
      const ingestion = await ProductIngestion.findOne({
        publishedProductId: product._id,
        status: 'published',
      });

      if (!ingestion) {
        return reply.status(404).send({
          error: 'Product ingestion not found',
        });
      }

      // Validate files
      if (!files || files.length === 0) {
        return reply.code(400).send({ error: 'No files specified' });
      }

      // Check file types and sizes
      for (const file of files) {
        if (!ALLOWED_MIME_TYPES.includes(file.mimeType)) {
          return reply.code(400).send({
            error: `Unsupported file type: ${file.mimeType}`,
          });
        }
        if (file.fileSize > FILE_SIZE_LIMIT) {
          return reply.code(400).send({
            error: `File "${file.fileName}" is too large (max 50MB)`,
          });
        }
      }

      // Generate presigned upload URLs
      const uploads = await Promise.all(
        files.map(async (file) => {
          const s3Key = `product-ingestions/${ingestion.ingestionId}/${file.fileName}`;
          const uploadUrl =
            await req.server.s3.getPresignedUploadUrlForProductUpload(
              s3Key,
              file.mimeType,
            );

          return {
            fileName: file.fileName,
            uploadUrl,
            s3Key,
          };
        }),
      );

      return reply.send({
        uploads,
      });
    },
  });

  // POST /manage/products/import - Complete import with S3 keys
  app.post('/import', {
    schema: {
      body: z.object({
        ingestionId: z.string().uuid(),
        name: z.string().optional(),
        friendlyId: z.string().optional(),
        languageCode: z.string().default('en'),
        generateCompetitiveIntelligence: z.boolean().default(false),
        duplicateCompetitiveIntelligence: z.boolean().default(false),
        duplicateId: z.string().nullish(),
        files: z.array(
          z.object({
            fileName: z.string(),
            mimeType: z.string(),
            size: z.number(),
            s3Key: z.string(),
          }),
        ),
      }),
      response: {
        202: z.object({
          ingestionId: z.string().uuid(),
          draftId: z.string().uuid(),
          status: z.literal('processing'),
          product: z.object({
            name: z.string().optional(),
            friendlyId: z.string().optional(),
          }),
          warnings: z.array(z.string()),
        }),
        400: z.object({
          error: z.string(),
        }),
        404: z.object({
          error: z.string(),
        }),
        500: z.object({
          error: z.string(),
        }),
      },
    },
    async handler(req, reply) {
      const {
        ingestionId,
        name,
        friendlyId,
        languageCode,
        generateCompetitiveIntelligence,
        duplicateCompetitiveIntelligence,
        duplicateId,
        files,
      } = req.body;

      // Validate files
      if (!files || files.length === 0) {
        return reply.code(400).send({ error: 'No files provided' });
      }

      // Check file types
      for (const file of files) {
        if (!ALLOWED_MIME_TYPES.includes(file.mimeType)) {
          return reply.code(400).send({
            error: `Unsupported file type: ${file.mimeType}`,
          });
        }
      }

      // Validate duplicate competitive intelligence request
      if (duplicateCompetitiveIntelligence) {
        if (!duplicateId) {
          return reply.code(400).send({
            error:
              'duplicateId is required when duplicateCompetitiveIntelligence is true',
          });
        }

        // Verify the source product exists and belongs to the company
        const sourceProduct = await SalesProduct.findOne({
          $or: [{ _id: duplicateId }, { friendlyId: duplicateId }],
          company: req.user?.company,
        });

        if (!sourceProduct) {
          return reply.code(404).send({
            error: 'Source product not found for duplication',
          });
        }

        // Verify the source product has competitive intelligence
        const sourceCompetitor = await SalesProductCompetitor.findOne({
          product: sourceProduct._id,
        });

        if (!sourceCompetitor) {
          return reply.code(400).send({
            error: 'Source product does not have competitive intelligence',
          });
        }
      }

      const draftId = randomUUID();

      // Check if we can copy extracted data from source (files match)
      let sourceIngestionData = null;
      let sourceFiles = null;
      if (duplicateId) {
        const sourceProduct = await SalesProduct.findOne({
          $or: [{ _id: duplicateId }, { friendlyId: duplicateId }],
          company: req.user?.company,
        });

        if (sourceProduct) {
          const sourceIngestion = await ProductIngestion.findOne({
            publishedProductId: sourceProduct._id,
            status: 'published',
          }).sort({ createdAt: -1 });

          if (sourceIngestion) {
            if (sourceIngestion.files) {
              // Compare files by name only (when duplicating, frontend doesn't have actual file sizes)
              const srcFiles = sourceIngestion.files;

              const fileNamesMatch =
                srcFiles.length === files.length &&
                srcFiles.every((sf) =>
                  files.some((f: any) => f.fileName === sf.fileName),
                );

              if (fileNamesMatch) {
                // All files match - can copy extracted data
                if (
                  sourceIngestion.extractedText &&
                  sourceIngestion.extractedFields
                ) {
                  sourceIngestionData = {
                    extractedText: sourceIngestion.extractedText,
                    extractedFields: {
                      ...sourceIngestion.extractedFields,
                      // Override name and friendlyId with user-provided values
                      name: name || sourceIngestion.extractedFields.name,
                      friendlyId:
                        friendlyId ||
                        sourceIngestion.extractedFields.friendlyId,
                    },
                    processingMeta: sourceIngestion.processingMeta,
                  };
                }
              }

              // Create a map of source files for correct metadata
              const sourceFileMap = new Map(
                srcFiles.map((sf) => [sf.fileName, sf]),
              );

              // Use source metadata for files that exist in source (to get correct sizes)
              sourceFiles = files.map((f: any) => {
                const sourceFile = sourceFileMap.get(f.fileName);
                if (sourceFile) {
                  // File exists in source - use source metadata with new s3Key
                  return {
                    fileName: sourceFile.fileName,
                    mimeType: sourceFile.mimeType,
                    size: sourceFile.size, // Use correct size from source
                    s3Key: f.s3Key, // Use new s3Key
                  };
                } else {
                  // New file - use frontend metadata
                  return {
                    fileName: f.fileName,
                    mimeType: f.mimeType,
                    size: f.size,
                    s3Key: f.s3Key,
                  };
                }
              });
            }
          }
        }
      }

      // Create ingestion record
      const ingestion = new ProductIngestion({
        ingestionId,
        draftId,
        company: req.user?.company,
        createdBy: req.user?._id,
        status: sourceIngestionData ? 'parsed' : 'processing',
        input: {
          name: name || undefined,
          friendlyId: friendlyId || undefined,
          languageCode,
        },
        // Use source file metadata if available (has correct sizes), otherwise use frontend data
        files:
          sourceFiles ||
          files.map((f) => ({
            fileName: f.fileName,
            mimeType: f.mimeType,
            size: f.size,
            s3Key: f.s3Key,
          })),
        metadata: {
          generateCompetitiveIntelligence,
          duplicateCompetitiveIntelligence,
          duplicateId,
        },
        // Copy extracted data if files match
        ...(sourceIngestionData && {
          extractedText: sourceIngestionData.extractedText,
          extractedFields: sourceIngestionData.extractedFields,
          processingMeta: sourceIngestionData.processingMeta,
        }),
      });

      await ingestion.save();

      // Queue extraction job (will skip extraction if already parsed)
      const agenda = getAgenda();
      await agenda.now(AGENDA_JOB_TYPES.PRODUCT_EXTRACT_FIELDS, {
        ingestionId,
      });

      // Log admin action
      await logAdminAction(req, {
        action: 'product_import_started',
        category: 'product',
        targetType: 'ProductIngestion',
        targetName: name || 'Unnamed Product',
        details: {
          ingestionId,
          draftId,
          fileCount: files.length,
          languageCode,
          generateCompetitiveIntelligence,
        },
      });

      return reply.code(202).send({
        ingestionId,
        draftId,
        status: 'processing',
        product: {
          name: name || undefined,
          friendlyId: friendlyId || (name ? slugify(name) : undefined),
        },
        warnings: [],
      });
    },
  });

  // GET /manage/products/import/:ingestionId (status)
  app.get('/import/:ingestionId', {
    schema: {
      params: z.object({ ingestionId: z.string().min(1) }),
    },
    async handler(req, reply) {
      const { ingestionId } = req.params as { ingestionId: string };
      const ingestion = await ProductIngestion.findOne({ ingestionId });
      if (!ingestion) {
        return reply.code(404).send({ error: 'Ingestion not found' });
      }
      return reply.send({
        ingestionId: ingestion.ingestionId,
        draftId: ingestion.draftId,
        status: ingestion.status,

        // File information
        files: ingestion.files.map((f) => ({
          fileName: f.fileName,
          mimeType: f.mimeType,
          size: f.size,
          sizeFormatted: `${Math.round(f.size / 1024)}KB`,
        })),

        // Raw extracted text
        extractedText: ingestion.extractedText || [],

        // LLM parsed fields
        parsedPreview: ingestion.extractedFields,

        // Processing metadata
        processingMeta: ingestion.processingMeta,

        // Embeddings info
        embeddingsInfo: ingestion.embeddings
          ? {
              chunkCount: ingestion.embeddings.length,
              avgChunkLength:
                ingestion.embeddings.length > 0
                  ? Math.round(
                      ingestion.embeddings.reduce(
                        (sum, e) => sum + e.text.length,
                        0,
                      ) / ingestion.embeddings.length,
                    )
                  : 0,
            }
          : null,

        errors: ingestion.processingErrors || [],
        warnings: ingestion.processingWarnings || [],
      });
    },
  });

  // POST /manage/products/import/:ingestionId/abort
  app.post('/import/:ingestionId/abort', {
    schema: {
      params: z.object({ ingestionId: z.string().min(1) }),
    },
    async handler(req, reply) {
      const { ingestionId } = req.params as { ingestionId: string };
      const ingestion = await ProductIngestion.findOneAndUpdate(
        { ingestionId },
        { status: 'aborted', updatedAt: new Date() },
        { new: true },
      );
      if (!ingestion) {
        return reply.code(404).send({ error: 'Ingestion not found' });
      }

      // Log admin action
      await logAdminAction(req, {
        action: 'product_import_aborted',
        category: 'product',
        targetType: 'ProductIngestion',
        targetName: ingestion.input?.name || 'Unnamed Product',
        details: {
          ingestionId,
          draftId: ingestion.draftId,
        },
      });

      return reply.send({ status: 'aborted' });
    },
  });

  // GET /manage/products/import/pending - Get pending/in-progress ingestions
  app.get('/import/pending', {
    async handler(req, reply) {
      const companyId = req.user?.company;

      // Fetch ingestions that are still processing
      const ingestions = await ProductIngestion.find({
        company: companyId,
        status: { $in: ['processing', 'extracting', 'embedding', 'parsing'] },
      })
        .sort({ createdAt: -1 })
        .select(
          'ingestionId draftId input files status createdAt processingErrors',
        )
        .lean();

      return reply.send({
        success: true,
        ingestions: ingestions.map((ing: any) => ({
          ingestionId: ing.ingestionId,
          draftId: ing.draftId,
          name: ing.input?.name || 'Unnamed Product',
          fileCount: ing.files?.length || 0,
          status: ing.status,
          createdAt: ing.createdAt,
          errorMessage: ing.processingErrors?.[0] || undefined,
        })),
      });
    },
  });

  // POST /manage/products/drafts/:draftId/publish
  app.post('/drafts/:draftId/publish', {
    schema: {
      params: z.object({ draftId: z.string().min(1) }),
      body: z
        .object({
          name: z.string().optional(),
          friendlyId: z.string().optional(),
          productType: z.enum(['own', 'competitor']).optional(),
          salesTarget: z.enum(['individual', 'corporate']).optional(),
          keyFeatures: z.array(z.string()).optional(),
          featureHighlight: z
            .object({
              title: z.string().optional(),
              description: z.string().optional(),
            })
            .optional(),
          evaluationFocus: z.array(z.string()).optional(),
          callCriteria: z
            .object({
              title: z.string().optional(),
              description: z.string().optional(),
              criteria: z.array(z.string()).optional(),
              markdown: z.string().optional(),
            })
            .optional(),
          localizations: z.record(z.any()).optional(),
        })
        .partial()
        .optional(),
    },
    async handler(req, reply) {
      const { draftId } = req.params as { draftId: string };
      const overrides = (req as any).body || {};

      const ingestion = await ProductIngestion.findOne({ draftId });
      if (!ingestion) {
        return reply.code(404).send({ error: 'Draft not found' });
      }
      if (ingestion.status === 'aborted') {
        return reply.code(400).send({ error: 'Draft was aborted' });
      }
      if (ingestion.status !== 'parsed') {
        return reply
          .code(400)
          .send({ error: 'Draft not ready for publishing' });
      }

      const extracted = ingestion.extractedFields;

      // Create the actual SalesProduct
      const productData = {
        friendlyId:
          overrides.friendlyId || extracted?.friendlyId || 'new-product',
        name: overrides.name || extracted?.name || 'New Product',
        productType: overrides.productType || extracted?.productType || 'own',
        salesTarget:
          overrides.salesTarget || extracted?.salesTarget || 'individual',
        keyFeatures: overrides.keyFeatures || extracted?.keyFeatures || [],
        featureHighlight: overrides.featureHighlight ||
          extracted?.featureHighlight || { title: '', description: '' },
        evaluationFocus:
          overrides.evaluationFocus || extracted?.evaluationFocus || [],
        callCriteria: overrides.callCriteria ||
          extracted?.callCriteria || {
            title: '',
            description: '',
            criteria: [],
            markdown: '',
          },
        localizations:
          overrides.localizations || extracted?.localizations || {},
        company: ingestion.company,
      };

      // Check for slug uniqueness
      const existingProduct = await SalesProduct.findOne({
        friendlyId: productData.friendlyId,
      });
      if (existingProduct) {
        return reply.code(400).send({
          error: `Product with friendlyId '${productData.friendlyId}' already exists`,
        });
      }

      // Set documentCount from ingestion files
      const salesProduct = new SalesProduct({
        ...productData,
        documentCount: ingestion.files?.length || 0,
        createdBy: req.user?._id,
        updatedBy: req.user?._id,
      });
      await salesProduct.save();

      // Duplicate competitive intelligence if requested
      if (
        ingestion.metadata?.duplicateCompetitiveIntelligence &&
        ingestion.metadata?.duplicateId
      ) {
        const sourceProduct = await SalesProduct.findOne({
          $or: [
            { _id: ingestion.metadata.duplicateId },
            { friendlyId: ingestion.metadata.duplicateId },
          ],
          company: ingestion.company,
        });

        if (sourceProduct) {
          const sourceCompetitor = await SalesProductCompetitor.findOne({
            product: sourceProduct._id,
          });

          if (sourceCompetitor) {
            // Create a copy of competitive intelligence for the new product
            await SalesProductCompetitor.create({
              product: salesProduct._id,
              competitors: sourceCompetitor.competitors,
              source: 'duplicated',
              createdAt: new Date(),
              updatedAt: new Date(),
            });
          }
        }
      }

      // Update ingestion status
      await ProductIngestion.findOneAndUpdate(
        { draftId },
        {
          status: 'published',
          publishedProductId: salesProduct._id,
          updatedAt: new Date(),
        },
      );

      // Log admin action
      await logAdminAction(req, {
        action: 'product_published',
        category: 'product',
        targetType: 'SalesProduct',
        targetId: salesProduct._id,
        targetName: salesProduct.name,
        details: {
          friendlyId: salesProduct.friendlyId,
          productType: salesProduct.productType,
          draftId,
        },
      });

      return reply.code(201).send({
        product: salesProduct,
        scenariosCreated: 0,
        status: 'published',
      });
    },
  });

  // GET /manage/products/check-slug
  app.get('/check-slug', {
    schema: {
      querystring: z.object({
        friendlyId: z.string().min(1),
        companyId: z.string().optional(),
      }),
    },
    async handler(req) {
      const { friendlyId, companyId } = req.query as {
        friendlyId: string;
        companyId?: string;
      };
      // Check per-company uniqueness
      const dbExists = await SalesProduct.exists({
        friendlyId,
        ...(companyId ? { company: companyId } : {}),
      });

      const inDraft = await ProductIngestion.exists({
        'extractedFields.friendlyId': friendlyId,
        status: { $nin: ['aborted', 'failed'] },
      });

      return { available: !dbExists && !inDraft };
    },
  });

  app.get('/', {
    schema: {
      querystring: z.object({
        page: z.coerce.number().int().positive().default(1),
        limit: z.coerce.number().int().positive().max(100).default(10),
        search: z.string().optional(),
        productType: z.enum(['own', 'competitor']).optional(),
      }),
    },

    handler: async (req, reply) => {
      try {
        const companyId = req.user!.company;
        const { page, limit, search, productType } = req.query as {
          page: number;
          limit: number;
          search?: string;
          productType?: 'own' | 'competitor';
        };

        // Calculate pagination values
        const skip = (page - 1) * limit;
        console.log('company', companyId);
        // Build query
        const query: any = {
          company: companyId,
          $or: [
            { isPlaceholderProduct: false },
            { isPlaceholderProduct: { $exists: false } },
          ],
        };

        // Add search filter if provided
        if (search && search.trim()) {
          query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { knowledgePrompt: { $regex: search, $options: 'i' } },
          ];
        }

        // Add product type filter if provided
        if (productType) {
          query.productType = productType;
        }

        // Get total count
        const totalProducts = await SalesProduct.countDocuments(query);

        // Calculate pagination metadata
        const totalPages = Math.ceil(totalProducts / limit);
        const hasNextPage = page < totalPages;
        const hasPreviousPage = page > 1;

        // Fetch paginated products with cached counts
        const products = await SalesProduct.find(query)
          .select(
            '_id friendlyId name knowledgePrompt productType keyFeatures salesTarget createdAt updatedAt documentCount roleplayCount hasCompetitiveIntelligence',
          )
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean();

        // Calculate roleplayCount dynamically for accuracy
        const productIds = products.map((p: any) => p._id);
        const roleplayCounts =
          productIds.length > 0
            ? await Scenario.aggregate([
                {
                  $match: {
                    product: { $in: productIds },
                  },
                },
                {
                  $group: {
                    _id: '$product',
                    count: { $sum: 1 },
                  },
                },
              ])
            : [];

        // Create a map for quick lookup
        const roleplayCountMap = new Map(
          roleplayCounts.map((rc: any) => [rc._id.toString(), rc.count]),
        );

        // Enrich products with additional data (using cached fields)
        const enrichedProducts = products.map((product: any) => {
          // Check if product is new (created within last 5 minutes)
          const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
          const isNew = new Date(product.createdAt) > fiveMinutesAgo;

          // Use cached fields
          const competitiveIntelligenceStatus =
            product.hasCompetitiveIntelligence ? 'available' : 'not-available';

          // Calculate accurate roleplayCount
          const roleplayCount =
            roleplayCountMap.get(product._id.toString()) || 0;

          return {
            id: product._id.toString(),
            friendlyId: product.friendlyId,
            name: product.name,
            knowledgePrompt: product.knowledgePrompt || '',
            productType: product.productType,
            keyFeatures: product.keyFeatures || [],
            salesTarget: product.salesTarget,
            createdAt: product.createdAt,
            updatedAt: product.updatedAt,
            documentCount: product.documentCount || 0,
            roleplayCount,
            competitiveIntelligenceStatus,
            isNew,
          };
        });

        return reply.send({
          success: true,
          products: enrichedProducts,
          pagination: {
            currentPage: page,
            totalPages,
            totalProducts,
            hasNextPage,
            hasPreviousPage,
            itemsPerPage: limit,
          },
        });
      } catch (error: any) {
        console.error('Error fetching products:', error);
        return reply.status(500).send({
          success: false,
          error: 'Failed to fetch products',
        });
      }
    },
  });

  // GET /manage/products/:id/usage - Get scenarios/roleplays using this product
  // NOTE: This route must come before /:id to ensure correct matching
  app.get('/:id/usage', {
    schema: {
      params: z.object({ id: z.string().min(1) }),
      querystring: z.object({
        page: z.coerce.number().int().positive().default(1),
        limit: z.coerce.number().int().positive().max(100).default(10),
      }),
    },
    handler: async (req, reply) => {
      try {
        const { id } = req.params as { id: string };
        const { page, limit } = req.query as { page: number; limit: number };
        const companyId = req.user!.company;

        // Verify product exists and belongs to this company
        const product = await SalesProduct.findOne({
          $or: [{ _id: id }, { friendlyId: id }],
          company: companyId,
        }).lean();

        if (!product) {
          return reply.status(404).send({
            success: false,
            error: 'Product not found',
          });
        }

        // Query scenarios using this product
        const query: any = {
          product: product._id,
        };

        // Get total count for pagination
        const totalItems = await Scenario.countDocuments(query);
        const totalPages = Math.ceil(totalItems / limit);
        const hasNextPage = page < totalPages;
        const hasPreviousPage = page > 1;

        // Fetch scenarios with pagination
        const scenarios = await Scenario.find(query)
          .select('_id scenarioDetails createdAt')
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean();

        // Transform scenarios to roleplay format
        const roleplays = scenarios.map((scenario: any) => ({
          id: scenario._id.toString(),
          title:
            scenario.scenarioDetails?.salesGoal ||
            scenario.scenarioDetails?.salesDescription ||
            'Untitled Roleplay',
        }));

        return reply.send({
          success: true,
          roleplays,
          pagination: {
            currentPage: page,
            totalPages,
            totalItems,
            itemsPerPage: limit,
            hasNextPage,
            hasPreviousPage,
          },
        });
      } catch (error: any) {
        console.error('Error fetching product usage:', error);
        return reply.status(500).send({
          success: false,
          error: 'Failed to fetch product usage',
        });
      }
    },
  });

  // GET /manage/products/:id/files/:fileIndex/download - Get presigned URL for file download
  app.get('/:id/files/:fileIndex/download', {
    schema: {
      params: z.object({
        id: z.string().min(1),
        fileIndex: z.coerce.number().int().min(0),
      }),
    },
    handler: async (req, reply) => {
      try {
        const { id, fileIndex } = req.params as {
          id: string;
          fileIndex: number;
        };
        const companyId = req.user!.company;

        // Find product to verify ownership
        const product = await SalesProduct.findOne({
          $or: [{ _id: id }, { friendlyId: id }],
          company: companyId,
        }).lean();

        if (!product) {
          return reply.code(404).send({
            success: false,
            error: 'Product not found',
          });
        }

        // Find the ingestion to get the file's S3 key
        const ingestion = await ProductIngestion.findOne({
          publishedProductId: product._id,
          status: 'published',
        }).lean();

        if (!ingestion) {
          return reply.code(404).send({
            success: false,
            error: 'Product ingestion not found',
          });
        }

        // Get file by index
        if (fileIndex < 0 || fileIndex >= ingestion.files.length) {
          return reply.code(404).send({
            success: false,
            error: 'File not found',
          });
        }

        const file = ingestion.files[fileIndex];

        // Generate presigned URL
        try {
          const downloadUrl = await req.server.s3.getSignedUrl(file.s3Key);
          return reply.send({
            success: true,
            downloadUrl,
            fileName: file.fileName,
            mimeType: file.mimeType,
          });
        } catch (error) {
          req.log.error({ err: error }, 'Error generating presigned URL:');
          return reply.code(500).send({
            success: false,
            error: 'Failed to generate download URL',
          });
        }
      } catch (error: any) {
        console.error('Error fetching download URL:', error);
        return reply.status(500).send({
          success: false,
          error: 'Failed to fetch download URL',
        });
      }
    },
  });

  // GET /manage/products/:id - Get single product details
  app.get('/:id', {
    schema: {
      params: z.object({ id: z.string().min(1) }),
    },
    handler: async (req, reply) => {
      try {
        const { id } = req.params as { id: string };
        const companyId = req.user!.company;

        // Find product by ID or friendlyId with populated lastUpdatedBy
        const product = await SalesProduct.findOne({
          $or: [{ _id: id }, { friendlyId: id }],
          company: companyId,
        })
          .select(
            '_id friendlyId name knowledgePrompt productType keyFeatures salesTarget createdAt updatedAt roleplayCount featureHighlight createdBy updatedBy',
          )
          .populate<{
            createdBy: ManageUserDocument;
            updatedBy: ManageUserDocument;
          }>('createdBy updatedBy', 'email name')
          .lean();

        if (!product) {
          return reply.code(404).send({
            success: false,
            error: 'Product not found',
          });
        }

        // Find related ProductIngestion to get files
        const ingestion = await ProductIngestion.findOne({
          publishedProductId: product._id,
          status: 'published',
        }).lean();

        // Find competitive intelligence if available
        const competitorData = await SalesProductCompetitor.findOne({
          product: product._id,
        }).lean();

        // Calculate roleplayCount on-the-fly for accuracy
        const roleplayCount = await Scenario.countDocuments({
          product: product._id,
        });

        // Build product summary from featureHighlight if available
        const productSummary =
          product.featureHighlight?.title ||
          product.featureHighlight?.description
            ? {
                premiumInfo: product.featureHighlight.title || '',
                minimumAnnualPremium:
                  product.featureHighlight.description || '',
                features: product.keyFeatures || [],
              }
            : undefined;

        // Transform to response format
        const productResponse = {
          id: product._id.toString(),
          friendlyId: product.friendlyId,
          name: product.name,
          knowledgePrompt: product.knowledgePrompt || '',
          productType: product.productType,
          keyFeatures: product.keyFeatures || [],
          featureHighlight: product.featureHighlight,
          salesTarget: product.salesTarget,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
          createdBy: product.createdBy,
          updatedBy: product.updatedBy,
          productSummary,
          roleplayCount,
          files: ingestion?.files
            ? ingestion.files.map((f) => ({
                fileName: f.fileName,
                mimeType: f.mimeType,
                size: f.size,
              }))
            : [],
          competitiveIntelligence: competitorData
            ? {
                competitors: competitorData.competitors || [],
                source: competitorData.source,
              }
            : null,
        };

        return reply.send({
          success: true,
          product: productResponse,
        });
      } catch (error: any) {
        console.error('Error fetching product:', error);
        return reply.status(500).send({
          success: false,
          error: 'Failed to fetch product',
        });
      }
    },
  });

  // PUT /manage/products/:id - Update product fields with S3 keys
  app.put('/:id', {
    schema: {
      params: z.object({ id: z.string().min(1) }),
      body: z
        .object({
          featureHighlight: z
            .object({
              title: z.string().optional(),
              description: z.string().optional(),
            })
            .optional(),
          keyFeatures: z.array(z.string()).optional(),
          name: z.string().optional(),
          filesToRemove: z.array(z.number()).optional(),
          filesToAdd: z
            .array(
              z.object({
                fileName: z.string(),
                mimeType: z.string(),
                size: z.number(),
                s3Key: z.string(),
              }),
            )
            .optional(),
        })
        .partial()
        .optional(),
    },
    handler: async (req, reply) => {
      try {
        const { id } = req.params as { id: string };
        const companyId = req.user!.company;
        const updateData = (req as any).body || {};

        // Find product and verify ownership
        const product = await SalesProduct.findOne({
          $or: [{ _id: id }, { friendlyId: id }],
          company: companyId,
        });

        if (!product) {
          return reply.status(404).send({
            success: false,
            error: 'Product not found',
          });
        }

        // Handle file updates if provided
        if (updateData.filesToRemove || updateData.filesToAdd) {
          // Find related ProductIngestion
          const ingestion = await ProductIngestion.findOne({
            publishedProductId: product._id,
            status: 'published',
          });

          if (!ingestion) {
            return reply.status(404).send({
              success: false,
              error: 'Product ingestion not found',
            });
          }

          // Update product name if provided
          if (updateData.name !== undefined && updateData.name.trim() !== '') {
            product.name = updateData.name.trim();
            product.updatedBy = req.user?._id;
            await product.save();
          }

          // Use service to handle file operations and re-extraction
          try {
            await ProductFileService.updateProductFiles(
              ingestion,
              product,
              updateData.filesToRemove || [],
              updateData.filesToAdd || [],
            );
          } catch (error) {
            if (
              error instanceof Error &&
              error.message === 'At least one file is required'
            ) {
              return reply.code(400).send({
                error: error.message,
              });
            }
            throw error;
          }

          // Return updated product with files
          const updatedProduct = await SalesProduct.findById(product._id)
            .populate<{
              createdBy: ManageUserDocument;
              updatedBy: ManageUserDocument;
            }>('createdBy updatedBy', 'email name')
            .lean();

          // Find competitive intelligence
          const competitorData = await SalesProductCompetitor.findOne({
            product: product._id,
          }).lean();

          const productResponse = {
            id: updatedProduct!._id.toString(),
            friendlyId: updatedProduct!.friendlyId,
            name: updatedProduct!.name,
            knowledgePrompt: updatedProduct!.knowledgePrompt || '',
            productType: updatedProduct!.productType,
            keyFeatures: updatedProduct!.keyFeatures || [],
            featureHighlight: updatedProduct!.featureHighlight,
            salesTarget: updatedProduct!.salesTarget,
            createdAt: updatedProduct!.createdAt,
            updatedAt: updatedProduct!.updatedAt,
            createdBy: updatedProduct!.createdBy,
            updatedBy: updatedProduct!.updatedBy,
            files: ingestion.files.map((f) => ({
              fileName: f.fileName,
              mimeType: f.mimeType,
              size: f.size,
            })),
            competitiveIntelligence: competitorData
              ? {
                  competitors: competitorData.competitors || [],
                  source: competitorData.source,
                }
              : null,
          };

          // Log admin action
          await logAdminAction(req, {
            action: 'product_updated',
            category: 'product',
            targetType: 'SalesProduct',
            targetId: product._id,
            targetName: updatedProduct!.name,
            details: {
              filesRemoved: updateData.filesToRemove?.length || 0,
              filesAdded: updateData.filesToAdd?.length || 0,
              nameChanged: updateData.name !== undefined,
            },
          });

          return reply.send({
            success: true,
            product: productResponse,
          });
        }

        // Handle JSON body (existing functionality for featureHighlight and keyFeatures only)

        // Build update object
        const updateFields: any = {
          updatedBy: req.user?._id,
        };

        if (updateData.featureHighlight !== undefined) {
          updateFields.featureHighlight = {
            title:
              updateData.featureHighlight.title ??
              product.featureHighlight?.title ??
              '',
            description:
              updateData.featureHighlight.description ??
              product.featureHighlight?.description ??
              '',
          };
        }

        if (updateData.keyFeatures !== undefined) {
          updateFields.keyFeatures = updateData.keyFeatures;
        }

        // Update the product
        const updatedProduct = await SalesProduct.findByIdAndUpdate(
          product._id,
          { $set: updateFields },
          { new: true, runValidators: true },
        )
          .populate<{
            createdBy: ManageUserDocument;
            updatedBy: ManageUserDocument;
          }>('createdBy updatedBy', 'email name')
          .lean();

        if (!updatedProduct) {
          return reply.status(500).send({
            success: false,
            error: 'Failed to update product',
          });
        }

        // Find related ProductIngestion to get files
        const ingestion = await ProductIngestion.findOne({
          publishedProductId: updatedProduct._id,
          status: 'published',
        }).lean();

        // Find competitive intelligence if available
        const competitorData = await SalesProductCompetitor.findOne({
          product: updatedProduct._id,
        }).lean();

        // Build product summary from featureHighlight if available
        const productSummary =
          updatedProduct.featureHighlight?.title ||
          updatedProduct.featureHighlight?.description
            ? {
                premiumInfo: updatedProduct.featureHighlight.title || '',
                minimumAnnualPremium:
                  updatedProduct.featureHighlight.description || '',
                features: updatedProduct.keyFeatures || [],
              }
            : undefined;

        // Transform to response format (matching GET endpoint structure)
        const productResponse = {
          id: updatedProduct._id.toString(),
          friendlyId: updatedProduct.friendlyId,
          name: updatedProduct.name,
          knowledgePrompt: updatedProduct.knowledgePrompt || '',
          productType: updatedProduct.productType,
          keyFeatures: updatedProduct.keyFeatures || [],
          featureHighlight: updatedProduct.featureHighlight,
          salesTarget: updatedProduct.salesTarget,
          createdAt: updatedProduct.createdAt,
          updatedAt: updatedProduct.updatedAt,
          createdBy: updatedProduct.createdBy,
          updatedBy: updatedProduct.updatedBy,
          productSummary,
          files: ingestion?.files
            ? ingestion.files.map((f) => ({
                fileName: f.fileName,
                mimeType: f.mimeType,
                size: f.size,
              }))
            : [],
          competitiveIntelligence: competitorData
            ? {
                competitors: competitorData.competitors || [],
                source: competitorData.source,
              }
            : null,
        };

        // Log admin action
        await logAdminAction(req, {
          action: 'product_updated',
          category: 'product',
          targetType: 'SalesProduct',
          targetId: updatedProduct._id,
          targetName: updatedProduct.name,
          details: {
            featureHighlightUpdated: updateData.featureHighlight !== undefined,
            keyFeaturesUpdated: updateData.keyFeatures !== undefined,
          },
        });

        return reply.send({
          success: true,
          product: productResponse,
        });
      } catch (error: any) {
        console.error('Error updating product:', error);
        return reply.status(500).send({
          success: false,
          error: 'Failed to update product',
        });
      }
    },
  });

  // PUT /manage/products/:id/competitors/:competitorIndex - Update a specific competitor
  app.put('/:id/competitors/:competitorIndex', {
    schema: {
      params: z.object({
        id: z.string().min(1),
        competitorIndex: z.coerce.number().int().min(0),
      }),
      body: z.object({
        name: z.string().optional(),
        provider: z.string().optional(),
        type: z.string().optional(),
        keyFeatures: z.array(z.string()).optional(),
        strengths: z.array(z.string()).optional(),
        limitations: z.array(z.string()).optional(),
        positioningStrategy: z.string().optional(),
      }),
    },
    handler: async (req, reply) => {
      try {
        const { id, competitorIndex } = req.params as {
          id: string;
          competitorIndex: number;
        };
        const companyId = req.user!.company;
        const updateData = (req as any).body || {};

        // Find product to verify ownership
        const product = await SalesProduct.findOne({
          $or: [{ _id: id }, { friendlyId: id }],
          company: companyId,
        }).lean();

        if (!product) {
          return reply.status(404).send({
            success: false,
            error: 'Product not found',
          });
        }

        // Find competitive intelligence
        const competitorData = await SalesProductCompetitor.findOne({
          product: product._id,
        });

        if (!competitorData) {
          return reply.status(404).send({
            success: false,
            error: 'Competitive intelligence not found',
          });
        }

        // Check if competitor index is valid
        if (
          competitorIndex < 0 ||
          competitorIndex >= competitorData.competitors.length
        ) {
          return reply.status(400).send({
            success: false,
            error: 'Invalid competitor index',
          });
        }

        // Update the competitor
        const competitor = competitorData.competitors[competitorIndex];
        if (updateData.name !== undefined) {
          competitor.name = updateData.name;
        }
        if (updateData.provider !== undefined) {
          competitor.company = updateData.provider;
        }
        if (updateData.type !== undefined) {
          competitor.type = updateData.type;
        }
        if (updateData.keyFeatures !== undefined) {
          competitor.keyFeatures = updateData.keyFeatures.filter(
            (f: string) => f.trim() !== '',
          );
        }
        if (updateData.strengths !== undefined) {
          competitor.strengths = updateData.strengths.filter(
            (s: string) => s.trim() !== '',
          );
        }
        if (updateData.limitations !== undefined) {
          competitor.limitations = updateData.limitations.filter(
            (l: string) => l.trim() !== '',
          );
        }
        if (updateData.positioningStrategy !== undefined) {
          competitor.positioningStrategy = updateData.positioningStrategy;
        }

        // Save the updated competitive intelligence
        await competitorData.save();

        // Log admin action
        await logAdminAction(req, {
          action: 'product_competitor_updated',
          category: 'product',
          targetType: 'SalesProductCompetitor',
          targetId: product._id,
          targetName: product.name,
          details: {
            competitorIndex,
            competitorType: competitor.type,
          },
        });

        // Return updated competitor data
        return reply.send({
          success: true,
          competitor: competitorData.competitors[competitorIndex],
        });
      } catch (error: any) {
        console.error('Error updating competitor:', error);
        return reply.status(500).send({
          success: false,
          error: 'Failed to update competitor',
        });
      }
    },
  });

  // DELETE /manage/products/:id - Delete a product
  app.delete('/:id', {
    schema: {
      params: z.object({ id: z.string().min(1) }),
    },
    handler: async (req, reply) => {
      try {
        const { id } = req.params as { id: string };
        const companyId = req.user!.company;

        // Find product first to check if it's linked to roleplays
        const product = await SalesProduct.findOne({
          $or: [{ _id: id }, { friendlyId: id }],
          company: companyId,
        }).lean();

        if (!product) {
          return reply.status(404).send({
            success: false,
            error: 'Product not found',
          });
        }

        // Check if product is linked to any roleplays
        const roleplayCount = await Scenario.countDocuments({
          product: product._id,
        });

        if (roleplayCount > 0) {
          return reply.status(400).send({
            success: false,
            error:
              'Products linked to a roleplay cannot be deleted. Reassign the roleplays to another product to delete.',
          });
        }

        // Delete the product
        const deletedProduct = await SalesProduct.findOneAndDelete({
          _id: product._id,
          company: companyId,
        });

        if (!deletedProduct) {
          return reply.status(404).send({
            success: false,
            error: 'Product not found or unauthorized',
          });
        }

        // Log admin action
        await logAdminAction(req, {
          action: 'product_deleted',
          category: 'product',
          targetType: 'SalesProduct',
          targetId: product._id,
          targetName: product.name,
          details: {
            friendlyId: product.friendlyId,
          },
        });

        return reply.send({
          success: true,
          message: 'Product deleted successfully',
        });
      } catch (error: any) {
        console.error('Error deleting product:', error);
        return reply.status(500).send({
          success: false,
          error: 'Failed to delete product',
        });
      }
    },
  });

  app.log.info('[manage/products.ts] routes registered');
};

export default router;
