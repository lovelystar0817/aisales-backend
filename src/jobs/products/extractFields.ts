// CRITICAL: Import polyfills BEFORE officeparser — officeparser loads pdfjs-dist
// which requires browser globals (Path2D, ImageData, DOMMatrix) to be polyfilled first
import '../../utils/pdfjs-polyfills.js';

import { Job } from '@hokify/agenda';
import { ProductIngestion } from '../../models/ProductIngestion.js';
import { SalesProduct } from '../../models/SalesProduct.js';
import { SalesProductCompetitor } from '../../models/SalesProductCompetitor.js';
import { AGENDA_JOB_TYPES } from '../../utils/constants.js';
import officeParser from 'officeparser';
import { getAgenda } from '../agenda.js';
import { generateCompetitiveIntelligence } from './generateCompetitiveIntelligence.js';
import { extractPdfWithVision, PageContent } from './extractPdfPages.js';
import { mapReduceSummarize, ReducedOutput } from './mapReduceSummarize.js';

interface ExtractFieldsJobData {
  ingestionId: string;
}

// Real text extractors using officeparser
const extractTextFromFile = async (
  fileBuffer: Buffer,
  mimeType: string,
): Promise<string> => {
  try {
    switch (mimeType) {
      case 'text/plain':
      case 'text/markdown':
        return fileBuffer.toString('utf-8');
      case 'application/json':
        return fileBuffer.toString('utf-8');
      case 'text/csv':
        return fileBuffer.toString('utf-8');
      case 'application/pdf':
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
      case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        // Use officeparser for PDF, DOCX, PPTX, XLSX
        const text = await officeParser.parseOfficeAsync(fileBuffer);
        return text || '';
      default:
        console.warn(`Unsupported file type for extraction: ${mimeType}`);
        return `[Unsupported file type: ${mimeType}]`;
    }
  } catch (error) {
    console.error(`Error extracting text from ${mimeType}:`, error);
    return `[Error extracting text: ${(error as Error).message}]`;
  }
};

