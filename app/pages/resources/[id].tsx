import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { X402Client } from 'x402-solana/client';
import dynamic from 'next/dynamic';

// Dynamically import WalletMultiButton to avoid SSR hydration issues
const WalletButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then((mod) => mod.WalletMultiButton),
  { ssr: false }
); interface ResourcePreview {
  id: string;
  creator: string;
  contentType: string;
  price: {
    usd: string;
    currency: string;
  };
  chain: string;
  network: string;
  tweetId: string;
  status: string;
}

interface PurchasedContent {
  content: string;
  metadata: {
    resourceId: string;
    creator: string;
    purchasedAt: string;
    contentType: string;
  };
}

export default function ResourcePage() {
  const router = useRouter();
  const { id } = router.query;
  const wallet = useWallet();
  const { connection } = useConnection(); const [preview, setPreview] = useState<ResourcePreview | null>(null);
  const [content, setContent] = useState<PurchasedContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch preview when page loads
  useEffect(() => {
    if (id) {
      fetchPreview(id as string);
    }
  }, [id]);

  const fetchPreview = async (resourceId: string) => {
    try {
      const response = await fetch(`http://localhost:4021/resources/${resourceId}/preview`);
      if (!response.ok) {
        throw new Error('Failed to fetch preview');
      }
      const data = await response.json();
      setPreview(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handlePurchase = async () => {
    if (!wallet.connected || !wallet.signTransaction) {
      setError('Please connect your wallet first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get the RPC URL from the connection (same as _app.tsx endpoint)
      const rpcUrl = connection.rpcEndpoint;
      console.log('Creating X402Client with RPC:', rpcUrl);

      const client = new X402Client({
        wallet: wallet as any,
        network: 'solana', // or 'solana-devnet' for testing
        rpcUrl: rpcUrl, // Use the same RPC endpoint as the wallet connection
      }); const response = await client.fetch(`http://localhost:4021/resources/${id}`);

      if (!response.ok) {
        throw new Error('Payment failed');
      }

      const data = await response.json();
      setContent(data);
    } catch (err: any) {
      setError(err.message || 'Failed to purchase content');
      console.error('Purchase error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <header>
        <h1>X402X - Decentralized Content Marketplace</h1>
        <WalletButton />
      </header>

      <main>
        {error && (
          <div className="error-box">
            <strong>Error:</strong> {error}
          </div>
        )}

        {preview && (
          <div className="preview-card">
            <h2>Content Preview</h2>
            <div className="preview-details">
              <div className="detail-row">
                <span className="label">Resource ID:</span>
                <span className="value">{preview.id}</span>
              </div>
              <div className="detail-row">
                <span className="label">Creator:</span>
                <span className="value">{preview.creator}</span>
              </div>
              <div className="detail-row">
                <span className="label">Type:</span>
                <span className="value">{preview.contentType}</span>
              </div>
              <div className="detail-row">
                <span className="label">Price:</span>
                <span className="value price">${preview.price.usd} {preview.price.currency}</span>
              </div>
              <div className="detail-row">
                <span className="label">Chain:</span>
                <span className="value">{preview.chain}</span>
              </div>
              <div className="detail-row">
                <span className="label">Status:</span>
                <span className={`badge badge-${preview.status}`}>{preview.status}</span>
              </div>
              {preview.tweetId && (
                <div className="detail-row">
                  <span className="label">Tweet:</span>
                  <a
                    href={`https://twitter.com/i/web/status/${preview.tweetId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link"
                  >
                    View on Twitter →
                  </a>
                </div>
              )}
            </div>

            {!content && (
              <button
                onClick={handlePurchase}
                disabled={loading || !wallet.connected}
                className="purchase-button"
              >
                {loading ? (
                  'Processing...'
                ) : !wallet.connected ? (
                  'Connect Wallet to Purchase'
                ) : (
                  `Purchase for $${preview.price.usd} ${preview.price.currency}`
                )}
              </button>
            )}
          </div>
        )}

        {content && (
          <div className="content-card">
            <h2>✅ Content Unlocked!</h2>
            <div className="content-box">
              <pre>{content.content}</pre>
            </div>
            <div className="metadata">
              <p>Purchased at: {new Date(content.metadata.purchasedAt).toLocaleString()}</p>
              <p>Resource ID: {content.metadata.resourceId}</p>
            </div>
          </div>
        )}
      </main>

      <style jsx>{`
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 2px solid #eee;
        }

        h1 {
          font-size: 24px;
          margin: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        h2 {
          margin-top: 0;
          color: #333;
        }

        .error-box {
          background: #fee;
          border: 1px solid #fcc;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 20px;
          color: #c00;
        }

        .preview-card, .content-card {
          background: white;
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          margin-bottom: 20px;
        }

        .preview-details {
          margin: 20px 0;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #f0f0f0;
        }

        .detail-row:last-child {
          border-bottom: none;
        }

        .label {
          font-weight: 600;
          color: #666;
        }

        .value {
          color: #333;
        }

        .value.price {
          font-size: 20px;
          font-weight: bold;
          color: #667eea;
        }

        .badge {
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .badge-published {
          background: #d4edda;
          color: #155724;
        }

        .badge-draft {
          background: #fff3cd;
          color: #856404;
        }

        .link {
          color: #667eea;
          text-decoration: none;
          font-weight: 500;
        }

        .link:hover {
          text-decoration: underline;
        }

        .purchase-button {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          margin-top: 20px;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .purchase-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .purchase-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .content-box {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
          max-height: 500px;
          overflow-y: auto;
        }

        .content-box pre {
          margin: 0;
          white-space: pre-wrap;
          word-wrap: break-word;
          font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
          font-size: 14px;
          line-height: 1.6;
          color: #333;
        }

        .metadata {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #eee;
          color: #666;
          font-size: 14px;
        }

        .metadata p {
          margin: 8px 0;
        }
      `}</style>
    </div>
  );
}
