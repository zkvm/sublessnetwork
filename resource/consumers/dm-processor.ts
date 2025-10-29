import { Worker, Job } from 'bullmq';
import { config } from '../config.js';
import { dmReplyQueue } from '../queues/dm-reply.js';
import { storeContent } from '../services/content-storage.js';
import type { DmReceivedMessage, DmReplyMessage } from '../types/messages.js';

/**
 * Consumer for dm_received queue
 * 
 * Processes incoming DM messages:
 * 1. Extract user info and content
 * 2. Encrypt and store content in database
 * 3. Generate proof token
 * 4. Queue reply message with resource ID and proof
 */
export const dmProcessor = new Worker<DmReceivedMessage>(
    config.queues.dmReceived,
    async (job: Job<DmReceivedMessage>) => {
        const { userId, username, content, messageId, timestamp } = job.data;

        console.log(`📨 Processing DM from @${username} (${userId})`);
        console.log(`   Message ID: ${messageId}`);
        console.log(`   Content length: ${content.length} chars`);

        try {
            // Store encrypted content
            const { resourceId, proofToken, isNew } = await storeContent({
                userId,
                username,
                content,
                messageId, // Pass message ID for deduplication
                contentType: 'text/plain',
                priceUsdCents: 20, // Default $0.20, can be customized later
            });

            if (!isNew) {
                console.log(`⚠️  Duplicate DM - skipping reply queue (already processed)`);
                return {
                    success: true,
                    resourceId,
                    proofToken,
                    duplicate: true,
                };
            }

            // Prepare reply message
            const replyMessage: DmReplyMessage = {
                userId,
                message: formatDmReply(resourceId, proofToken),
                resourceId,
                proof: proofToken,
                timestamp: new Date().toISOString(),
            };

            // Queue reply (will be processed by Twitter bot later)
            await dmReplyQueue.add('dm-reply', replyMessage, {
                priority: 1, // High priority for user responses
            });

            console.log(`✅ DM processed successfully`);
            console.log(`   Resource ID: ${resourceId}`);
            console.log(`   Proof: ${proofToken}`);

            return {
                success: true,
                resourceId,
                proofToken,
                duplicate: false,
            };

        } catch (error) {
            console.error(`❌ Error processing DM:`, error);
            throw error; // Will trigger retry
        }
    },
    {
        connection: {
            host: config.redis.host,
            port: config.redis.port,
            password: config.redis.password,
            db: config.redis.db,
        },
        concurrency: 5, // Process up to 5 DMs concurrently
        limiter: {
            max: 10,
            duration: 1000, // Max 10 jobs per second
        },
    }
);

/**
 * Format the DM reply message
 */
function formatDmReply(resourceId: string, proof: string): string {
    return `✅ Content received and encrypted!

📝 Resource ID: ${resourceId}
🔐 Proof: ${proof}

To publish and monetize your content, tweet:

@${config.twitterBotUsername} lock:0.2 id:${resourceId} proof:${proof}

(You can customize the price, e.g., lock:1.5 for $1.50)`;
}

// Event handlers
dmProcessor.on('completed', (job) => {
    console.log(`✅ Job ${job.id} completed`);
});

dmProcessor.on('failed', (job, err) => {
    console.error(`❌ Job ${job?.id} failed:`, err.message);
});

dmProcessor.on('error', (err) => {
    console.error('❌ Worker error:', err);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    await dmProcessor.close();
});

process.on('SIGINT', async () => {
    await dmProcessor.close();
});
