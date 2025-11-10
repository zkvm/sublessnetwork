import Link from 'next/link';
import { useState } from 'react';

export default function Home() {
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);

  const toggleProduct = (productName: string) => {
    setExpandedProduct(expandedProduct === productName ? null : productName);
  };

  return (
    <div className="container">
      <main>
        <h1>Subless Network</h1>
        <p className="subtitle">General-purpose content monetization protocol built on top of x402 payments</p>

        <div className="features">
          <div className="feature">
            <h3>x402 Payments</h3>
            <p>Pay for knowledge using USDC (on Solana) — one-time payments for any content you're interested in, no subscriptions, no credit cards.</p>
          </div>
          <div className="feature">
            <h3>Encrypted & Traceable</h3>
            <p>All content is encrypted and securely stored, while every payment remains fully traceable on-chain.</p>
          </div>
          <div className="feature">
            <h3>Agent Economy</h3>
            <p>Runs on massive, high-quality UGC, fueling reliable and powerful agent-to-agent services across the agent ecosystem.</p>
          </div>
        </div>

        <section className="products-section">
          <div className="product-list">
            <div className="product-item">
              <button
                className="product-header"
                onClick={() => toggleProduct('x-publish')}
              >
                <h3>x402X</h3>
                <span className="toggle-icon">{expandedProduct === 'x-publish' ? '−' : '+'}</span>
              </button>
              {expandedProduct === 'x-publish' && (
                <div className="product-content">
                  <p>
                    creator can post locked content directly in tweet form, price each piece of content flexibly, and withdraw their earnings (in USDC) to their wallet anytime.
                  </p>
                </div>
              )}
            </div>

            <div className="product-item">
              <button
                className="product-header"
                onClick={() => toggleProduct('subless-agent')}
              >
                <h3>Subless Agent</h3>
                <span className="toggle-icon">{expandedProduct === 'subless-agent' ? '−' : '+'}</span>
              </button>
              {expandedProduct === 'subless-agent' && (
                <div className="product-content">
                  <p>
                    AI-powered agent that operates on the Subless Network, providing knowledge services in a pay-per-use model.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="footer-links">
          <a href="/docs" className="footer-link">
            Doc
          </a>
          <a href="" target="_blank" rel="noopener noreferrer" className="footer-link">
            GitHub
          </a>
          <a href="https://twitter.com/sublessnetwork" target="_blank" rel="noopener noreferrer" className="footer-link">
            X (Twitter)
          </a>
        </div>
      </footer>

      <style jsx>{`
        .container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 40px 20px 0;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        main {
          text-align: center;
          flex: 1;
        }

        .subtitle {
          font-size: 18px;
          margin-bottom: 60px;
        }

        .features {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 30px;
          margin-top: 60px;
        }

        .feature {
          padding: 30px;
          border-radius: 1px;
          border: 1px solid var(--color-border);
        }

        .feature h3 {
          margin: 0 0 10px 0;
        }

        .feature p {
          margin: 0;
        }

        .products-section {
          margin-top: 40px;
          padding-top: 30px;
          margin-bottom: 30px;
        }

        .product-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-width: 800px;
          margin: 0 auto;
        }

        .product-item {
          border: 1px solid var(--color-text);
          overflow: hidden;
          background: var(--color-background);
        }

        .product-header {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 15px;
          background: none;
          border: none;
          cursor: pointer;
          text-align: left;
          transition: background 0.2s ease;
        }

        .product-header:hover {
          background: var(--color-primary);
        }

        .product-header h3 {
          margin: 0;
          font-size: 1.8rem;
        }

        .toggle-icon {
          font-family: var(--font-heading);
          font-size: 2rem;
          color: var(--color-text);
          transition: transform 0.2s ease;
        }

        .product-content {
          padding: 0 30px 30px 30px;
          text-align: left;
          animation: slideDown 0.3s ease;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .product-content p {
          margin-bottom: 20px;
          line-height: 1.8;
        }

        footer {
          margin-top: auto;
          padding: 40px 0;
          border-top: 1px solid var(--color-border);
        }

        .footer-links {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .footer-link {
          font-family: var(--font-heading);
          font-size: 20px;
          color: var(--color-text);
          text-decoration: none;
          padding: 6px 12px;
          border: 1px solid var(--color-text);
          background: var(--color-background);
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .footer-link:hover {
          background: var(--color-primary);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px var(--color-shadow);
        }
      `}</style>
    </div>
  );
}
