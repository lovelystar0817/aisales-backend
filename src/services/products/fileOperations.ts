import {
  ProductIngestion,
  ProductIngestionDocument,
} from '../../models/ProductIngestion.js';
import {
  SalesProduct,
  SalesProductDocument,
} from '../../models/SalesProduct.js';
import { getAgenda } from '../../jobs/agenda.js';
import { AGENDA_JOB_TYPES } from '../../utils/constants.js';

export interface FileUploadResult {
  fileName: string;
  mimeType: string;
  size: number;
  s3Key: string;
}

export interface FileUpdateParams {
  ingestionId: string;
  filesToRemove?: number[];
  newFiles?: FileUploadResult[];
}

/**
 * Service for handling product file operations including re-extraction logic
 */
export class ProductFileService {
  /**
   * Updates product files and triggers re-extraction if needed
   */
  static async updateProductFiles(
    ingestion: ProductIngestionDocument,
    product: SalesProductDocument,
    filesToRemove: number[] = [],
    newFiles: FileUploadResult[] = [],
  ): Promise<{ needsReExtraction: boolean }> {
    let needsReExtraction = false;

    // Handle file removals
    if (filesToRemove.length > 0) {
      needsReExtraction = true;
      // Remove files by index (in reverse order to maintain indices)
      const sortedIndices = [...filesToRemove].sort((a, b) => b - a);
      for (const index of sortedIndices) {
        if (index >= 0 && index < ingestion.files.length) {
          ingestion.files.splice(index, 1);
        }
      }
    }

    // Handle new file uploads
    if (newFiles.length > 0) {
      needsReExtraction = true;
      for (const file of newFiles) {
        ingestion.files.push({
          fileName: file.fileName,
          mimeType: file.mimeType,
          size: file.size,
          s3Key: file.s3Key,
        });
      }
    }

    // Validate that at least one file remains
    if (ingestion.files.length === 0) {
      throw new Error('At least one file is required');
    }

    // Update documentCount
    product.documentCount = ingestion.files.length;
    await product.save();

    // Reset ingestion status if files changed
    if (needsReExtraction) {
      ingestion.status = 'processing';
      ingestion.extractedFields = undefined;
      ingestion.extractedText = [];
      ingestion.embeddings = [];
      ingestion.processingMeta = undefined;
      ingestion.processingErrors = [];
      ingestion.processingWarnings = [];
    }

    // Save ingestion
    await ingestion.save();

    // Trigger re-extraction if files were added or removed
    if (needsReExtraction) {
      const agenda = getAgenda();
      await agenda.now(AGENDA_JOB_TYPES.PRODUCT_EXTRACT_FIELDS, {
        ingestionId: ingestion.ingestionId,
      });
    }

    return { needsReExtraction };
  }
}
