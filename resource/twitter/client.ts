import { TwitterApi } from 'twitter-api-v2';

export interface TwitterConfig {
    apiKey: string;
    apiSecret: string;
    accessToken: string;
    accessTokenSecret: string;
    botUserId: string;
}

/**
 * Twitter API client wrapper for tweet operations
 * 
 * Shared client used by:
 * - x-publish/mention-poller (polling mentions)
 * - consumers/*-reply workers (sending replies/DMs)
 */
export class TwitterClient {
    private client: TwitterApi;
    public readonly botUserId: string;

    constructor(config: TwitterConfig) {
        this.client = new TwitterApi({
            appKey: config.apiKey,
            appSecret: config.apiSecret,
            accessToken: config.accessToken,
            accessSecret: config.accessTokenSecret,
        });
        this.botUserId = config.botUserId;
    }

    /**
     * Get the read-write client for advanced operations
     */
    get readWrite() {
        return this.client.readWrite;
    }

    /**
     * Reply to a tweet
     * @param tweetId - ID of the tweet to reply to
     * @param message - Reply message text
     * @returns Tweet ID of the reply
     */
    async replyToTweet(tweetId: string, message: string): Promise<string> {
        try {
            console.log(`📤 Replying to tweet ${tweetId}...`);
            console.log(`   Message: ${message}`);

            const rwClient = this.client.readWrite;

            const response = await rwClient.v2.reply(message, tweetId);

            console.log(`✅ Reply sent successfully (ID: ${response.data.id})`);

            return response.data.id;
        } catch (error: any) {
            console.error('❌ Error replying to tweet:', error);

            if (error.data) {
                console.error('   Error details:', JSON.stringify(error.data, null, 2));
            }

            if (error.code === 429) {
                console.error('   ⚠️  Rate limit exceeded');
            }

            throw error;
        }
    }

    /**
     * Send a direct message
     * @param userId - Twitter user ID to send DM to
     * @param message - DM text content
     * @returns Event ID of the DM
     */
    async sendDirectMessage(userId: string, message: string): Promise<string> {
        try {
            console.log(`📩 Sending DM to user ${userId}...`);
            console.log(`   Message: ${message.substring(0, 50)}...`);

            const rwClient = this.client.readWrite;

            const response = await rwClient.v2.sendDmToParticipant(userId, {
                text: message,
            });

            console.log(`✅ DM sent successfully (Event ID: ${response.dm_event_id})`);

            return response.dm_event_id;
        } catch (error: any) {
            console.error('❌ Error sending DM:', error);

            if (error.data) {
                console.error('   Error details:', JSON.stringify(error.data, null, 2));
            }

            if (error.code === 403) {
                console.error('   ⚠️  Cannot send DM - user may not follow the bot or DMs are disabled');
            } else if (error.code === 429) {
                console.error('   ⚠️  Rate limit exceeded');
            }

            throw error;
        }
    }

    /**
     * Get user info by username
     * @param username - Twitter username (without @)
     * @returns User ID and other basic info
     */
    async getUserByUsername(username: string): Promise<{
        id: string;
        username: string;
        name: string;
    }> {
        try {
            const response = await this.client.v2.userByUsername(username);

            return {
                id: response.data.id,
                username: response.data.username,
                name: response.data.name,
            };
        } catch (error: any) {
            console.error(`❌ Error fetching user @${username}:`, error);
            throw error;
        }
    }

    /**
     * Get tweet by ID
     * @param tweetId - Tweet ID
     * @returns Tweet data
     */
    async getTweetById(tweetId: string): Promise<{
        id: string;
        text: string;
        authorId: string;
        createdAt?: string;
    }> {
        try {
            const response = await this.client.v2.singleTweet(tweetId, {
                'tweet.fields': ['created_at', 'author_id', 'text'],
            });

            return {
                id: response.data.id,
                text: response.data.text,
                authorId: response.data.author_id!,
                createdAt: response.data.created_at,
            };
        } catch (error: any) {
            console.error(`❌ Error fetching tweet ${tweetId}:`, error);
            throw error;
        }
    }
}
