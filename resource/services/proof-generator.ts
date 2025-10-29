import crypto from 'crypto';
import { config } from '../config.js';

/**
 * Generate a random proof token
 * Format: prefix-suffix (e.g., "abc-123x")
 */
export function generateProofToken(): string {
    const prefix = crypto.randomBytes(2).toString('hex').substring(0, 3);
    const suffix = crypto.randomBytes(2).toString('hex').substring(0, 4);
    return `${prefix}-${suffix}`;
}

/**
 * Generate a salt for proof hashing
 */
export function generateProofSalt(): string {
    return crypto.randomBytes(16).toString('hex');
}

/**
 * Hash proof token with salt
 * Uses HMAC-SHA256
 */
export function hashProof(proofToken: string, salt: string): string {
    const hmac = crypto.createHmac('sha256', salt);
    hmac.update(proofToken);
    return hmac.digest('hex');
}

/**
 * Verify proof token against stored hash and salt
 */
export function verifyProof(
    proofToken: string,
    salt: string,
    expectedHash: string
): boolean {
    const actualHash = hashProof(proofToken, salt);
    return actualHash === expectedHash;
}

/**
 * Generate proof data (token + hash + salt)
 * Returns all three values needed for storage and verification
 */
export function generateProofData(): {
    token: string;
    hash: string;
    salt: string;
} {
    const token = generateProofToken();
    const salt = generateProofSalt();
    const hash = hashProof(token, salt);

    return { token, hash, salt };
}
