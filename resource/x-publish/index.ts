/**
 * X-Publish Module - Twitter Mention Polling and Processing
 * 
 * This module provides complete Twitter mention handling:
 * - Polling for new mentions
 * - Processing mentions (verifying proofs, generating payment links)
 * - Sending tweet replies
 * 
 * Usage: Import XPublishService and inject TwitterClient instance
 */

// Export main service
export { XPublishService } from './service.js';

// Export individual components (for advanced usage)
export { MentionPoller } from './mention-poller.js';
export { MentionTracker } from './mention-tracker.js';
export { mentionProcessor } from './mention-processor.js';
export { createMentionReplyWorker } from './mention-reply-worker.js';
export { mentionReceivedQueue } from './queues/mention-received.js';
export { mentionReplyQueue } from './queues/mention-reply.js';

// Export config
export { config } from './config.js';

// Re-export types
export type { XPublishConfig } from './config.js';
