/**
 * X-Publish Module - Twitter Mention Polling
 * 
 * This module provides mention polling for the resource service.
 * It uses the shared TwitterClient (from resource/twitter) for API operations.
 * 
 * Usage: Import MentionPoller and inject TwitterClient instance
 */

// Export mention polling components
export { MentionPoller } from './mention-poller.js';
export { MentionTracker } from './mention-tracker.js';
export { config } from './config.js';

// Re-export types
export type { XPublishConfig } from './config.js';
