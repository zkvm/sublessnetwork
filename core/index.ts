import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config, validateConfig } from './config.js';
import { TwitterClient } from './twitter/index.js';
import { XPublishService } from './x-publish/service.js';
import apiRoutes from './api/routes.js';

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true // Allow cookies to be sent
}));

// Mount API routes
app.use('/api', apiRoutes);

// Validate configuration
try {
    validateConfig();
    console.log('✅ Configuration validated');
} catch (error) {
    console.error('❌ Configuration error:', error);
    process.exit(1);
}

console.log('');
console.log('🚀 X402X Core Service Started');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`📡 Redis:        ${config.redis.host}:${config.redis.port}`);
console.log(`📊 Database:     ${config.databaseUrl.split('@')[1] || 'configured'}`);
console.log('');
console.log('📋 Services:');
console.log('   🐦 X-Publish (Twitter mention polling and processing)');
console.log('   🔗 Core API (Resource creation & authentication)');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('');

// Start API server
const API_PORT = process.env.CORE_API_PORT || 3001;
app.listen(API_PORT, () => {
    console.log(`🌐 API Server listening on port ${API_PORT}`);
    console.log(`   POST /api/auth/init - Initialize OAuth`);
    console.log(`   GET  /api/auth/callback - OAuth callback`);
    console.log(`   POST /api/auth/logout - Logout`);
    console.log(`   POST /api/resources - Create resource (authenticated)`);
    console.log(`   GET  /api/health - Health check`);
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
