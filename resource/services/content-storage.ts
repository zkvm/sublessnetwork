import crypto from 'crypto';
import pg from 'pg';
import { config } from '../config.js';
import { generateProofData } from './proof-generator.js';

const { Pool } = pg;

const pool = new Pool({
    connectionString: config.databaseUrl,
    max: 10,
});

/**
 * Encrypt content using AES-256-GCM
 */
export function encryptContent(plaintext: string): {
    ciphertext: string;
    iv: string;
    authTag?: string;
} {
    const key = Buffer.from(config.encryptionKey!, 'hex');
    const iv = crypto.randomBytes(12); // 96-bit IV for GCM

    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

    let encrypted = cipher.update(plaintext, 'utf8', 'base64');
    encrypted += cipher.final('base64');

    const authTag = cipher.getAuthTag();

    return {
        ciphertext: encrypted,
        iv: iv.toString('hex'),
        authTag: authTag.toString('hex'),
    };
}

/**
 * Calculate SHA-256 hash of content
 */
export function hashContent(content: string): string {
    return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
}

/**
 * Store encrypted content and return resource ID + proof
 */
export async function storeContent(data: {
    userId: string;
    username: string;
    content: string;
    messageId: string;
    sourcePlatform?: string;
    contentType?: string;
    priceUsdCents?: number;
}): Promise<{
    resourceId: string;
    proofToken: string;
    isNew: boolean;
}> {
    const sourcePlatform = data.sourcePlatform || 'twitter';

    // Check for duplicate message ID
    const existingResource = await pool.query(
        `SELECT id, proof_token FROM resources 
     WHERE source_platform = $1 AND source_message_id = $2`,
        [sourcePlatform, data.messageId]
    );

    if (existingResource.rows.length > 0) {
        // Message already processed, return existing resource
        console.log(`⚠️  Duplicate message detected: ${data.messageId}`);
        return {
            resourceId: existingResource.rows[0].id,
            proofToken: existingResource.rows[0].proof_token,
            isNew: false,
        };
    }

    // Encrypt content
    const { ciphertext, iv } = encryptContent(data.content);

    // Calculate content hash
    const contentHash = hashContent(data.content);

    // Generate proof
    const proof = generateProofData();

    // Insert resource
    const result = await pool.query(
        `INSERT INTO resources (
      user_id,
      source_platform,
      source_message_id,
      content_ciphertext,
      content_iv,
      content_type,
      content_hash,
      proof_token,
      proof_hash,
      proof_salt,
      proof_issued_at,
      status,
      price_usd_cents,
      currency,
      chain
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), 'draft', $11, 'USDC', 'solana')
    RETURNING id`,
        [
            data.userId,
            sourcePlatform,
            data.messageId,
            ciphertext,
            iv,
            data.contentType || 'text/plain',
            contentHash,
            proof.token, // Store cleartext token temporarily (for DM reply)
            proof.hash,
            proof.salt,
            data.priceUsdCents || 20, // Default $0.20
        ]
    );

    const resourceId = result.rows[0].id;

    console.log(`✅ Content stored: resource_id=${resourceId}, user=${data.username}`);

    return {
        resourceId,
        proofToken: proof.token,
        isNew: true,
    };
}

// Close pool on shutdown
process.on('SIGTERM', async () => {
    await pool.end();
});

process.on('SIGINT', async () => {
    await pool.end();
});
