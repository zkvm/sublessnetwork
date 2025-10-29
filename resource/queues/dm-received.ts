import { Queue, QueueOptions } from 'bullmq';
import { config } from '../config.js';
import type { DmReceivedMessage } from '../types/messages.js';

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
            age: 3600, // Keep completed jobs for 1 hour
            count: 100,
        },
        removeOnFail: {
            age: 86400, // Keep failed jobs for 24 hours
        },
    },
};

export const dmReceivedQueue = new Queue<DmReceivedMessage>(
    config.queues.dmReceived,
    queueOptions
);

// Graceful shutdown
process.on('SIGTERM', async () => {
    await dmReceivedQueue.close();
});

process.on('SIGINT', async () => {
    await dmReceivedQueue.close();
});
