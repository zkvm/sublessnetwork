import crypto from 'crypto';
import { config } from './config.js';

/**
 * Decrypt content using AES-256-GCM
 * Auth tag is appended to ciphertext (last 16 bytes)
 */
export function decryptContent(
  ciphertext: string,
  iv: string
): Buffer {
  const key = Buffer.from(config.encryptionKey!, 'hex');
  const combined = Buffer.from(ciphertext, 'base64');

  // GCM auth tag is always 16 bytes
  const authTagLength = 16;

  // Split encrypted data and auth tag
  const encrypted = combined.subarray(0, combined.length - authTagLength);
  const authTag = combined.subarray(combined.length - authTagLength);

  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    key,
    Buffer.from(iv, 'hex')
  );

  decipher.setAuthTag(authTag);

  return Buffer.concat([
    decipher.update(encrypted),
    decipher.final()
  ]);
}

/**
 * Generate a unique watermark ID
 */
export function generateWatermarkId(
  resourceId: string,
  buyerUserId: string,
  timestamp: number
): string {
  const data = `${resourceId}:${buyerUserId}:${timestamp}`;
  const hmac = crypto.createHmac('sha256', config.watermarkSecret!);
  hmac.update(data);

  return `wm-${hmac.digest('hex').substring(0, 16)}`;
}

/**
 * Embed watermark into text content
 * Uses zero-width characters for invisible watermarking
 */
export function embedTextWatermark(
  content: string,
  watermarkId: string
): string {
  // Convert watermark ID to binary
  const binary = Buffer.from(watermarkId, 'utf-8')
    .toString('hex')
    .split('')
    .map(c => parseInt(c, 16).toString(2).padStart(4, '0'))
    .join('');

  // Zero-width characters for encoding
  const ZERO = '\u200B'; // Zero-width space (0)
  const ONE = '\u200C';  // Zero-width non-joiner (1)
  const MARKER = '\u200D'; // Zero-width joiner (marker)

  // Encode watermark
  const encoded = MARKER +
    binary.split('').map(bit => bit === '0' ? ZERO : ONE).join('') +
    MARKER;

  // Insert at 25% position in content
  const insertPos = Math.floor(content.length * 0.25);

  return content.slice(0, insertPos) + encoded + content.slice(insertPos);
}

/**
 * Verify content integrity
 */
export function verifyContentHash(content: Buffer, expectedHash: string): boolean {
  const actualHash = crypto.createHash('sha256').update(content).digest('hex');
  return actualHash === expectedHash;
}

/**
 * Generate proof token (for DM response to KOL)
 */
export function generateProofToken(): string {
  const prefix = crypto.randomBytes(2).toString('hex').substring(0, 3);
  const suffix = crypto.randomBytes(2).toString('hex').substring(0, 4);
  return `${prefix}-${suffix}`;
}

/**
 * Hash proof token for storage
 */
export function hashProof(proofToken: string, salt: string): string {
  const hmac = crypto.createHmac('sha256', salt);
  hmac.update(proofToken);
  return hmac.digest('hex');
}

/**
 * Verify proof token
 */
export function verifyProof(
  proofToken: string,
  salt: string,
  expectedHash: string
): boolean {
  const actualHash = hashProof(proofToken, salt);
  return actualHash === expectedHash;
}
