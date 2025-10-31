import { TwitterApi } from 'twitter-api-v2';
import dotenv from 'dotenv';

dotenv.config();

const client = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY!,
    appSecret: process.env.TWITTER_API_SECRET!,
    accessToken: process.env.TWITTER_ACCESS_TOKEN!,
    accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET!,
});

async function getBotUserId() {
    try {
        // Get authenticated user info
        const me = await client.v2.me();
        console.log('Bot User ID:', me.data.id);
        console.log('Bot Username:', me.data.username);
        console.log('\nAdd this to your .env:');
        console.log(`TWITTER_BOT_USER_ID=${me.data.id}`);
    } catch (error) {
        console.error('Error:', error);
    }
}

getBotUserId();