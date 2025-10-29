import { Queue, QueueOptions } from 'bullmq';
import { config } from '../config.js';
import type { MentionReceivedMessage } from '../types/messages.js';

const queueOptions: QueueOptions = {
    connection: {
        host: config.redis.host,
        port: config.redis.port,
        password: config.redis.password,
        db: config.redis.db,
    },
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 2000,
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

export const mentionReceivedQueue = new Queue<MentionReceivedMessage>(
    config.queues.mentionReceived,
    queueOptions
);

// Graceful shutdown
process.on('SIGTERM', async () => {
    await mentionReceivedQueue.close();
});

process.on('SIGINT', async () => {
    await mentionReceivedQueue.close();
});
