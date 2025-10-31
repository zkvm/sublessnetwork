/**
 * Test script for Mention received queue
 * 
 * This simulates a tweet mention with resource ID and proof, which verifies
 * the proof and publishes the resource.
 * 
 * Usage:
 *   tsx test/test-mention-queue.ts <resourceId> <proof> [price]
 * 
 * Example:
 *   tsx test/test-mention-queue.ts abc-123-def xyz-456a 0.50
 */

// 2d1124dd-3332-470e-a12a-045b555441f9
// 408-3fc8

import { Queue } from 'bullmq';
import { config as dotenvConfig } from 'dotenv';
import type { MentionReceivedMessage } from '../resource/types/messages.js';

dotenvConfig();

// Redis configuration
const redisConfig = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
};

// Create queue instance
const mentionReceivedQueue = new Queue<MentionReceivedMessage>('mention_received', {
    connection: redisConfig,
});

async function testMentionQueue(resourceId: string, proof: string, price?: string) {
    console.log('🐦 Testing Mention Received Queue');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');

    const priceValue = price || '0.20';
    const tweetId = `tweet_${Date.now()}`;
    const username = 'wan fan';

    // Simulate a tweet mentioning the bot with resource ID and proof
    const testMessage: MentionReceivedMessage = {
        tweetId,
        userId: 'zkvm1',
        username,
        tweetText: `Check out my premium AI content! @x402X lock:${priceValue} id:${resourceId} proof:${proof}`,
        resourceId,
        proof,
        price: priceValue,
        timestamp: new Date().toISOString(),
    };

    console.log('📤 Sending message to mention_received queue...');
    console.log('');
    console.log('Tweet details:');
    console.log(`  Tweet ID: ${testMessage.tweetId}`);
    console.log(`  Username: @${testMessage.username}`);
    console.log(`  Resource ID: ${resourceId}`);
    console.log(`  Proof: ${proof}`);
    console.log(`  Price: $${priceValue} USDC`);
    console.log('');

    try {
        const job = await mentionReceivedQueue.add('mention-received', testMessage, {
            priority: 1,
            removeOnComplete: false, // Keep job for inspection
        });

        console.log('✅ Message queued successfully!');
        console.log(`   Job ID: ${job.id}`);
        console.log('');
        console.log('👀 Check the resource worker logs for:');
        console.log('   - Proof verification result');
        console.log('   - Payment link generation');
        console.log('');

        // Wait a bit to see the processing result
        console.log('⏳ Waiting 5 seconds for processing...');
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Check job status
        const jobState = await job.getState();
        console.log(`📊 Job status: ${jobState}`);

        if (jobState === 'completed') {
            const result = await job.returnvalue;
            console.log('');
            console.log('✅ Processing completed!');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('');

            if (result.success) {
                console.log('🎉 Resource published successfully!');
                console.log('');
                console.log('📝 Resource Details:');
                console.log(`   Resource ID: ${result.resourceId}`);
                console.log(`   Payment Link: ${result.paymentLink}`);
                console.log('');
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                console.log('');
                console.log('🧪 Test Payment Flow:');
                console.log('');
                console.log('1. Preview (no payment):');
                console.log(`   curl http://localhost:4021/resources/${result.resourceId}/preview`);
                console.log('');
                console.log('2. Access (requires payment):');
                console.log(`   curl http://localhost:4021/resources/${result.resourceId}`);
                console.log('');
                console.log('   Expected: 402 Payment Required');
                console.log('');
            } else {
                console.error('❌ Resource publication failed!');
                console.error(`   Error: ${result.error}`);
            }
        } else if (jobState === 'failed') {
            const reason = await job.failedReason;
            console.error(`❌ Job failed: ${reason}`);
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mentionReceivedQueue.close();
        process.exit(0);
    }
}

// Parse command line arguments
const args = process.argv.slice(2);

if (args.length < 2) {
    console.error('❌ Missing arguments!');
    console.error('');
    console.error('Usage:');
    console.error('  tsx test/test-mention-queue.ts <resourceId> <proof> [price]');
    console.error('');
    console.error('Example:');
    console.error('  tsx test/test-mention-queue.ts abc-123-def xyz-456a 0.50');
    console.error('');
    process.exit(1);
}

const [resourceId, proof, price] = args;

// Run test
console.log('');
console.log('🧪 Mention Queue Test');
console.log('════════════════════════════════════════');
console.log('');

testMentionQueue(resourceId, proof, price).catch(console.error);
