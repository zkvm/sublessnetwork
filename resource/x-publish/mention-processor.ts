import { Worker, Job } from 'bullmq';
import { config } from '../config.js';
import { mentionReplyQueue } from './queues/mention-reply.js';
import { verifyProofToken, markProofUsed } from '../services/proof-verifier.js';
import type { MentionReceivedMessage, MentionReplyMessage } from '../types/messages.js';

/**
 * Consumer for mention_received queue
 * 
 * Processes tweet mentions:
 * 1. Extract resource ID and proof from tweet
 * 2. Verify proof matches the resource
 * 3. Generate payment link
 * 4. Queue reply message with payment link
 */
export const mentionProcessor = new Worker<MentionReceivedMessage>(
    config.queues.mentionReceived,
    async (job: Job<MentionReceivedMessage>) => {
        const { tweetId, userId, username, tweetText, resourceId, proof, price, timestamp } = job.data;

        console.log(`🐦 Processing mention from @${username}`);
        console.log(`   Tweet ID: ${tweetId}`);
        console.log(`   Resource ID: ${resourceId}`);
        console.log(`   Proof: ${proof}`);

        try {
            // Verify proof
            const verification = await verifyProofToken(resourceId, proof);

            if (!verification.valid) {
                console.error(`❌ Proof verification failed: ${verification.error}`);

                // Queue error reply
                const errorReply: MentionReplyMessage = {
                    tweetId,
                    message: formatErrorReply(verification.error!),
                    paymentLink: '',
                    resourceId,
                    timestamp: new Date().toISOString(),
                };

                await mentionReplyQueue.add('mention-error-reply', errorReply);

                return {
                    success: false,
                    error: verification.error,
                };
            }

            // Parse price from tweet (e.g., "lock:0.5" -> 50 cents)
            const priceUsdCents = price ? Math.round(parseFloat(price) * 100) : undefined;

            // Mark proof as used and update resource status (including price)
            const tweetUrl = `https://twitter.com/${username}/status/${tweetId}`;
            await markProofUsed(resourceId, tweetId, tweetUrl, priceUsdCents);

            // Generate payment link
            const paymentLink = `${config.baseUrl}/resources/${resourceId}`;

            // Prepare reply message
            const replyMessage: MentionReplyMessage = {
                tweetId,
                message: formatMentionReply(paymentLink, price || '0.20'),
                paymentLink,
                resourceId,
                timestamp: new Date().toISOString(),
            };

            // Queue reply
            await mentionReplyQueue.add('mention-reply', replyMessage, {
                priority: 1, // High priority
            });

            console.log(`✅ Mention processed successfully`);
            console.log(`   Payment link: ${paymentLink}`);

            return {
                success: true,
                paymentLink,
                resourceId,
            };

        } catch (error) {
            console.error(`❌ Error processing mention:`, error);
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
        concurrency: 3, // Process up to 3 mentions concurrently
        limiter: {
            max: 5,
            duration: 1000, // Max 5 jobs per second
        },
    }
);

/**
 * Format the mention reply message
 */
function formatMentionReply(paymentLink: string, price: string): string {
    return `🔒 Paywalled Content! Pay $${price} USDC (x402 payment) to access:

${paymentLink}

- Powered by Subless Network ⚡️`;
}

/**
 * Format error reply message
 */
function formatErrorReply(error: string): string {
    const errorMessages: Record<string, string> = {
        'Resource not found': 'Invalid resource ID. Please check and try again.',
        'Proof already used': 'This content is already published.',
        'Invalid proof token': 'Invalid proof. Please check your proof token.',
    };

    return errorMessages[error] || `Error: ${error}`;
}

// Event handlers
mentionProcessor.on('ready', () => {
    console.log('✅ Mention processor ready');
});

mentionProcessor.on('completed', (job) => {
    console.log(`✅ Mention processor job ${job.id} completed`);
});

mentionProcessor.on('failed', (job, err) => {
    console.error(`❌ Mention processor job ${job?.id} failed:`, err.message);
});

mentionProcessor.on('error', (err) => {
    console.error('❌ Mention processor error:', err);
});
