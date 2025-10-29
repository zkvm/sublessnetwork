import pg from 'pg';
import { config } from '../config.js';
import { verifyProof } from './proof-generator.js';
import type { ProofVerificationResult } from '../types/messages.js';

const { Pool } = pg;

const pool = new Pool({
    connectionString: config.databaseUrl,
    max: 10,
});

/**
 * Verify proof token against database
 * Checks if the proof matches the resource ID
 */
export async function verifyProofToken(
    resourceId: string,
    proofToken: string
): Promise<ProofVerificationResult> {
    try {
        const result = await pool.query(
            `SELECT id, user_id, proof_hash, proof_salt, proof_used_at, status
       FROM resources
       WHERE id = $1 AND deleted_at IS NULL`,
            [resourceId]
        );

        if (result.rows.length === 0) {
            return {
                valid: false,
                error: 'Resource not found'
            };
        }

        const resource = result.rows[0];

        // Check if proof already used
        if (resource.proof_used_at) {
            return {
                valid: false,
                error: 'Proof already used'
            };
        }

        // Check if resource is in draft status
        if (resource.status !== 'draft') {
            return {
                valid: false,
                error: `Resource already ${resource.status}`
            };
        }

        // Verify proof hash
        const isValid = verifyProof(
            proofToken,
            resource.proof_salt,
            resource.proof_hash
        );

        if (!isValid) {
            return {
                valid: false,
                error: 'Invalid proof token'
            };
        }

        return {
            valid: true,
            resourceId: resource.id,
            userId: resource.user_id,
        };

    } catch (error) {
        console.error('❌ Error verifying proof:', error);
        return {
            valid: false,
            error: 'Database error'
        };
    }
}

/**
 * Mark proof as used and update resource status
 */
export async function markProofUsed(
    resourceId: string,
    tweetId: string,
    tweetUrl: string,
    priceUsdCents?: number
): Promise<void> {
    const updateFields = priceUsdCents !== undefined
        ? `proof_used_at = NOW(),
       status = 'published',
       tweet_id = $2,
       tweet_url = $3,
       tweet_verified_at = NOW(),
       price_usd_cents = $4,
       updated_at = NOW()`
        : `proof_used_at = NOW(),
       status = 'published',
       tweet_id = $2,
       tweet_url = $3,
       tweet_verified_at = NOW(),
       updated_at = NOW()`;

    const params = priceUsdCents !== undefined
        ? [resourceId, tweetId, tweetUrl, priceUsdCents]
        : [resourceId, tweetId, tweetUrl];

    await pool.query(
        `UPDATE resources
     SET ${updateFields}
     WHERE id = $1`,
        params
    );
}

// Close pool on shutdown
process.on('SIGTERM', async () => {
    await pool.end();
});

process.on('SIGINT', async () => {
    await pool.end();
});
