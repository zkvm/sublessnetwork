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
);

interface ResourcePreview {
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
      const response = await fetch(`https://subless.network/resources/${resourceId}/preview`);
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
      });

      const response = await client.fetch(`https://subless.network/resources/${id}`);

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
        <h1>Subless Network</h1>
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
            <h2>Preview</h2>
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
            <h2>Unlocked</h2>
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

      <style jsx global>{`
        /* Wallet Button Custom Styles */
        .wallet-adapter-button {
          background: var(--color-primary) !important;
          color: var(--color-text) !important;
          border: 1px solid var(--color-text) !important;
          border-radius: var(--radius-sm) !important;
          font-family: var(--font-heading) !important;
          font-size: 18px !important;
          padding: 12px 24px !important;
          font-weight: 600 !important;
          transition: all 0.2s ease !important;
        }

        .wallet-adapter-button:not([disabled]):hover {
          background: var(--color-text) !important;
          color: var(--color-primary) !important;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px var(--color-shadow);
        }

        .wallet-adapter-button[disabled] {
          opacity: 0.6 !important;
          cursor: not-allowed !important;
        }

        /* Wallet Icon */
        .wallet-adapter-button-start-icon {
          margin-right: 8px !important;
        }

        /* Dropdown Menu */
        .wallet-adapter-dropdown {
          background: var(--color-primary) !important;
          border: 1px solid var(--color-text) !important;
          border-radius: var(--radius-sm) !important;
        }

        .wallet-adapter-dropdown-list {
          background: var(--color-primary) !important;
        }

        .wallet-adapter-dropdown-list-item {
          color: var(--color-text) !important;
          font-family: var(--font-body) !important;
        }

        .wallet-adapter-dropdown-list-item:hover {
          background: var(--color-primary) !important;
        }

        /* Modal */
        .wallet-adapter-modal-wrapper {
          background: var(--color-primary) !important;
        }

        .wallet-adapter-modal {
          background: var(--color-primary) !important;
          border: 1px solid var(--color-text) !important;
          border-radius: var(--radius-sm) !important;
        }

        .wallet-adapter-modal-title {
          color: var(--color-text) !important;
          font-family: var(--font-heading) !important;
          font-size: 24px !important;
        }

        .wallet-adapter-modal-list .wallet-adapter-button {
          border: 1px solid var(--color-border) !important;
        }

        .wallet-adapter-modal-list .wallet-adapter-button:hover {
          background: var(--color-text) !important;
        }
      `}</style>

      <style jsx>{`
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 40px;
          padding-bottom: 20px;
        }
        h1 {
          font-size: 24px;
          margin: 0;
          -webkit-background-clip: text;
        }
        h2 {
          margin-top: 0;
        }
        .error-box {
          background: var(--color-primary);
          border: 1px solid var(--color-border);
          border-radius: 1px;
          padding: 16px;
          margin-bottom: 20px;
        }

        .preview-card, .content-card {
          border-radius: 1px;
          padding: 30px;
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
          border-bottom: 1px solid var(--color-border);
        }
        .detail-row:last-child {
          border-bottom: none;
        }
        .label {
          font-weight: 600;
          color: var(--color-text);
        }
        .value {
          color: var(--color-text);
        }
        .value.price {
          font-size: 20px;
          font-weight: bold;
          color: var(--color-text);
        }
        .link {
          color: var(--color-text);
          text-decoration: none;
          font-weight: 500;
        }
        .link:hover {
          text-decoration: underline;
        }

        .purchase-button {
          width: 100%;
          padding: 16px;
          background: var(--color-primary);
          color: var(--color-text);
          border: none;
          border-radius: 1px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          margin-top: 20px;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .purchase-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px var(--color-primary);
        }
        .purchase-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .content-box {
          background: var(--color-primary);
          border-radius: 1px;
          border: 1px solid var(--color-border);
          padding: 20px;
          margin: 20px 0;
          max-height: 500px;
          overflow-y: auto;
        }
        .content-box pre {
          margin: 0;
          white-space: pre-wrap;
          word-wrap: break-word;
          font-size: 14px;
          line-height: 1.6;
          color: var(--color-text);
        }
        .metadata {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid var(--color-border);
          color: var(--color-text);
          font-size: 14px;
        }
        .metadata p {
          margin: 8px 0;
        }
      `}</style>
    </div>
  );
}
