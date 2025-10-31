/**
 * Mention Reply Consumer
 * 
 * This consumer reads from the 'mention_reply' queue and sends
 * tweet replies using the shared TwitterClient.
 * 
 * Processes replies for:
 * - Successful proof verification (with payment link)
 * - Error messages (invalid proof, already used, etc.)
 */

import { Worker, Job } from 'bullmq';
import { config } from '../config.js';
import { twitterClient } from '../index.js';
import type { MentionReplyMessage } from '../types/messages.js';

/**
 * Worker for mention_reply queue
 * Sends tweet replies with payment links or error messages
 */
export const mentionReplyWorker = new Worker<MentionReplyMessage>(
    config.queues.mentionReply,
    async (job: Job<MentionReplyMessage>) => {
        const { tweetId, message, paymentLink, resourceId } = job.data;

        console.log(`📤 Processing mention reply job ${job.id}`);
        console.log(`   Tweet ID: ${tweetId}`);
        console.log(`   Resource ID: ${resourceId}`);

        if (!twitterClient) {
            console.error('   ❌ Twitter client not available');
            throw new Error('Twitter client not initialized');
        }

        try {
            // Send tweet reply using shared TwitterClient
            const replyId = await twitterClient.replyToTweet(tweetId, message);

            console.log(`   ✅ Reply sent successfully (ID: ${replyId})`);

            return {
                success: true,
                replyId,
                tweetId,
                resourceId,
            };
        } catch (error: any) {
            console.error(`   ❌ Failed to send reply:`, error);

            // Log detailed error for debugging
            if (error.data) {
                console.error('   Error details:', JSON.stringify(error.data, null, 2));
            }

            // Handle specific Twitter API errors
            if (error.code === 403) {
                console.error('   ⚠️  Forbidden - Tweet may be deleted or user blocked the bot');
                // Don't retry for 403 errors
                return {
                    success: false,
                    error: 'Tweet inaccessible',
                    tweetId,
                };
            }

            if (error.code === 429) {
                console.error('   ⚠️  Rate limit exceeded - will retry later');
            }

            // Rethrow to trigger retry for temporary errors
            throw error;
        }
    },
    {
        connection: {
            host: config.redis.host,
            port: config.redis.port,
            password: config.redis.password,
            db: config.redis.db,
        },
        concurrency: 1, // Process one reply at a time to respect rate limits
        limiter: {
            max: 10, // Max 10 tweets per
            duration: 60000, // 60 seconds (conservative for Twitter rate limits)
        },
    }
);

// Event handlers
mentionReplyWorker.on('completed', (job) => {
    console.log(`✅ Mention reply job ${job.id} completed`);
});

mentionReplyWorker.on('failed', (job, err) => {
    console.error(`❌ Mention reply job ${job?.id} failed:`, err.message);
});

mentionReplyWorker.on('error', (err) => {
    console.error('❌ Mention reply worker error:', err);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    await mentionReplyWorker.close();
});

process.on('SIGINT', async () => {
    await mentionReplyWorker.close();
});
