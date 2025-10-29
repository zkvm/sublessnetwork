import { config, validateConfig } from './config.js';
import { dmProcessor } from './consumers/dm-processor.js';
import { mentionProcessor } from './consumers/mention-processor.js';

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

    await Promise.all([
        dmProcessor.close(),
        mentionProcessor.close(),
    ]);

    console.log('✅ All workers closed');
    process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Keep process alive
process.stdin.resume();
