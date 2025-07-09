import React, { useState } from 'react';

const Web3LoginPage: React.FC = () => {
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const connectWallet = async () => {
    try {
      // Mock wallet connection for now
      // In a real implementation, this would use Web3 providers like MetaMask
      setWalletAddress('0x742d35Cc6634C0532925a3b844Bc454e4438f44e');
      setIsConnected(true);
      setError(null);
    } catch (err) {
      setError('Failed to connect wallet');
      console.error(err);
    }
  };

  const disconnectWallet = () => {
    setWalletAddress('');
    setIsConnected(false);
  };

  return (
    <div className="web3-login-container">
      <div className="web3-login-card">
        <h2>Secure Web3 Authentication</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        {isConnected ? (
          <div className="connected-wallet">
            <h3>Connected Wallet</h3>
            <div className="wallet-address">
              {walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4)}
            </div>
            <button 
              className="disconnect-button"
              onClick={disconnectWallet}
            >
              Disconnect Wallet
            </button>
          </div>
        ) : (
          <div className="connect-options">
            <p>Connect your wallet to access enhanced features and secure data storage options.</p>
            <button 
              className="connect-wallet-button"
              onClick={connectWallet}
            >
              Connect Wallet
            </button>
            <div className="supported-wallets">
              <small>Supported wallets: MetaMask, WalletConnect, Trust Wallet</small>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Web3LoginPage;
