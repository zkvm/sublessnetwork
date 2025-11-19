import express from 'express';
import { config, validateConfig } from './config.js';
import { TwitterClient } from './twitter/index.js';
import { XPublishService } from './x-publish/service.js';
import { createResource } from './api/create-resource.js';

const app = express();
app.use(express.json());

// Validate configuration
try {
    validateConfig();
    console.log('✅ Configuration validated');
} catch (error) {
    console.error('❌ Configuration error:', error);
    process.exit(1);
}

console.log('');
console.log('🚀 X402X Resource Service Started');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`📡 Redis:        ${config.redis.host}:${config.redis.port}`);
console.log(`📊 Database:     ${config.databaseUrl.split('@')[1] || 'configured'}`);
console.log('');
console.log('📋 Services:');
console.log('   🐦 X-Publish (Twitter mention polling and processing)');
console.log('   🔗 Resource API (Direct resource creation)');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('');

// API Routes
app.post('/api/resources', async (req, res) => {
    try {
        const { userId, username, content, messageId, sourcePlatform, contentType, priceUsdCents } = req.body;

        // Validate required fields
        if (!userId || !username || !content) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['userId', 'username', 'content']
            });
        }

        // Create resource
        const result = await createResource({
            userId,
            username,
            content,
            messageId,
            sourcePlatform,
            contentType,
            priceUsdCents
        });

        res.status(201).json(result);
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({
            error: 'Failed to create resource',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// Start API server
const API_PORT = process.env.RESOURCE_API_PORT || 3001;
app.listen(API_PORT, () => {
    console.log(`🌐 API Server listening on port ${API_PORT}`);
    console.log(`   POST /api/resources - Create resource`);
    console.log(`   GET  /health - Health check`);
    console.log('');
});

// Initialize Twitter client and X-Publish service
let xPublishService: XPublishService | null = null;
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
        const twitterClient = new TwitterClient(twitterConfig);
        console.log('✅ Twitter client initialized');

        // Initialize X-Publish service with Twitter client
        xPublishService = new XPublishService(twitterClient);
        await xPublishService.start();
    } else {
        console.log('⚠️  Twitter credentials not configured, skipping X-Publish service');
    }
} catch (error) {
    console.error('⚠️  X-Publish service failed to start:', error);
    console.log('   (Continuing without X-Publish features)');
}
console.log('');

// Handle shutdown
async function shutdown() {
    console.log('');
    console.log('👋 Shutting down gracefully...');

    const closePromises = [];

    // Stop X-Publish service if running
    if (xPublishService) {
        closePromises.push(xPublishService.stop());
    }

    await Promise.all(closePromises);

    console.log('✅ All services and API server closed');
    process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Keep process alive
process.stdin.resume();
