import { TweetV2, UserV2 } from 'twitter-api-v2';
import { config } from './config.js';
import { MentionTracker } from './mention-tracker.js';
import { mentionReceivedQueue } from './queues/mention-received.js';
import type { TwitterClient } from '../twitter/index.js';
import type { MentionReceivedMessage } from '../types/messages.js';

/**
 * Poll for mentions and push to mention_received queue
 * 
 * Uses injected TwitterClient for API operations
 */
export class MentionPoller {
    private twitterClient: TwitterClient;
    private tracker: MentionTracker;
    private isRunning: boolean = false;
    private pollTimer?: NodeJS.Timeout;

    constructor(twitterClient: TwitterClient) {
        this.twitterClient = twitterClient;
        this.tracker = new MentionTracker();
    }

    /**
     * Parse mention tweet text to extract parameters
     * Expected format: @sublessnetwork lock:0.5 id:abc123 proof:xyz-456
     */
    private parseMentionParams(text: string): {
        resourceId?: string;
        proof?: string;
        price?: string;
    } {
        const result: { resourceId?: string; proof?: string; price?: string } = {};

        // Extract resource ID (UUID format or any alphanumeric)
        const idMatch = text.match(/id:([a-zA-Z0-9-]+)/i);
        if (idMatch) {
            result.resourceId = idMatch[1];
        }

        // Extract proof token
        const proofMatch = text.match(/proof:([a-zA-Z0-9-]+)/i);
        if (proofMatch) {
            result.proof = proofMatch[1];
        }

        // Extract price (price:0.5 means $0.50)
        const priceMatch = text.match(/price:(\d+\.?\d*)/i);
        if (priceMatch) {
            result.price = priceMatch[1];
        }

        return result;
    }

    /**
     * Fetch new mentions from Twitter API
     */
    async pollMentions(): Promise<void> {
        try {
            console.log(`🔍 [${new Date().toISOString()}] Polling for new mentions...`);

            const rwClient = this.twitterClient.readWrite;

            // Get mentions (tweets that mention the bot)
            const mentions = await rwClient.v2.userMentionTimeline(this.twitterClient.botUserId, {
                max_results: 20,
                'tweet.fields': ['created_at', 'author_id', 'text'],
                expansions: ['author_id'],
                'user.fields': ['username', 'name'],
            });

            if (!mentions.data.data || mentions.data.data.length === 0) {
                console.log('   No new mentions found');
                return;
            }

            console.log(`   Found ${mentions.data.data.length} mention(s)`);

            let processedCount = 0;
            let skippedCount = 0;

            for (const tweet of mentions.data.data) {
                // Check if already processed
                if (await this.tracker.isProcessed(tweet.id)) {
                    skippedCount++;
                    continue;
                }

                // Get author info from includes
                const author = mentions.data.includes?.users?.find(
                    (u: UserV2) => u.id === tweet.author_id
                );

                if (!author) {
                    console.log(`   ⚠️  Could not find author info for tweet ${tweet.id}`);
                    continue;
                }

                // Parse mention parameters
                const params = this.parseMentionParams(tweet.text);

                // Validate required parameters
                if (!params.resourceId || !params.proof) {
                    console.log(
                        `   ⚠️  Invalid mention format from @${author.username} (missing id or proof)`
                    );
                    console.log(`      Tweet: ${tweet.text}`);
                    // Still mark as processed to avoid re-checking
                    await this.tracker.markAsProcessed(tweet.id);
                    continue;
                }

                // Prepare mention data using MentionReceivedMessage type
                const mentionData: MentionReceivedMessage = {
                    tweetId: tweet.id,
                    userId: tweet.author_id!,
                    username: author.username,
                    tweetText: tweet.text,
                    resourceId: params.resourceId,
                    proof: params.proof,
                    price: params.price,
                    timestamp: tweet.created_at || new Date().toISOString(),
                };

                // Push to mention_received queue
                await mentionReceivedQueue.add('mention-received', mentionData);

                // Mark as processed
                await this.tracker.markAsProcessed(tweet.id);

                console.log(
                    `   ✅ Mention from @${author.username} added to queue` +
                    `\n      Resource: ${params.resourceId}, Proof: ${params.proof}, Price: ${params.price || 'default'}`
                );

                processedCount++;
            }

            console.log(
                `   📊 Processed: ${processedCount}, Skipped: ${skippedCount}`
            );

        } catch (error: any) {
            console.error('❌ Error polling mentions:', error);

            // Log detailed error information
            if (error.data) {
                console.error('   Error details:', JSON.stringify(error.data, null, 2));
            }

            if (error.code === 429) {
                console.error('   ⚠️  Rate limit exceeded. Will retry after interval.');
            }
        }
    }

    /**
     * Start polling loop
     */
    async start(): Promise<void> {
        if (this.isRunning) {
            console.log('⚠️  Mention poller is already running');
            return;
        }

        this.isRunning = true;
        console.log('🚀 Starting mention poller...');
        console.log(`   Polling interval: ${config.polling.mentionIntervalSeconds}s`);

        // Initial poll
        await this.pollMentions();

        // Set up recurring poll
        this.pollTimer = setInterval(async () => {
            await this.pollMentions();
        }, config.polling.mentionIntervalSeconds * 1000);

        console.log('✅ Mention poller started');
    }

    /**
     * Stop polling loop
     */
    async stop(): Promise<void> {
        if (!this.isRunning) {
            return;
        }

        console.log('🛑 Stopping mention poller...');

        if (this.pollTimer) {
            clearInterval(this.pollTimer);
            this.pollTimer = undefined;
        }

        this.isRunning = false;

        await this.tracker.close();

        console.log('✅ Mention poller stopped');
    }
}
