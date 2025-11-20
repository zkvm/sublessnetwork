/**
 * Twitter OAuth Client
 * 
 * Handles Twitter OAuth 2.0 authentication flow with PKCE
 */

export class TwitterAuthClient {
    private clientId: string;
    private apiBaseUrl: string;
    private redirectUri: string;

    constructor() {
        this.clientId = process.env.NEXT_PUBLIC_TWITTER_CLIENT_ID || '';
        this.apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        this.redirectUri = `${this.apiBaseUrl}/api/auth/callback`;
    }

    /**
     * Initiate Twitter OAuth login flow
     */
    async initiateLogin(): Promise<void> {
        try {
            // 1. Generate PKCE code verifier and challenge
            const codeVerifier = this.generateRandomString(128);
            const codeChallenge = await this.generateCodeChallenge(codeVerifier);

            // 2. Send verifier to backend
            const response = await fetch(`${this.apiBaseUrl}/api/auth/init`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ verifier: codeVerifier })
            });

            if (!response.ok) {
                throw new Error('Failed to initialize OAuth session');
            }

            const { sessionId } = await response.json();

            // 3. Build Twitter authorization URL
            const authUrl = new URL('https://twitter.com/i/oauth2/authorize');
            authUrl.searchParams.set('response_type', 'code');
            authUrl.searchParams.set('client_id', this.clientId);
            authUrl.searchParams.set('redirect_uri', this.redirectUri);
            authUrl.searchParams.set('scope', 'tweet.read users.read offline.access');
            authUrl.searchParams.set('state', sessionId);
            authUrl.searchParams.set('code_challenge', codeChallenge);
            authUrl.searchParams.set('code_challenge_method', 'S256');

            // 4. Redirect to Twitter
            window.location.href = authUrl.toString();
        } catch (error) {
            console.error('Failed to initiate login:', error);
            throw error;
        }
    }

    /**
     * Logout (clear authentication)
     */
    async logout(): Promise<void> {
        try {
            await fetch(`${this.apiBaseUrl}/api/auth/logout`, {
                method: 'POST',
                credentials: 'include'
            });

            // Clear local storage
            localStorage.removeItem('user_id');
            localStorage.removeItem('username');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated(): boolean {
        const userId = localStorage.getItem('user_id');
        const username = localStorage.getItem('username');
        return !!(userId && username);
    }

    /**
     * Get current user info from local storage
     */
    getCurrentUser(): { userId: string; username: string } | null {
        const userId = localStorage.getItem('user_id');
        const username = localStorage.getItem('username');

        if (userId && username) {
            return { userId, username };
        }

        return null;
    }

    /**
     * Generate random string for PKCE
     */
    private generateRandomString(length: number): string {
        const array = new Uint8Array(length);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    /**
     * Generate code challenge from verifier (SHA-256 + Base64URL)
     */
    private async generateCodeChallenge(verifier: string): Promise<string> {
        const encoder = new TextEncoder();
        const data = encoder.encode(verifier);
        const hash = await crypto.subtle.digest('SHA-256', data);

        // Convert to base64url
        return btoa(String.fromCharCode(...new Uint8Array(hash)))
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');
    }
}
