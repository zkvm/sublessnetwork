// Message type definitions for all queues

/**
 * Message structure for dm_received queue
 * Triggered when bot receives a DM
 */
export interface DmReceivedMessage {
    userId: string;           // Twitter user ID
    username: string;         // Twitter username (handle)
    content: string;          // The actual content sent via DM
    messageId: string;        // Twitter DM message ID
    timestamp: string;        // ISO timestamp
}

/**
 * Message structure for dm_reply queue
 * Instructions for bot to reply to a DM
 */
export interface DmReplyMessage {
    userId: string;           // Twitter user ID to reply to
    message: string;          // Reply message content
    resourceId: string;       // Resource ID (for reference)
    proof: string;            // Proof token (for reference)
    timestamp: string;        // ISO timestamp
}

/**
 * Message structure for mention_received queue
 * Triggered when bot detects a mention with content lock
 */
export interface MentionReceivedMessage {
    tweetId: string;          // Twitter tweet ID
    userId: string;           // Twitter user ID who tweeted
    username: string;         // Twitter username
    tweetText: string;        // Full tweet text
    resourceId: string;       // Extracted resource ID from tweet
    proof: string;            // Extracted proof from tweet
    price?: string;           // Extracted price (optional)
    timestamp: string;        // ISO timestamp
}

/**
 * Message structure for mention_reply queue
 * Instructions for bot to reply to a tweet
 */
export interface MentionReplyMessage {
    tweetId: string;          // Tweet ID to reply to
    message: string;          // Reply message content
    paymentLink: string;      // Payment link for the resource
    resourceId: string;       // Resource ID (for reference)
    timestamp: string;        // ISO timestamp
}

/**
 * Resource data returned after DM processing
 */
export interface ProcessedResource {
    id: string;
    proof: string;
    userId: string;
    contentType: string;
    priceUsdCents: number;
}

/**
 * Proof verification result
 */
export interface ProofVerificationResult {
    valid: boolean;
    resourceId?: string;
    userId?: string;
    error?: string;
}
