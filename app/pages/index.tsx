import Link from 'next/link';
import { useState } from 'react';
import heroImage from '../assets/1.png';

export default function Home() {
  const [expandedProduct, setExpandedProduct] = useState<string | null>('x-publish');

  const toggleProduct = (productName: string) => {
    setExpandedProduct(expandedProduct === productName ? null : productName);
  };

  return (
    <div className="container">
      <main>
        <header className="header">
          <h3 className="title-left">Subless</h3>
          <p className="subtitle">General-purpose content monetization protocol built on top of x402 payments</p>
        </header>

        {/* Hero Image */}
        <div className="hero-visual">
          <img src={heroImage.src} alt="Subless Platform" className="hero-image" />
        </div>

        <div className="main-content">
          <div className="features">
            <div className="feature">
              <h3>#01 x402 Payments</h3>
              <p>Pay for knowledge using USDC (on Solana) — one-time payments for any content you're interested in, no subscriptions, no credit cards.</p>
            </div>
            <div className="feature">
              <h3>#02 Encrypted & Traceable</h3>
              <p>All content is encrypted and securely stored, while every payment remains fully traceable on-chain.</p>
            </div>
            <div className="feature">
              <h3>#03 Agent Economy</h3>
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
                      X users can create resources on Subless, post locked content directly in tweet, price each piece of content flexibly, and withdraw their earnings (in USDC) to their wallet anytime.
                    </p>
                    <Link href="/create" className="product-link">
                      Create your first resource →
                    </Link>
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
        </div>
      </main>

      <footer>
        <div className="footer-content">
          <div className="footer-stats">
            <span>Resources:108</span>
            <span className="separator">｜</span>
            <span>Payments:251</span>
            <span className="separator">｜</span>
            <span>Earned:$35,210</span>
          </div>
          <div className="footer-links">
            <a href="/docs" className="footer-link">
              Docs
            </a>
            <a href="" target="_blank" rel="noopener noreferrer" className="footer-link">
              GitHub
            </a>
            <a href="https://twitter.com/sublessnetwork" target="_blank" rel="noopener noreferrer" className="footer-link">
              X (Twitter)
            </a>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .container {
          margin: 0 auto;
          padding: 10px 10px 0;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        main {
          text-align: center;
          flex: 1;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0px;
          gap: 20px;
          font-family: var(--font-heading);
          border-bottom: 0.1px solid var(--color-shadow);
        }

        /* Hero Visual with Image */
        .hero-visual {
          position: relative;
          margin: 0px 100px 40px;
          min-height: 400px;
          border-right: 1px solid var(--color-shadow);
          border-left: 1px solid var(--color-shadow);
          border-bottom: 1px solid var(--color-shadow);
          overflow: hidden;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding-bottom: 1px;
        }

        .hero-image {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          z-index: 1;
        }

        /* 响应式 */
        @media (max-width: 768px) {
          .hero-visual {
            margin: 0 20px 30px;
            min-height: 300px;
          }

          .hero-text {
            padding: 30px 20px;
            max-width: 90%;
          }

          .hero-text h2 {
            font-size: 2rem;
          }

          .hero-text p {
            font-size: 1.2rem;
          }
        }

        .title-left {
          flex: 0 0 auto;
          text-align: left;
          margin: 0;
        }

        .subtitle {
          flex: 0 0 auto;
          text-align: right;
          margin: 0;
          font-style: italic;
        }

        .main-content {
          display: flex;
          gap: 30px;
          margin-left: 100px;
          margin-right: 100px;
          margin-top: 40px;
          margin-bottom: 60px;
          align-items: flex-start;
        }

        .features {
          flex: 7;
          display: flex;
          flex-direction: row;
        }
        .feature {
          flex: 1;
          padding: 20px;
          border-radius: 1px;
          border: 0.1px solid var(--color-shadow);
          text-align: left;
        }
        .feature h3 {
          margin: 0 0 10px 0;
        }
        .feature p {
          margin: 0;
        }

        .products-section {
          flex: 3;
          margin: 0;
          padding: 0;
        }
        .product-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .product-item {
          border: 0.1px solid var(--color-shadow);
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
        }
        .toggle-icon {
          font-family: var(--font-heading);
          font-size: 1.5rem;
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
        .product-content :global(a.product-link) {
          display: inline-block;
          color: var(--color-text) !important;
          text-decoration: underline !important;
          text-underline-offset: 3px;
          font-weight: bold;
          transition: opacity 0.2s;
        }
        .product-content :global(a.product-link:hover) {
          opacity: 0.7;
        }

        footer {
          margin-top: auto;
          padding: 20px 0;
          border-top: 0.1px solid var(--color-shadow);
        }
        .footer-content {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
          position: relative;
        }
        .footer-stats {
          position: absolute;
          left: 0;
          display: flex;
          gap: 2px;
          font-family: var(--font-body);
          font-size: 12px;
          align-items: center;
        }
        .footer-stats span {
          color: var(--color-text);
        }
        .footer-stats .separator {
          opacity: 0.5;
        }
        .footer-links {
          display: flex;
          justify-content: center;
          align-items: center;
          flex-wrap: wrap;
        }
        .footer-link {
          font-family: var(--font-heading);
          color: var(--color-text);
          text-decoration: none;
          padding: 6px 12px;
          border: 1px solid var(--color-shadow);
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
