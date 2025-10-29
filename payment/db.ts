import pg from 'pg';
import { config } from './config.js';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: config.databaseUrl,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection
pool.on('connect', () => {
  console.log('✅ Database connected');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected database error:', err);
  process.exit(-1);
});

// Resource queries
export const db = {
  /**
   * Get resource by ID
   */
  async getResource(resourceId: string) {
    const result = await pool.query(
      `SELECT 
        r.id,
        r.user_id,
        r.content_ciphertext,
        r.content_iv,
        r.content_type,
        r.content_hash,
        r.price_usd_cents,
        r.currency,
        r.chain,
        r.status,
        r.watermark_enabled,
        r.watermark_seed,
        r.tweet_id,
        u.twitter_user_id,
        u.twitter_username,
        w.public_address as creator_wallet_address
      FROM resources r
      JOIN users u ON r.user_id = u.id
      LEFT JOIN wallets w ON r.user_id = w.user_id
      WHERE r.id = $1 
        AND r.status = 'published'
        AND r.deleted_at IS NULL`,
      [resourceId]
    );

    return result.rows[0] || null;
  },

  /**
   * Record a purchase
   */
  async createPurchase(data: {
    resourceId: string;
    pricePaidCents: number;
    currency: string;
    chain: string;
  }) {
    const result = await pool.query(
      `INSERT INTO purchases (
        resource_id,
        price_paid_cents,
        currency,
        chain,
        status
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING id`,
      [
        data.resourceId,
        data.pricePaidCents,
        data.currency,
        data.chain,
        'pending', // status
      ]
    );

    return result.rows[0];
  },

  /**
   * Update resource statistics
   */
  async updateResourceStats(resourceId: string, priceCents: number) {
    await pool.query(
      `UPDATE resources 
       SET 
         total_purchases = total_purchases + 1,
         total_revenue_cents = total_revenue_cents + $2,
         updated_at = NOW()
       WHERE id = $1`,
      [resourceId, priceCents]
    );
  },
};
