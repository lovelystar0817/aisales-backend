// src/libs/s3.ts

import mime from 'mime-types';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  GetObjectCommandInput,
  CopyObjectCommand,
  ObjectCannedACL,
  MetadataDirective,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Validate AWS credentials
const validateAWSCredentials = () => {
  const required = [
    'AWS_REGION',
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'AWS_BUCKET_NAME',
  ];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error(
      `❌ Missing required AWS environment variables: ${missing.join(', ')}`,
    );
    console.error('Please add these to your .env file:');
    missing.forEach((key) => console.error(`  ${key}=your_value_here`));
    throw new Error(`Missing AWS credentials: ${missing.join(', ')}`);
  }

  console.log('✅ AWS credentials validated');
};

// Lazy-loaded S3 client - only initialize when first used
let s3Client: S3Client | null = null;

const getS3Client = (): S3Client => {
  if (!s3Client) {
    // Validate credentials when client is first requested
    validateAWSCredentials();

    s3Client = new S3Client({
      region: process.env.AWS_REGION!,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
  }
  return s3Client;
};

// URL expiration time in seconds (e.g., 7 days)
const URL_EXPIRATION = 7 * 24 * 60 * 60;

export const S3 = {
  async uploadFile(
    fileBuffer: Buffer,
    fileName: string,
  ): Promise<{ key: string; url: string }> {
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileName,
      Body: fileBuffer,
      ContentType: mime.lookup(fileName) || 'application/octet-stream',
      ObjectCannedACL: ObjectCannedACL.public_read,
    };

    try {
      const client = getS3Client(); // Get client when needed
      await client.send(new PutObjectCommand(params));

      // Generate a signed URL
      const signedUrl = await this.getSignedUrl(fileName);

      return {
        key: fileName,
        url: signedUrl,
      };
    } catch (error) {
      console.error('Error uploading file to S3:', error);
      if (error instanceof Error && error.message.includes('credential')) {
        throw new Error(
          'AWS credentials are invalid or expired. Please check your .env file.',
        );
      }
      throw new Error('Failed to upload file to S3');
    }
  },

  async uploadAvatarImage(
    fileBuffer: Buffer,
    fileName: string,
  ): Promise<{ key: string; url: string }> {
    const params = {
      Bucket: process.env.AWS_AVATAR_BUCKET_NAME,
      Key: fileName,
      Body: fileBuffer,
      ACL: ObjectCannedACL.public_read,
      CacheControl: 'max-age=0',
      ContentType: mime.lookup(fileName) || 'application/octet-stream',
    };

    try {
      const client = getS3Client();
      await client.send(new PutObjectCommand(params));

      const s3Url = `https://${process.env.AWS_AVATAR_BUCKET_NAME}.s3.amazonaws.com/${fileName}`;

      return {
        key: fileName,
        url: s3Url,
      };
    } catch (error) {
      console.error('Error uploading avatar image to S3:', error);
      if (error instanceof Error && error.message.includes('credential')) {
        throw new Error(
          'AWS credentials are invalid or expired. Please check your .env file.',
        );
      }
      throw new Error('Failed to upload avatar image to S3');
    }
  },

  async getFileContent(fileName: string): Promise<string> {
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileName,
    };

    try {
      const client = getS3Client(); // Get client when needed
      const response = await client.send(new GetObjectCommand(params));
      return (await response.Body?.transformToString()) || '';
    } catch (error) {
      console.error('Error getting file from S3:', error);
      if (error instanceof Error && error.message.includes('credential')) {
        throw new Error(
          'AWS credentials are invalid or expired. Please check your .env file.',
        );
      }
      throw new Error('Failed to get file from S3');
    }
  },

  async getFileBuffer(fileName: string): Promise<Buffer> {
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileName,
    };

    try {
      const client = getS3Client(); // Get client when needed
      const response = await client.send(new GetObjectCommand(params));
      const arrayBuffer = await response.Body?.transformToByteArray();
      return Buffer.from(arrayBuffer || []);
    } catch (error) {
      console.error('Error getting file buffer from S3:', error);
      if (error instanceof Error && error.message.includes('credential')) {
        throw new Error(
          'AWS credentials are invalid or expired. Please check your .env file.',
        );
      }
      throw new Error('Failed to get file buffer from S3');
    }
  },

  async getSignedUrl(key: string): Promise<string> {
    const params: GetObjectCommandInput = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
    };

    try {
      const client = getS3Client(); // Get client when needed
      const command = new GetObjectCommand(params);
      const signedUrl = await getSignedUrl(client, command, {
        expiresIn: URL_EXPIRATION,
      });
      return signedUrl;
    } catch (error) {
      console.error('Error generating signed URL:', error);
      if (error instanceof Error && error.message.includes('credential')) {
        throw new Error(
          'AWS credentials are invalid or expired. Please check your .env file.',
        );
      }
      throw new Error('Failed to generate signed URL');
    }
  },

  async getPresignedUploadUrlForProductUpload(
    key: string,
    contentType: string,
  ): Promise<string> {
    const params = {
      Bucket: 'aisales-product-info',
      Key: key,
      ContentType: contentType,
    };

    try {
      const client = getS3Client();
      const command = new PutObjectCommand(params);
      const signedUrl = await getSignedUrl(client, command, {
        expiresIn: 3600, // 1 hour for uploads
      });
      return signedUrl;
    } catch (error) {
      console.error('Error generating presigned upload URL:', error);
      if (error instanceof Error && error.message.includes('credential')) {
        throw new Error(
          'AWS credentials are invalid or expired. Please check your .env file.',
        );
      }
      throw new Error('Failed to generate presigned upload URL');
    }
  },

  async getFileBufferFromProductUpload(key: string): Promise<Buffer> {
    const params = {
      Bucket: 'aisales-product-info',
      Key: key,
    };

    try {
      const client = getS3Client();
      const response = await client.send(new GetObjectCommand(params));
      const arrayBuffer = await response.Body?.transformToByteArray();
      return Buffer.from(arrayBuffer || []);
    } catch (error) {
      console.error('Error getting file buffer from product upload:', error);
      if (error instanceof Error && error.message.includes('credential')) {
        throw new Error(
          'AWS credentials are invalid or expired. Please check your .env file.',
        );
      }
      throw new Error('Failed to get file buffer from product upload');
    }
  },

  async uploadToProductBucket(
    fileBuffer: Buffer,
    key: string,
    contentType: string,
  ): Promise<string> {
    const params = {
      Bucket: 'aisales-product-info',
      Key: key,
      Body: fileBuffer,
      ContentType: contentType,
    };

    try {
      const client = getS3Client();
      await client.send(new PutObjectCommand(params));
      return `https://aisales-product-info.s3.amazonaws.com/${key}`;
    } catch (error) {
      console.error('Error uploading to product bucket:', error);
      if (error instanceof Error && error.message.includes('credential')) {
        throw new Error(
          'AWS credentials are invalid or expired. Please check your .env file.',
        );
      }
      throw new Error('Failed to upload to product bucket');
    }
  },

  async copyFileInProductBucket(
    sourceKey: string,
    destinationKey: string,
    contentType: string,
  ): Promise<string> {
    // URL-encode the source key to handle special characters
    const encodedSourceKey = encodeURIComponent(sourceKey);

    const params = {
      Bucket: 'aisales-product-info',
      CopySource: `aisales-product-info/${encodedSourceKey}`,
      Key: destinationKey,
      ContentType: contentType,
      MetadataDirective: MetadataDirective.REPLACE,
    };

    try {
      const client = getS3Client();
      await client.send(new CopyObjectCommand(params));
      return `https://aisales-product-info.s3.amazonaws.com/${destinationKey}`;
    } catch (error) {
      console.error('Error copying file in product bucket:', error);
      console.error('Source key:', sourceKey);
      console.error('Destination key:', destinationKey);
      if (error instanceof Error && error.message.includes('credential')) {
        throw new Error(
          'AWS credentials are invalid or expired. Please check your .env file.',
        );
      }
      throw new Error('Failed to copy file in product bucket');
    }
  },
};
