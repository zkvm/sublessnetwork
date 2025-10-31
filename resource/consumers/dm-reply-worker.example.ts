/**
 * Example: DM Reply Consumer
 * 
 * This consumer reads from the 'dm_reply' queue and sends
 * direct messages using the shared TwitterClient.
 * 
 * To implement this consumer:
 * 1. Uncomment the code below
 * 2. Save as resource/consumers/dm-reply-worker.ts
 * 3. Import and initialize in resource/index.ts
 */

/*
import { Worker, Job } from 'bullmq';
import { config } from '../config.js';
import { twitterClient } from '../index.js';

interface DMReplyJob {
    userId: string;
    message: string;
    resourceId?: string;
    purchaseId?: string;
}

export const dmReplyWorker = new Worker(
    'dm_reply',
    async (job: Job<DMReplyJob>) => {
        console.log(`📩 Processing DM reply job ${job.id}`);
        console.log(`   User ID: ${job.data.userId}`);

        if (!twitterClient) {
            console.error('   ❌ Twitter client not available');
            throw new Error('Twitter client not initialized');
        }

        try {
            // Send DM using shared TwitterClient
            const dmEventId = await twitterClient.sendDirectMessage(
                job.data.userId,
                job.data.message
            );

            console.log(`   ✅ DM sent successfully (Event ID: ${dmEventId})`);

            return {
                success: true,
                dmEventId,
                userId: job.data.userId,
            };
        } catch (error: any) {
            console.error(`   ❌ Failed to send DM:`, error);
            
            // Don't retry if user doesn't accept DMs
            if (error.code === 403) {
                console.log('   ⚠️  User cannot receive DMs, marking job as complete');
                return {
                    success: false,
                    error: 'User cannot receive DMs',
                    userId: job.data.userId,
                };
            }
            
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
        concurrency: 1, // Process one DM at a time to respect rate limits
    }
);

dmReplyWorker.on('completed', (job) => {
    console.log(`✅ DM reply job ${job.id} completed`);
});

dmReplyWorker.on('failed', (job, err) => {
    console.error(`❌ DM reply job ${job?.id} failed:`, err);
});
*/
