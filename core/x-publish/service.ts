/**
 * X-Publish Service
 * 
 * Integrates Twitter mention polling, processing, and replying:
 * 1. MentionPoller - Polls for new mentions and adds them to the queue
 * 2. MentionProcessor - Processes mentions (verify proofs, generate payment links)
 * 3. MentionReplyWorker - Sends tweet replies with payment links
 */

import { Worker } from 'bullmq';
import type { TwitterClient } from '../twitter/index.js';
import { MentionPoller } from './mention-poller.js';
import { mentionProcessor } from './mention-processor.js';
import { createMentionReplyWorker } from './mention-reply-worker.js';

export class XPublishService {
    private twitterClient: TwitterClient;
    private mentionPoller: MentionPoller;
    private mentionProcessor: Worker;
    private mentionReplyWorker: Worker;
    private isRunning: boolean = false;

    constructor(twitterClient: TwitterClient) {
        this.twitterClient = twitterClient;
        this.mentionPoller = new MentionPoller(twitterClient);
        this.mentionProcessor = mentionProcessor;
        this.mentionReplyWorker = createMentionReplyWorker(twitterClient);
    }

    /**
     * Start all X-Publish components
     */
    async start(): Promise<void> {
        if (this.isRunning) {
            console.log('⚠️  X-Publish service is already running');
            return;
        }

        console.log('🚀 Starting X-Publish service...');
        console.log('');

        // Start mention poller
        await this.mentionPoller.start();

        this.isRunning = true;
        console.log('✅ X-Publish service started');
        console.log('   Components:');
        console.log('   - Mention Poller (polling Twitter mentions)');
        console.log('   - Mention Processor (verifying proofs, generating payment links)');
        console.log('   - Mention Reply Worker (sending tweet replies)');
        console.log('');
    }

    /**
     * Stop all X-Publish components
     */
    async stop(): Promise<void> {
        if (!this.isRunning) {
            return;
        }

        console.log('🛑 Stopping X-Publish service...');

        const closePromises = [
            this.mentionPoller.stop(),
            this.mentionProcessor.close(),
            this.mentionReplyWorker.close(),
        ];

        await Promise.all(closePromises);

        this.isRunning = false;
        console.log('✅ X-Publish service stopped');
    }
}
