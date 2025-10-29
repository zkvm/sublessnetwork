/**
 * Test script for DM received queue
 * 
 * This simulates a user sending a DM to the bot with content to encrypt and store.
 * 
 * Usage:
 *   1. Start resource workers: npm run dev:resource
 *   2. Run this test: tsx test/test-dm-queue.ts
 *   3. Check worker logs for resource ID and proof
 *   4. Use the resource ID and proof for mention test
 */

import { Queue } from 'bullmq';
import { config as dotenvConfig } from 'dotenv';
import type { DmReceivedMessage } from '../resource/types/messages.js';

dotenvConfig();

// Redis configuration
const redisConfig = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
};

// Create queue instance
const dmReceivedQueue = new Queue<DmReceivedMessage>('dm_received', {
    connection: redisConfig,
});

async function testDmQueue() {
    console.log('📨 Testing DM Received Queue');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');

    // Simulate a DM from a creator
    const testMessage: DmReceivedMessage = {
        userId: 'zkvm1',
        username: 'wan fan',
        content: `Premium Content: How to Build AI Agents with Message Queues

This is a comprehensive guide on building scalable AI systems using message queues like BullMQ.

Topics covered:
- Queue architecture design
- Consumer implementation
- Error handling and retries
- Monitoring and observability
- Best practices for production

...`,
        messageId: `dm_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        timestamp: new Date().toISOString(),
    };

    console.log('📤 Sending message to dm_received queue...');
    console.log('');
    console.log('Message details:');
    console.log(`  User ID: ${testMessage.userId}`);
    console.log(`  Username: @${testMessage.username}`);
    console.log(`  Message ID: ${testMessage.messageId}`);
    console.log(`  Content length: ${testMessage.content.length} chars`);
    console.log('');

    try {
        const job = await dmReceivedQueue.add('dm-received', testMessage, {
            priority: 1,
            removeOnComplete: false, // Keep job for inspection
        });

        console.log('✅ Message queued successfully!');
        console.log(`   Job ID: ${job.id}`);
        console.log('');
        console.log('👀 Check the resource worker logs for:');
        console.log('   - Resource ID (you\'ll need this for mention test)');
        console.log('   - Proof token (you\'ll need this for mention test)');
        console.log('');
        console.log('💡 Next steps:');
        console.log('   1. Copy the Resource ID from worker logs');
        console.log('   2. Copy the Proof token from worker logs');
        console.log('   3. Run: tsx test/test-mention-queue.ts <resourceId> <proof>');
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
            console.log('📝 SAVE THESE VALUES:');
            console.log('');
            console.log(`Resource ID: ${result.resourceId}`);
            console.log(`Proof Token: ${result.proofToken}`);
            console.log('');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('');
            console.log('🎯 Run mention test:');
            console.log(`   tsx test/test-mention-queue.ts ${result.resourceId} ${result.proofToken}`);
        } else if (jobState === 'failed') {
            const reason = await job.failedReason;
            console.error(`❌ Job failed: ${reason}`);
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await dmReceivedQueue.close();
        process.exit(0);
    }
}

// Run test
console.log('');
console.log('🧪 DM Queue Test');
console.log('════════════════════════════════════════');
console.log('');

testDmQueue().catch(console.error);
