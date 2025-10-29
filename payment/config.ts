import { config as dotenvConfig } from 'dotenv';

dotenvConfig();

export const config = {
  // x402 Configuration (Solana)
  facilitatorUrl: process.env.FACILITATOR_URL || 'https://facilitator.payai.network',
  network: (process.env.NETWORK || 'solana-devnet') as 'solana' | 'solana-devnet',
  treasuryWalletAddress: process.env.TREASURY_WALLET_ADDRESS,

  // USDC Token Mint Address
  // Devnet: 4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU
  // Mainnet: EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
  usdcMintAddress: process.env.USDC_MINT_ADDRESS || '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU',

  // Optional: Custom RPC URL
  solanaRpcUrl: process.env.SOLANA_RPC_URL,

  // Base URL for resource field
  baseUrl: process.env.BASE_URL || 'http://localhost:4021',

  // Database
  databaseUrl: process.env.DATABASE_URL || 'postgresql://localhost:5432/x402_payment',

  // Encryption
  encryptionKey: process.env.ENCRYPTION_KEY,
  encryptionAlgorithm: process.env.ENCRYPTION_ALGORITHM || 'aes-256-gcm',

  // Server
  port: parseInt(process.env.PORT || '4021', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  // Twitter
  twitterBotUsername: process.env.TWITTER_BOT_USERNAME || 'x402X',

  // Watermark
  watermarkSecret: process.env.WATERMARK_SECRET,
} as const;

// Validation
export function validateConfig() {
  const required = [
    'treasuryWalletAddress',
    'databaseUrl',
    'encryptionKey',
    'watermarkSecret',
  ];

  const missing = required.filter(key => !config[key as keyof typeof config]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  return true;
}

// Helper: Convert USD to USDC micro-units (6 decimals)
export function usdToMicroUsdc(usd: number): string {
  return Math.floor(usd * 1_000_000).toString();
}

// Helper: Convert USDC micro-units to USD
export function microUsdcToUsd(microUsdc: string): number {
  return parseInt(microUsdc, 10) / 1_000_000;
}
