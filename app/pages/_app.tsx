import { AppProps } from 'next/app';
import { useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';

// Import wallet adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
    // Use mainnet for production, devnet for testing
    const network = WalletAdapterNetwork.Mainnet;

    // Use custom RPC endpoint from env, fallback to public RPC
    // For production, use a dedicated RPC provider like Helius, QuickNode, or Alchemy
    const endpoint = useMemo(() => {
        // Check if custom RPC URL is provided
        const customRpc = process.env.NEXT_PUBLIC_SOLANA_RPC_URL;
        if (customRpc) {
            console.log('Using custom RPC endpoint:', customRpc);
            return customRpc;
        }
        // Fallback to default cluster URL (has rate limits!)
        const defaultRpc = clusterApiUrl(network);
        console.log('Using default RPC endpoint:', defaultRpc);
        return defaultRpc;
    }, [network]);

    // Configure wallets
    const wallets = useMemo(
        () => [
            new PhantomWalletAdapter(),
            new SolflareWalletAdapter(),
        ],
        []
    );

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>
                    <Component {...pageProps} />
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
}
