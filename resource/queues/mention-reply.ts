import { Queue, QueueOptions } from 'bullmq';
import { config } from '../config.js';
import type { MentionReplyMessage } from '../types/messages.js';

const queueOptions: QueueOptions = {
    connection: {
        host: config.redis.host,
        port: config.redis.port,
        password: config.redis.password,
        db: config.redis.db,
    },
    defaultJobOptions: {
        attempts: 1,
        backoff: {
            type: 'exponential',
            delay: 3000,
        },
        removeOnComplete: {
            age: 3600,
            count: 100,
        },
        removeOnFail: {
            age: 86400,
        },
    },
};

export const mentionReplyQueue = new Queue<MentionReplyMessage>(
    config.queues.mentionReply,
    queueOptions
);

// Graceful shutdown
process.on('SIGTERM', async () => {
    await mentionReplyQueue.close();
});

process.on('SIGINT', async () => {
    await mentionReplyQueue.close();
});
