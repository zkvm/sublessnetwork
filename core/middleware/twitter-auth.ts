/**
 * Twitter OAuth Authentication Middleware
 * 
 * Verifies Twitter access token from httpOnly cookie and extracts user info
 */

import { Request, Response, NextFunction } from 'express';
import fetch from 'node-fetch';

// Extend Express Request type to include Twitter user info
declare global {
    namespace Express {
        interface Request {
            twitterUser?: {
                userId: string;
                username: string;
            };
        }
    }
}

/**
 * Middleware to verify Twitter access token from cookie
 */
export async function verifyTwitterToken(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        // Read access token from httpOnly cookie
        const token = req.cookies.twitter_access_token;

        if (!token) {
            return res.status(401).json({
                error: 'Not authenticated',
                message: 'Please login with Twitter first'
            });
        }

        // Verify token by calling Twitter API
        const response = await fetch('https://api.twitter.com/2/users/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            // Token is invalid or expired
            console.error('Twitter API returned error:', response.status);

            // Clear invalid cookie
            res.clearCookie('twitter_access_token');

            return res.status(401).json({
                error: 'Invalid or expired token',
                message: 'Please login again'
            });
        }

        const data: any = await response.json();

        // Attach user info to request
        req.twitterUser = {
            userId: data.data.id,
            username: data.data.username
        };

        next();
    } catch (error) {
        console.error('Twitter authentication error:', error);
        return res.status(500).json({
            error: 'Authentication failed',
            message: 'An error occurred during authentication'
        });
    }
}
