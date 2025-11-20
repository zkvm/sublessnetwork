/**
 * OAuth Success Callback Page
 * 
 * Receives user info from backend after successful OAuth
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function AuthSuccessPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Get user info from URL parameters (set by backend)
        const { userId, username } = router.query;

        if (userId && username) {
            // Save user info to localStorage
            localStorage.setItem('user_id', userId as string);
            localStorage.setItem('username', username as string);

            console.log('✅ Login successful:', { userId, username });

            // Redirect to create page after short delay
            setTimeout(() => {
                router.push('/create');
            }, 1000);
        } else if (router.isReady) {
            // URL is ready but params are missing
            setError('Missing user information');
            console.error('Missing userId or username in callback');
        }
    }, [router]);

    if (error) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <h1>❌ Login Failed</h1>
                <p>{error}</p>
                <button
                    onClick={() => router.push('/')}
                    style={{
                        marginTop: '1rem',
                        padding: '0.5rem 1rem',
                        backgroundColor: '#1DA1F2',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Back to Home
                </button>
            </div>
        );
    }

    return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h1>✅ Login Successful!</h1>
            <p>Redirecting to create page...</p>
            <div
                style={{
                    marginTop: '2rem',
                    display: 'inline-block',
                    width: '40px',
                    height: '40px',
                    border: '4px solid #f3f3f3',
                    borderTop: '4px solid #1DA1F2',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }}
            />
            <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
}
