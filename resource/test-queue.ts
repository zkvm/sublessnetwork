/**
 * Test script to demonstrate queue functionality
 * 
 * Usage:
 *   npm run dev:resource    (start workers in one terminal)
 *   tsx resource/test-queue.ts dm    (test DM flow)
 *   tsx resource/test-queue.ts mention <resourceId> <proof>    (test mention flow)
 */

import { dmReceivedQueue } from './queues/dm-received.js';
import { mentionReceivedQueue } from './queues/mention-received.js';
import type { DmReceivedMessage, MentionReceivedMessage } from './types/messages.js';

const command = process.argv[2];

if (!command) {
    console.log('Usage:');
    console.log('  tsx resource/test-queue.ts dm');
    console.log('  tsx resource/test-queue.ts mention <resourceId> <proof>');
    process.exit(1);
}

async function testDmQueue() {
    console.log('📨 Testing DM queue...');
    console.log('');

    const message: DmReceivedMessage = {
        userId: '123456789',
        username: 'test_creator',
        content: `This is my premium content about AI agents!

It explains how to build context-aware systems using message queues.

This content should be encrypted and stored securely.`,
        messageId: `dm_${Date.now()}`,
        timestamp: new Date().toISOString(),
    };

    const job = await dmReceivedQueue.add('dm-received', message);

    console.log(`✅ DM message queued`);
    console.log(`   Job ID: ${job.id}`);
    console.log(`   From: @${message.username}`);
    console.log(`   Content length: ${message.content.length} chars`);
    console.log('');
    console.log('👀 Watch the worker logs for processing...');

    // Wait a bit to see the result
    await new Promise(resolve => setTimeout(resolve, 2000));

    await dmReceivedQueue.close();
    process.exit(0);
}

async function testMentionQueue(resourceId?: string, proof?: string) {
    if (!resourceId || !proof) {
        console.error('❌ Missing parameters for mention test');
        console.log('Usage: tsx resource/test-queue.ts mention <resourceId> <proof>');
        process.exit(1);
    }

    console.log('🐦 Testing Mention queue...');
    console.log('');

    const message: MentionReceivedMessage = {
        tweetId: `tweet_${Date.now()}`,
        userId: '123456789',
        username: 'test_creator',
        tweetText: `Check out my premium content! @x402X lock:0.2 id:${resourceId} proof:${proof}`,
        resourceId,
        proof,
        price: '0.20',
        timestamp: new Date().toISOString(),
    };

    const job = await mentionReceivedQueue.add('mention-received', message);

    console.log(`✅ Mention message queued`);
    console.log(`   Job ID: ${job.id}`);
    console.log(`   Tweet by: @${message.username}`);
    console.log(`   Resource ID: ${resourceId}`);
    console.log(`   Proof: ${proof}`);
    console.log('');
    console.log('👀 Watch the worker logs for processing...');

    // Wait a bit to see the result
    await new Promise(resolve => setTimeout(resolve, 2000));

    await mentionReceivedQueue.close();
    process.exit(0);
}

// Execute command
if (command === 'dm') {
    testDmQueue().catch(console.error);
} else if (command === 'mention') {
    testMentionQueue(process.argv[3], process.argv[4]).catch(console.error);
} else {
    console.error(`❌ Unknown command: ${command}`);
    process.exit(1);
}
