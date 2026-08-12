import { createHash } from 'crypto';

/**
 * Calculate MD5 hash of a buffer
 * @param buffer The file buffer to hash
 * @returns MD5 hash as hex string
 */
export function calculateFileHash(buffer: Buffer): string {
  return createHash('md5').update(buffer).digest('hex');
}
