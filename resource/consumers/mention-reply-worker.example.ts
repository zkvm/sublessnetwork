/**
 * Example: Mention Reply Consumer
 * 
 * This consumer reads from the 'mention_reply' queue and sends
 * tweet replies using the shared TwitterClient.
 * 
 * To implement this consumer:
 * 1. Uncomment the code below
 * 2. Save as resource/consumers/mention-reply-worker.ts
 * 3. Import and initialize in resource/index.ts
 */

/*
import { Worker, Job } from 'bullmq';
import { config } from '../config.js';
import { twitterClient } from '../index.js';

interface MentionReplyJob {
    tweetId: string;
    message: string;
    resourceId?: string;
    proof?: string;
}

export const mentionReplyWorker = new Worker(
    'mention_reply',
    async (job: Job<MentionReplyJob>) => {
        console.log(`📤 Processing mention reply job ${job.id}`);
        console.log(`   Tweet ID: ${job.data.tweetId}`);

        if (!twitterClient) {
            console.error('   ❌ Twitter client not available');
            throw new Error('Twitter client not initialized');
        }

        try {
            // Send tweet reply using shared TwitterClient
            const replyId = await twitterClient.replyToTweet(
                job.data.tweetId,
                job.data.message
            );

            console.log(`   ✅ Reply sent successfully (ID: ${replyId})`);

            return {
                success: true,
                replyId,
                tweetId: job.data.tweetId,
            };
        } catch (error) {
            console.error(`   ❌ Failed to send reply:`, error);
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
    }
);

mentionReplyWorker.on('completed', (job) => {
    console.log(`✅ Mention reply job ${job.id} completed`);
});

mentionReplyWorker.on('failed', (job, err) => {
    console.error(`❌ Mention reply job ${job?.id} failed:`, err);
});
*/
