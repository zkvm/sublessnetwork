import { useState } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import Link from 'next/link';
import { JSONContent } from '@tiptap/react';

// Dynamically import TiptapEditor to avoid SSR issues
const TiptapEditor = dynamic(() => import('../components/TiptapEditor'), {
    ssr: false,
    loading: () => <p>Loading editor...</p>,
});

export default function CreateResource() {
    const router = useRouter();
    const [content, setContent] = useState<JSONContent | string>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        // Validation
        // Check if content is empty (either empty string or empty JSON doc)
        const isContentEmpty = typeof content === 'string'
            ? !content.trim()
            : !content || (content.type === 'doc' && (!content.content || content.content.length === 0));

        if (isContentEmpty) {
            setError('Please enter some content');
            setLoading(false);
            return;
        }

        try {
            // Mock API call - will be replaced with actual resource service endpoint
            const response = await fetch('/api/resources/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content,
                    userId: 'user_123', // TODO: Get from authentication
                    timestamp: new Date().toISOString(),
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create resource');
            }

            const data = await response.json();

            setSuccess(true);

            // Show success message with resource details
            alert(
                `✅ Resource created successfully!\n\n` +
                `Resource ID: ${data.resourceId}\n` +
                `Proof Token: ${data.proof}\n\n` +
                `You can now share this resource!`
            );

            // Redirect to the created resource page
            setTimeout(() => {
                router.push(`/resources/${data.resourceId}`);
            }, 2000);

        } catch (err: any) {
            console.error('Error creating resource:', err);
            setError(err.message || 'Failed to create resource. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="container">
                <header className="header">
                    <Link href="/" className="back-link">
                        ← Back
                    </Link>
                    <h1>Create</h1>
                    <p className="subtitle">
                        Create paywalled resources and earn USDC payments
                    </p>
                    <p className="info-text">
                        After creating, you'll receive a Resource ID and Proof Token.
                        You can then publish it on Twitter to set a price and make it available for purchase.
                    </p>
                </header>

                <form onSubmit={handleSubmit} className="form">
                    {/* Content Editor */}
                    <div className="form-group">
                        <label>
                            <span className="required">*</span>
                        </label>
                        <p className="help-text">
                            This content will be encrypted and only accessible after payment.
                        </p>
                        <TiptapEditor
                            content={content}
                            onChange={setContent}
                            placeholder="Write your full content here... (supports text, images, videos)"
                        />
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="error-message">
                            ⚠️ {error}
                        </div>
                    )}

                    {/* Success Message */}
                    {success && (
                        <div className="success-message">
                            ✅ Resource created successfully! Redirecting...
                        </div>
                    )}

                    {/* Submit Button */}
                    <div className="form-actions">
                        <button
                            type="submit"
                            className="submit-button"
                            disabled={loading}
                        >
                            {loading ? 'Creating Resource...' : 'Create Resource'}
                        </button>
                    </div>


                </form>
            </div>

            <style jsx>{`
        .container {
          max-width: 900px;
          margin: 0 auto;
          padding: 40px 20px;
          font-family: var(--font-body);
        }

        .header {
          text-align: center;
          margin-bottom: 40px;
        }
        .back-link {
          display: inline-block;
          margin-bottom: 20px;
          color: var(--color-text);
          text-decoration: none;
          font-size: 16px;
          transition: opacity 0.2s;
        }
        .back-link:hover {
          opacity: 0.7;
        }
        .header h1 {
          font-family: var(--font-heading);
          color: var(--color-text);
          margin: 0 0 10px 0;
        }
        .subtitle {
          color: var(--color-text);
          opacity: 0.8;
          margin: 0;
        }
        .info-text {
          margin-top: 20px;
          padding: 16px;
          border-left: 2px solid var(--color-text);
          color: var(--color-text);
          opacity: 0.8;
        }

        .form {
          background: white;
          border: 1px solid var(--color-primary);
          border-radius: 12px;
          padding: 40px;
          box-shadow: 8px 8px 0 var(--color-primary);
        }
        .form-group {
          margin-bottom: 30px;
          position: relative;
        }
        .form-group label {
          display: block;
          font-family: var(--font-heading);
          font-size: 20px;
          color: var(--color-text);
          margin-bottom: 8px;
        }
        .required {
          color: #e74c3c;
        }
        .input,
        .textarea {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid var(--color-primary);
          border-radius: 6px;
          font-family: var(--font-body);
          font-size: 16px;
          color: var(--color-primary);
          transition: all 0.2s;
        }
        .input:focus,
        .textarea:focus {
          outline: none;
          border-color: var(--color-text);
          box-shadow: 0 0 0 3px rgba(122, 27, 16, 0.1);
        }
        .textarea {
          resize: vertical;
          min-height: 100px;
        }
        .char-count {
          position: absolute;
          top: 8px;
          right: 0;
          font-size: 12px;
          color: #999;
        }

        .help-text {
          font-size: 14px;
          color: #666;
          margin: 8px 0 0 0;
        }

        .error-message,
        .success-message {
          padding: 16px;
          border-radius: 6px;
          margin-bottom: 20px;
          font-size: 16px;
        }

        .error-message {
          background: #fee;
          border: 2px solid #e74c3c;
          color: #c0392b;
        }

        .success-message {
          background: #efe;
          border: 2px solid #27ae60;
          color: #1e8449;
        }

        .form-actions {
          margin-top: 40px;
        }

        .submit-button {
          width: 100%;
          padding: 18px 32px;
          background: var(--color-primary);
          color: var(--color-text);
          border: 2px solid var(--color-text);
          border-radius: 4px;
          font-family: var(--font-heading);
          font-size: 24px;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 4px 4px 0 var(--color-text);
        }

        .submit-button:hover:not(:disabled) {
          transform: translate(2px, 2px);
          box-shadow: 2px 2px 0 var(--color-text);
        }

        .submit-button:active:not(:disabled) {
          transform: translate(4px, 4px);
          box-shadow: 0 0 0 var(--color-text);
        }

        .submit-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        

        @media (max-width: 768px) {
          .container {
            padding: 20px 10px;
          }

          .form {
            padding: 20px;
          }

          .header h1 {
            font-size: 36px;
          }

          .submit-button {
            font-size: 20px;
          }
        }
      `}</style>
        </>
    );
}
