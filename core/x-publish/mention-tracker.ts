import { Redis } from 'ioredis';
import { config } from './config.js';

/**
 * Track processed tweet IDs to avoid duplicate processing
 * Uses Redis for persistent storage across restarts
 */
export class MentionTracker {
    private redis: Redis;
    private readonly keyPrefix = 'x-publish:processed:';
    private readonly ttlDays = 7;

    constructor() {
        this.redis = new Redis({
            host: config.redis.host,
            port: config.redis.port,
            password: config.redis.password,
            db: config.redis.db,
        });

        this.redis.on('error', (err) => {
            console.error('❌ Redis connection error:', err);
        });
    }

    /**
     * Check if a tweet has been processed
     */
    async isProcessed(tweetId: string): Promise<boolean> {
        try {
            const exists = await this.redis.exists(this.keyPrefix + tweetId);
            return exists === 1;
        } catch (error) {
            console.error(`Error checking if tweet ${tweetId} is processed:`, error);
            // On error, assume not processed to avoid missing mentions
            return false;
        }
    }

    /**
     * Mark a tweet as processed
     */
    async markAsProcessed(tweetId: string): Promise<void> {
        try {
            const key = this.keyPrefix + tweetId;
            const ttlSeconds = this.ttlDays * 24 * 60 * 60;

            await this.redis.setex(key, ttlSeconds, new Date().toISOString());
        } catch (error) {
            console.error(`Error marking tweet ${tweetId} as processed:`, error);
        }
    }

    /**
     * Get when a tweet was processed (for debugging)
     */
    async getProcessedAt(tweetId: string): Promise<string | null> {
        try {
            return await this.redis.get(this.keyPrefix + tweetId);
        } catch (error) {
            console.error(`Error getting processed time for tweet ${tweetId}:`, error);
            return null;
        }
    }

    /**
     * Close Redis connection
     */
    async close(): Promise<void> {
        await this.redis.quit();
    }
}
