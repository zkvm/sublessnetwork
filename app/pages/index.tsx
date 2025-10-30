import Link from 'next/link';

export default function Home() {
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
            <h3>Twitter Native</h3>
            <p>Users can publish locked content directly on Twitter, no need to leave the platform.</p>
          </div>
          <div className="feature">
            <h3>Encrypted & Traceable</h3>
            <p>All content is encrypted and securely stored, while every payment remains fully traceable on-chain.</p>
          </div>
        </div>
      </main>

      <footer>
        <div className="footer-links">
          <a href="/docs" target="_blank" rel="noopener noreferrer" className="footer-link">
            Doc
          </a>
          <a href="https://github.com/yourusername/x402X" target="_blank" rel="noopener noreferrer" className="footer-link">
            GitHub
          </a>
          <a href="https://twitter.com/youraccount" target="_blank" rel="noopener noreferrer" className="footer-link">
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
