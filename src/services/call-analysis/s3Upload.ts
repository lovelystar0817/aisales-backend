import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';
import { S3 } from '../../libs/s3.js';
import { CLOUDFRONT_DOMAIN_AI_AVATARS } from '../../utils/constants.js';

// Get S3 client
const getS3Client = (): S3Client => {
  return new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });
};

interface UploadToS3Params {
  namespace: string;
  buffer: Buffer;
  fileName: string;
  analysisId: string;
  userId: string;
  companyId: string;
}

export async function uploadToS3WithTTL({
  namespace,
  buffer,
  fileName,
  analysisId,
  userId,
  companyId,
}: UploadToS3Params): Promise<string> {
  const client = getS3Client();

  // Generate S3 key with organized folder structure
  const key = `${namespace}/${companyId}/${userId}/${analysisId}/${fileName}`;

  console.log('S3 ::: key', key);

  // Calculate expiration date (30 days from now)
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + 30);

  console.log('S3 ::: expirationDate', expirationDate);

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: key,
    Body: buffer,
    ContentType: 'audio/mpeg',
    // S3 Object Lifecycle expiration tag
    Metadata: {
      'expiration-date': expirationDate.toISOString(),
      'analysis-id': analysisId,
      'user-id': userId,
      'company-id': companyId,
    },
    // Tag for lifecycle policy (if configured on bucket)
    Tagging: 'auto-delete=true',
  });

  console.log('S3 ::: command', command.input);

  try {
    await client.send(command);

    // Generate signed URL for accessing the file
    const getCommand = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: key,
    });

    console.log('S3 ::: getCommand', getCommand);

    // Return the S3 URL (you might want to return a signed URL instead)
    const signedUrl = await getSignedUrl(client, getCommand, {
      // expiresIn: 30 * 24 * 60 * 60, // 30 days in seconds
    });

    console.log('S3 ::: signedUrl', signedUrl);

    // For now, return the direct S3 URL
    // In production, you might want to use CloudFront or signed URLs
    const out = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    console.log('S3 ::: link', out);

    return out;
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw new Error('Failed to upload audio file to S3');
  }
}
