import { config as dotenvConfig } from 'dotenv';

dotenvConfig();

export const config = {
    // Redis Configuration
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        password: process.env.REDIS_PASSWORD || undefined,
        db: parseInt(process.env.REDIS_DB || '0', 10),
    },

    // Queue Configuration
    queues: {
        dmReceived: 'dm_received',
        dmReply: 'dm_reply',
        mentionReceived: 'mention_received',
        mentionReply: 'mention_reply',
    },

    // Database
    databaseUrl: process.env.DATABASE_URL || 'postgresql://localhost:5432/x402_payment',

    // Encryption
    encryptionKey: process.env.ENCRYPTION_KEY,

    // Watermark
    watermarkSecret: process.env.WATERMARK_SECRET,

    // Base URL
    baseUrl: process.env.BASE_URL || 'http://localhost:4021',

    // Twitter Bot
    twitterBotUsername: process.env.TWITTER_BOT_USERNAME || 'x402X',
} as const;

// Validation
export function validateConfig() {
    const required = [
        'databaseUrl',
        'encryptionKey',
        'watermarkSecret',
    ];

    const missing = required.filter(key => !config[key as keyof typeof config]);

    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }

    return true;
}
