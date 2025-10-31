/**
 * X-Publish Configuration
 * 
 * Note: Twitter credentials are now managed by the main resource service.
 * This config only handles x-publish specific settings (polling, redis).
 */

export interface XPublishConfig {
    polling: {
        mentionIntervalSeconds: number;
    };
    redis: {
        host: string;
        port: number;
        password?: string;
        db: number;
    };
}

export const config: XPublishConfig = {
    polling: {
        mentionIntervalSeconds: parseInt(process.env.MENTION_POLL_INTERVAL_SECONDS || '30'),
    },
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
        db: parseInt(process.env.REDIS_DB || '0'),
    },
};