export const extractFieldsJob = async (job: Job<ExtractFieldsJobData>) => {
  const { ingestionId } = job.attrs.data;

  try {
    const ingestion = await ProductIngestion.findOne({ ingestionId });
    if (!ingestion) {
      throw new Error(`Ingestion not found: ${ingestionId}`);
    }

    console.log(`[extractFieldsJob] Processing ingestion ${ingestionId}`);

    let updatedIngestion;
    let extractedFields: ReducedOutput | undefined;

    // If already parsed (e.g., from duplication), skip extraction and go straight to publish
    if (ingestion.status === 'parsed' && ingestion.extractedFields) {
      console.log(
        `[extractFieldsJob] Ingestion ${ingestionId} already parsed, skipping extraction`,
      );
      updatedIngestion = ingestion;
      extractedFields = ingestion.extractedFields;
    } else {
      // Extract content from all files using vision (PDF) or text extraction (other)
      const { S3 } = await import('../../libs/s3.js');
      const allPageContents: string[] = [];
      const extractedText: {
        fileName: string;
        text: string;
        wordCount: number;
        language: string;
      }[] = [];

      const extractionStart = Date.now();
      for (const file of ingestion.files) {
        try {
          const fileBuffer = await S3.getFileBufferFromProductUpload(
            file.s3Key,
          );

          if (file.mimeType === 'application/pdf') {
            // Use vision pipeline for PDFs
            const pageContents: PageContent[] =
              await extractPdfWithVision(fileBuffer);
            const combinedText = pageContents
              .map((pc) => pc.extractedContent)
              .join('\n\n');
            const wordCount = combinedText.split(/\s+/).length;

            extractedText.push({
              fileName: file.fileName,
              text: combinedText,
              wordCount,
              language: 'en',
            });

            // Add each page's content as a separate string for map-reduce
            for (const pc of pageContents) {
              allPageContents.push(pc.extractedContent);
            }
          } else {
            // Use text extraction for non-PDF files
            const text = await extractTextFromFile(fileBuffer, file.mimeType);
            const wordCount = text.split(/\s+/).length;

            extractedText.push({
              fileName: file.fileName,
              text,
              wordCount,
              language: 'en',
            });

            allPageContents.push(text);
          }
        } catch (error) {
          console.error(`Error extracting text from ${file.fileName}:`, error);
          const errorText = `Failed to extract text: ${(error as Error).message}`;

          extractedText.push({
            fileName: file.fileName,
            text: errorText,
            wordCount: 0,
            language: 'en',
          });
        }
      }

      const extractionTimeMs = Date.now() - extractionStart;

      // Extract fields using map-reduce pipeline
      const startTime = Date.now();
      extractedFields = await mapReduceSummarize(
        allPageContents,
        ingestion.input,
      );
      const processingTimeMs = Date.now() - startTime;

      const totalTextLength = allPageContents.reduce(
        (sum, c) => sum + c.length,
        0,
      );

      // Create processing metadata
      const processingMeta = {
        totalTextLength,
        extractionTimeMs,
        processingTimeMs,
        confidence: {
          name: extractedFields.name ? 0.9 : 0.1,
          friendlyId: extractedFields.friendlyId ? 0.9 : 0.1,
          keyFeatures:
            (extractedFields.keyFeatures?.length || 0) > 0 ? 0.8 : 0.2,
          featureHighlight: extractedFields.featureHighlight?.title ? 0.8 : 0.2,
          suggestedModules:
            (extractedFields.suggestedModules?.length || 0) > 0 ? 0.7 : 0.3,
        },
      };

      // Update ingestion record with extracted data
      updatedIngestion = await ProductIngestion.findOneAndUpdate(
        { ingestionId },
        {
          $set: {
            extractedText,
            extractedFields,
            processingMeta,
            status: 'parsed',
            updatedAt: new Date(),
          },
        },
        { new: true },
      );
      if (!updatedIngestion) {
        throw new Error(`Failed to update ingestion: ${ingestionId}`);
      }

      console.log(`[extractFieldsJob] Completed extraction for ${ingestionId}`);
    }

    // Auto-publish: Create or update SalesProduct from extracted fields
    try {
      // Check if product already exists (reingestion case)
      const existingPublishedProductId = updatedIngestion.publishedProductId;
      let salesProduct;

      if (existingPublishedProductId) {
        // Update existing product (reingestion)
        console.log(
          `[extractFieldsJob] Updating existing product ${existingPublishedProductId} for ${ingestionId}`,
        );

        const updateData: any = {
          name: extractedFields.name || 'New Product',
          productType: 'own',
          salesTarget: extractedFields.salesTarget || 'individual',
          keyFeatures: extractedFields.keyFeatures || [],
          featureHighlight: extractedFields.featureHighlight || {
            title: '',
            description: '',
          },
          evaluationFocus: extractedFields.evaluationFocus || [],
          callCriteria: extractedFields.callCriteria || {
            title: '',
            description: '',
            criteria: [],
            markdown: '',
          },
          localizations: extractedFields.localizations || {},
          documentCount: updatedIngestion.files?.length || 0,
          updatedBy: updatedIngestion.createdBy,
        };

        salesProduct = await SalesProduct.findByIdAndUpdate(
          existingPublishedProductId,
          { $set: updateData },
          { new: true },
        );

        if (!salesProduct) {
          throw new Error(
            `Failed to update existing product ${existingPublishedProductId}`,
          );
        }

        console.log(
          `[extractFieldsJob] Updated existing product ${salesProduct._id} for ${ingestionId}`,
        );
      } else {
        // Create new product (initial ingestion)
        const productData = {
          friendlyId: extractedFields.friendlyId || 'new-product',
          name: extractedFields.name || 'New Product',
          productType: 'own',
          salesTarget: extractedFields.salesTarget || 'individual',
          keyFeatures: extractedFields.keyFeatures || [],
          featureHighlight: extractedFields.featureHighlight || {
            title: '',
            description: '',
          },
          evaluationFocus: extractedFields.evaluationFocus || [],
          callCriteria: extractedFields.callCriteria || {
            title: '',
            description: '',
            criteria: [],
            markdown: '',
          },
          localizations: extractedFields.localizations || {},
          company: updatedIngestion.company,
          createdBy: updatedIngestion.createdBy,
          updatedBy: updatedIngestion.createdBy,
          documentCount: 0,
          hasCompetitiveIntelligence: false,
        };

        // Check for slug uniqueness within company (DB has compound unique index)
        const existingProduct = await SalesProduct.findOne({
          friendlyId: productData.friendlyId,
          company: updatedIngestion.company,
        });

        const { randomUUID } = await import('node:crypto');
        if (existingProduct) {
          const uuidSuffix = randomUUID().slice(0, 8);
          productData.friendlyId = `${productData.friendlyId}-${uuidSuffix}`;
          console.log(
            `[extractFieldsJob] Slug collision, using: ${productData.friendlyId}`,
          );
        }

        // Set documentCount from ingestion files
        productData.documentCount = updatedIngestion.files?.length || 0;

        // Save with retry for race conditions (E11000 duplicate key)
        salesProduct = new SalesProduct(productData);
        let retries = 3;
        while (retries > 0) {
          try {
            await salesProduct.save();
            break;
          } catch (error: any) {
            if (error?.code === 11000 && retries > 1) {
              // Duplicate key error - append new UUID suffix and retry
              const baseFriendlyId = productData.friendlyId.replace(
                /-[a-f0-9]{8}$/,
                '',
              );
              const newSuffix = randomUUID().slice(0, 8);
              productData.friendlyId = `${baseFriendlyId}-${newSuffix}`;
              salesProduct = new SalesProduct(productData);
              console.log(
                `[extractFieldsJob] E11000 retry, using: ${productData.friendlyId}`,
              );
              retries--;
            } else {
              throw error;
            }
          }
        }

        // Update ingestion with published product reference
        await ProductIngestion.findOneAndUpdate(
          { ingestionId },
          {
            $set: {
              status: 'published',
              publishedProductId: salesProduct._id,
              updatedAt: new Date(),
            },
          },
        );

        console.log(
          `[extractFieldsJob] Auto-published product ${salesProduct._id} for ${ingestionId}`,
        );
      }

      // Duplicate competitive intelligence if requested
      if (
        updatedIngestion.metadata?.duplicateCompetitiveIntelligence &&
        updatedIngestion.metadata?.duplicateId
      ) {
        try {
          console.log(
            `[extractFieldsJob] Duplicating competitive intelligence from ${updatedIngestion.metadata.duplicateId}`,
          );

          const sourceProduct = await SalesProduct.findOne({
            $or: [
              { _id: updatedIngestion.metadata.duplicateId },
              { friendlyId: updatedIngestion.metadata.duplicateId },
            ],
            company: updatedIngestion.company,
          });

          if (sourceProduct) {
            const sourceCompetitor = await SalesProductCompetitor.findOne({
              product: sourceProduct._id,
            });

            if (sourceCompetitor) {
              // Create a copy of competitive intelligence for the new product
              await SalesProductCompetitor.create({
                product: salesProduct._id,
                company: updatedIngestion.company,
                competitors: sourceCompetitor.competitors,
                source: 'duplicated',
                createdAt: new Date(),
                updatedAt: new Date(),
              });

              // Update product flag
              await SalesProduct.findByIdAndUpdate(salesProduct._id, {
                hasCompetitiveIntelligence: true,
              });

              console.log(
                `[extractFieldsJob] Duplicated competitive intelligence with ${sourceCompetitor.competitors.length} competitors for product ${salesProduct._id}`,
              );
            } else {
              console.warn(
                `[extractFieldsJob] Source product has no competitive intelligence to duplicate`,
              );
            }
          } else {
            console.warn(
              `[extractFieldsJob] Source product not found for duplication: ${updatedIngestion.metadata.duplicateId}`,
            );
          }
        } catch (duplicationError) {
          console.error(
            `[extractFieldsJob] Failed to duplicate competitive intelligence for ${ingestionId}:`,
            duplicationError,
          );
          // Add warning but don't fail the whole job
          await ProductIngestion.findOneAndUpdate(
            { ingestionId },
            {
              $push: {
                processingWarnings: `Failed to duplicate competitive intelligence: ${(duplicationError as Error).message}`,
              },
            },
          );
        }
      }

      // Generate competitive intelligence if requested
      // For reingestion, regenerate if flag is set (may have been requested initially)
      if (ingestion.metadata?.generateCompetitiveIntelligence) {
        try {
          console.log(
            `[extractFieldsJob] Generating competitive intelligence for product ${salesProduct._id}`,
          );

          // Build product description from available data
          const productDescription =
            salesProduct.featureHighlight?.description ||
            salesProduct.callCriteria?.description ||
            salesProduct.knowledgePrompt ||
            undefined;

          const competitors = await generateCompetitiveIntelligence({
            productName: salesProduct.name,
            productFeatures: salesProduct.keyFeatures || [],
            productDescription,
            languageCode: ingestion.input?.languageCode || 'en',
          });

          // Update or create competitive intelligence
          const existingCI = await SalesProductCompetitor.findOne({
            product: salesProduct._id,
          });

          if (existingCI) {
            // Update existing competitive intelligence
            existingCI.competitors = competitors;
            existingCI.source = 'openai_web_search';
            await existingCI.save();
          } else {
            // Create new competitive intelligence
            const competitorDoc = new SalesProductCompetitor({
              product: salesProduct._id,
              company: updatedIngestion.company,
              competitors,
              source: 'openai_web_search',
            });
            await competitorDoc.save();
          }

          // Update product flag
          await SalesProduct.findByIdAndUpdate(salesProduct._id, {
            hasCompetitiveIntelligence: true,
          });

          console.log(
            `[extractFieldsJob] Generated competitive intelligence with ${competitors.length} competitors for product ${salesProduct._id}`,
          );
        } catch (ciError) {
          console.error(
            `[extractFieldsJob] Failed to generate competitive intelligence for ${ingestionId}:`,
            ciError,
          );
          // Add warning but don't fail the whole job
          await ProductIngestion.findOneAndUpdate(
            { ingestionId },
            {
              $push: {
                processingWarnings: `Failed to generate competitive intelligence: ${(ciError as Error).message}`,
              },
            },
          );
        }
      }
    } catch (publishError) {
      console.error(
        `[extractFieldsJob] Failed to auto-publish product for ${ingestionId}:`,
        publishError,
      );
      // Don't throw - extraction succeeded, just log the publish failure
    }

    // Queue embeddings generation
    try {
      const agenda = getAgenda();
      await agenda.now(AGENDA_JOB_TYPES.PRODUCT_GENERATE_EMBEDDINGS, {
        ingestionId,
      });
      console.log(
        `[extractFieldsJob] Queued embeddings generation for ${ingestionId}`,
      );
    } catch (error) {
      console.error(
        `[extractFieldsJob] Failed to queue embeddings job for ${ingestionId}:`,
        error,
      );
    }
  } catch (error) {
    console.error(`[extractFieldsJob] Error processing ${ingestionId}:`, error);

    await ProductIngestion.findOneAndUpdate(
      { ingestionId },
      {
        $set: {
          status: 'failed',
          processingErrors: [(error as Error).message],
          updatedAt: new Date(),
        },
      },
    );

    throw error;
  }
};
