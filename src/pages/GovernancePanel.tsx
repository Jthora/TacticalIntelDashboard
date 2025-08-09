import { BrowserProvider } from 'ethers';
import React, { useEffect,useState } from 'react';

import ProposalCreationPanel from '../components/governance/ProposalCreationPanel';

const GovernancePanel: React.FC = () => {
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Connect to MetaMask or other web3 provider
  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        // Request account access
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        // Create a provider
        const provider = new BrowserProvider(window.ethereum);
        setProvider(provider);
        
        // Get connected account
        const signer = await provider.getSigner();
        const account = await signer.getAddress();
        setAccount(account);
        setIsConnected(true);
        setConnectionError(null);
      } else {
        setConnectionError('MetaMask or compatible Web3 wallet is not installed');
      }
    } catch (error) {
      console.error('Error connecting to wallet:', error);
      setConnectionError(`Failed to connect wallet: ${(error as Error).message}`);
      setIsConnected(false);
    }
  };

  // Handle account changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          // Disconnected
          setAccount(null);
          setIsConnected(false);
        } else if (accounts[0] !== account) {
          // Account changed
          setAccount(accounts[0]);
          setIsConnected(true);
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      
      return () => {
        if (window.ethereum) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        }
      };
    }
  }, [account]);

  return (
    <div className="governance-container">
      <div className="governance-header">
        <h1>Earth Alliance Governance</h1>
        
        {!isConnected ? (
          <div>
            <button 
              className="connect-wallet-btn" 
              onClick={connectWallet}
            >
              Connect Wallet
            </button>
            
            {connectionError && (
              <div className="alert alert-danger mt-3">
                {connectionError}
              </div>
            )}
          </div>
        ) : (
          <div className="account-info">
            <span>Connected: {account?.substring(0, 6)}...{account?.substring(account.length - 4)}</span>
          </div>
        )}
      </div>
      
      <div className="governance-content">
        <ProposalCreationPanel provider={provider} />
        
        {/* Additional governance panels will be added here */}
      </div>
    </div>
  );
};

export default GovernancePanel;
