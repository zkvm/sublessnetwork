import Link from 'next/link';

export default function Home() {
  return (
    <div className="container">
      <main>
        <h1>X402X Content Marketplace</h1>
        <p className="subtitle">Decentralized Knowledge Sharing with x402 Payment Protocol</p>

        <div className="card">
          <h2>🧪 Test Resource</h2>
          <p>Try the payment flow with our test resource:</p>
          <Link href="/resources/19b195d0-7836-4dd6-b31d-90a58ec100c4">
            <button className="button">View Test Resource →</button>
          </Link>
        </div>

        <div className="features">
          <div className="feature">
            <div className="icon">🔒</div>
            <h3>Encrypted Content</h3>
            <p>All content is encrypted and stored securely</p>
          </div>
          <div className="feature">
            <div className="icon">💰</div>
            <h3>USDC Payments</h3>
            <p>Pay with USDC on Solana blockchain</p>
          </div>
          <div className="feature">
            <div className="icon">⚡</div>
            <h3>x402 Protocol</h3>
            <p>Seamless payment experience</p>
          </div>
        </div>
      </main>

      <style jsx>{`
        .container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 40px 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        main {
          text-align: center;
        }

        h1 {
          font-size: 48px;
          margin-bottom: 10px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .subtitle {
          font-size: 18px;
          color: #666;
          margin-bottom: 60px;
        }

        .card {
          background: white;
          border-radius: 12px;
          padding: 40px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          margin-bottom: 60px;
        }

        .card h2 {
          margin-top: 0;
          color: #333;
        }

        .card p {
          color: #666;
          margin-bottom: 20px;
        }

        .button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 16px 32px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .features {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 30px;
          margin-top: 60px;
        }

        .feature {
          padding: 30px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .icon {
          font-size: 48px;
          margin-bottom: 20px;
        }

        .feature h3 {
          margin: 0 0 10px 0;
          color: #333;
        }

        .feature p {
          margin: 0;
          color: #666;
        }
      `}</style>
    </div>
  );
}
