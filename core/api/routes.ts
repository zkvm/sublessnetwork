/**
 * Core API Routes
 * 
 * Express routes for resource management and Twitter OAuth
 */

import express, { Request, Response } from 'express';
import fetch from 'node-fetch';
import { v4 as uuidv4 } from 'uuid';
import { createResource } from './create-resource.js';
import { verifyTwitterToken } from '../middleware/twitter-auth.js';

const router = express.Router();

// ============================================
// OAuth Session Storage
// ============================================

interface OAuthSession {
    verifier: string;
    createdAt: number;
}

// In-memory storage for OAuth sessions (use Redis in production)
const oauthSessions = new Map<string, OAuthSession>();

// Clean up expired sessions every 5 minutes
setInterval(() => {
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;

    for (const [sessionId, session] of oauthSessions.entries()) {
        if (now - session.createdAt > fiveMinutes) {
            oauthSessions.delete(sessionId);
        }
    }
}, 5 * 60 * 1000);

// ============================================
// OAuth Endpoints
// ============================================

/**
 * POST /api/auth/init
 * Initialize OAuth session with PKCE verifier
 */
router.post('/auth/init', (req: Request, res: Response) => {
    try {
        const { verifier } = req.body;

        if (!verifier) {
            return res.status(400).json({ error: 'Missing verifier' });
        }

        // Generate session ID
        const sessionId = uuidv4();

        // Store verifier in session
        oauthSessions.set(sessionId, {
            verifier,
            createdAt: Date.now()
        });

        console.log(`✅ OAuth session created: ${sessionId}`);

        res.json({ sessionId });
    } catch (error) {
        console.error('OAuth init error:', error);
        res.status(500).json({ error: 'Failed to initialize OAuth' });
    }
});

/**
 * GET /api/auth/callback
 * Twitter OAuth callback endpoint
 */
router.get('/auth/callback', async (req: Request, res: Response) => {
    try {
        const { code, state } = req.query;

        if (!code || !state) {
            return res.status(400).send('Missing code or state parameter');
        }

        console.log(`📥 OAuth callback received: sessionId=${state}`);

        // Retrieve session
        const session = oauthSessions.get(state as string);
        if (!session) {
            return res.status(400).send('Invalid or expired session. Please try logging in again.');
        }

        // Exchange code for access token
        const tokenResponse = await fetch('https://api.twitter.com/2/oauth2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${Buffer.from(
                    `${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`
                ).toString('base64')}`
            },
            body: new URLSearchParams({
                code: code as string,
                grant_type: 'authorization_code',
                redirect_uri: process.env.TWITTER_REDIRECT_URI || 'http://localhost:3001/api/auth/callback',
                code_verifier: session.verifier
            })
        });

        if (!tokenResponse.ok) {
            const errorText = await tokenResponse.text();
            console.error('Token exchange failed:', errorText);
            return res.status(500).send('Failed to exchange authorization code for token');
        }

        const tokenData: any = await tokenResponse.json();
        const { access_token, refresh_token } = tokenData;

        console.log('✅ Access token obtained');

        // Get user info
        const userResponse = await fetch('https://api.twitter.com/2/users/me', {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        });

        if (!userResponse.ok) {
            console.error('Failed to fetch user info');
            return res.status(500).send('Failed to fetch user information');
        }

        const userData: any = await userResponse.json();
        const { id: userId, username } = userData.data;

        console.log(`✅ User authenticated: @${username} (${userId})`);

        // Set httpOnly cookies
        res.cookie('twitter_access_token', access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 2 * 60 * 60 * 1000 // 2 hours
        });

        if (refresh_token) {
            res.cookie('twitter_refresh_token', refresh_token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
            });
        }

        // Clean up session
        oauthSessions.delete(state as string);

        // Redirect to frontend success page
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        res.redirect(`${frontendUrl}/auth/success?userId=${userId}&username=${username}`);

    } catch (error) {
        console.error('OAuth callback error:', error);
        res.status(500).send('Authentication failed. Please try again.');
    }
});

/**
 * POST /api/auth/logout
 * Clear authentication cookies
 */
router.post('/auth/logout', (_req: Request, res: Response) => {
    res.clearCookie('twitter_access_token');
    res.clearCookie('twitter_refresh_token');
    res.json({ success: true, message: 'Logged out successfully' });
});

// ============================================
// Resource Endpoints
// ============================================

/**
 * POST /api/resources
 * Create a new resource (requires authentication)
 */
router.post('/resources', verifyTwitterToken, async (req: Request, res: Response) => {
    try {
        // Get user info from middleware (already authenticated)
        const { userId, username } = req.twitterUser!;

        const { content, priceUsdCents, contentType, sourcePlatform } = req.body;

        // Validate required fields
        if (!content) {
            return res.status(400).json({
                error: 'Missing required field',
                required: ['content']
            });
        }

        console.log(`📝 Creating resource for @${username}`);

        // Create resource
        const result = await createResource({
            userId,
            username,
            content,
            priceUsdCents: priceUsdCents || 20,
            contentType: contentType || 'text/plain',
            sourcePlatform: sourcePlatform || 'web'
        });

        res.status(201).json(result);
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({
            error: 'Failed to create resource',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

/**
 * GET /api/health
 * Health check endpoint
 */
router.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({
        status: 'ok',
        service: 'resource-api',
        timestamp: new Date().toISOString()
    });
});

export default router;
