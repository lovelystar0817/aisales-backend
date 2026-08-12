import { Job } from '@hokify/agenda';
import { ProductIngestion } from '../../models/ProductIngestion.js';
import { randomUUID } from 'node:crypto';
import OpenAI from 'openai';

interface GenerateEmbeddingsJobData {
  ingestionId: string;
}

// Simple text chunker
const chunkText = (text: string, chunkSize: number = 500): string[] => {
  const chunks: string[] = [];
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);

  let currentChunk = '';
  for (const sentence of sentences) {
    if (
      currentChunk.length + sentence.length > chunkSize &&
      currentChunk.length > 0
    ) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += (currentChunk ? '. ' : '') + sentence;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
};

const generateEmbedding = async (text: string): Promise<number[]> => {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text,
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    // Fallback to zero vector if API fails
    return Array(1536).fill(0);
  }
};

export const generateEmbeddingsJob = async (
  job: Job<GenerateEmbeddingsJobData>,
) => {
  const { ingestionId } = job.attrs.data;

  try {
    const ingestion = await ProductIngestion.findOne({ ingestionId });
    if (!ingestion) {
      throw new Error(`Ingestion not found: ${ingestionId}`);
    }

    if (!ingestion.extractedFields) {
      throw new Error(`No extracted fields found for ingestion ${ingestionId}`);
    }

    console.log(`[generateEmbeddingsJob] Processing ingestion ${ingestionId}`);

    // Get all text from extracted fields
    const { extractedFields } = ingestion;
    const allText = [
      extractedFields.name,
      extractedFields.featureHighlight?.title,
      extractedFields.featureHighlight?.description,
      ...(extractedFields.keyFeatures || []),
      ...(extractedFields.evaluationFocus || []),
      extractedFields.callCriteria?.title,
      extractedFields.callCriteria?.description,
      ...(extractedFields.callCriteria?.criteria || []),
      extractedFields.callCriteria?.markdown,
    ]
      .filter(Boolean)
      .join(' ');

    // Chunk the text
    const chunks = chunkText(allText);

    // Generate embeddings for each chunk
    const embeddings = [];
    for (const chunk of chunks) {
      const embedding = await generateEmbedding(chunk);
      embeddings.push({
        chunkId: randomUUID(),
        text: chunk,
        embedding,
      });
    }

    // Update ingestion record
    await ProductIngestion.findOneAndUpdate(
      { ingestionId },
      {
        $set: {
          embeddings,
          updatedAt: new Date(),
        },
      },
    );

    console.log(
      `[generateEmbeddingsJob] Generated ${embeddings.length} embeddings for ${ingestionId}`,
    );
  } catch (error) {
    console.error(
      `[generateEmbeddingsJob] Error processing ${ingestionId}:`,
      error,
    );

    await ProductIngestion.findOneAndUpdate(
      { ingestionId },
      {
        $push: {
          errors: (error as Error).message,
        },
        $set: {
          updatedAt: new Date(),
        },
      },
    );

    throw error;
  }
};
