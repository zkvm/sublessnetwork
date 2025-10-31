import { config, validateConfig } from './config.js';
import { dmProcessor } from './consumers/dm-processor.js';
import { mentionProcessor } from './consumers/mention-processor.js';
import { TwitterClient } from './twitter/index.js';
import { MentionPoller } from './x-publish/index.js';

// Validate configuration
try {
    validateConfig();
    console.log('✅ Configuration validated');
} catch (error) {
    console.error('❌ Configuration error:', error);
    process.exit(1);
}

console.log('');
console.log('🚀 X402X Resource Queue Workers Started');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`📡 Redis:        ${config.redis.host}:${config.redis.port}`);
console.log(`📊 Database:     ${config.databaseUrl.split('@')[1] || 'configured'}`);
console.log('');
console.log('📋 Active Queues:');
console.log(`   1️⃣  ${config.queues.dmReceived} (DM processing)`);
console.log(`   2️⃣  ${config.queues.dmReply} (DM replies - not consumed)`);
console.log(`   3️⃣  ${config.queues.mentionReceived} (Mention processing)`);
console.log(`   4️⃣  ${config.queues.mentionReply} (Mention replies - not consumed)`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('');
console.log('👂 Workers listening for messages...');
console.log('');

// Initialize Twitter client and mention poller
let twitterClient: TwitterClient | null = null;
let mentionPoller: MentionPoller | null = null;
try {
    // Check if Twitter credentials are configured
    const twitterConfig = process.env.TWITTER_API_KEY ? {
        apiKey: process.env.TWITTER_API_KEY,
        apiSecret: process.env.TWITTER_API_SECRET!,
        accessToken: process.env.TWITTER_ACCESS_TOKEN!,
        accessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET!,
        botUserId: process.env.TWITTER_BOT_USER_ID!,
    } : null;

    if (twitterConfig) {
        // Initialize shared Twitter client
        twitterClient = new TwitterClient(twitterConfig);
        console.log('✅ Twitter client initialized');

        // Initialize mention poller with injected client
        mentionPoller = new MentionPoller(twitterClient);
        await mentionPoller.start();
        console.log('✅ Twitter mention poller started');
    } else {
        console.log('⚠️  Twitter credentials not configured, skipping Twitter integration');
    }
} catch (error) {
    console.error('⚠️  Twitter integration failed to start:', error);
    console.log('   (Continuing without Twitter features)');
}
console.log('');

// Export twitterClient for use in consumers
export { twitterClient };

// Log worker status
dmProcessor.on('ready', () => {
    console.log('✅ DM processor ready');
});

mentionProcessor.on('ready', () => {
    console.log('✅ Mention processor ready');
});

// Handle shutdown
async function shutdown() {
    console.log('');
    console.log('👋 Shutting down gracefully...');

    const closePromises = [
        dmProcessor.close(),
        mentionProcessor.close(),
    ];

    // Stop mention poller if running
    if (mentionPoller) {
        closePromises.push(mentionPoller.stop());
    }

    await Promise.all(closePromises);

    console.log('✅ All workers closed');
    process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Keep process alive
process.stdin.resume();
