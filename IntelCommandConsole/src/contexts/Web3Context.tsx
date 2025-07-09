import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

/**
 * Web3Context provides state management for Web3 wallet connections
 * This is currently a mock implementation that will be replaced with 
 * actual blockchain connectivity in Phase 2
 */

interface Web3ContextType {
  isConnected: boolean;
  walletAddress: string;
  networkName: string;
  networkId: number;
  balance: string;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchNetwork: (networkId: number) => void;
}

const defaultContext: Web3ContextType = {
  isConnected: false,
  walletAddress: '',
  networkName: 'Ethereum',
  networkId: 1,
  balance: '0.00',
  connectWallet: async () => {},
  disconnectWallet: () => {},
  switchNetwork: () => {},
};

const Web3Context = createContext<Web3ContextType>(defaultContext);

interface Web3ProviderProps {
  children: ReactNode;
}

// Mock wallet addresses for demonstration
const MOCK_ADDRESSES = [
  '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
  '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
  '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199'
];

// Mock networks for demonstration
const NETWORKS = [
  { id: 1, name: 'Ethereum', symbol: 'ETH' },
  { id: 137, name: 'Polygon', symbol: 'MATIC' },
  { id: 56, name: 'BSC', symbol: 'BNB' },
  { id: 42161, name: 'Arbitrum', symbol: 'ETH' }
];

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  // Load persisted state from localStorage if available
  const [isConnected, setIsConnected] = useState<boolean>(() => {
    const saved = localStorage.getItem('web3_connected');
    return saved ? JSON.parse(saved) : false;
  });
  
  const [walletAddress, setWalletAddress] = useState<string>(() => {
    const saved = localStorage.getItem('web3_address');
    return saved || '';
  });
  
  const [networkId, setNetworkId] = useState<number>(() => {
    const saved = localStorage.getItem('web3_network');
    return saved ? parseInt(saved, 10) : 1;
  });
  
  const [balance, setBalance] = useState<string>('0.00');

  // Persist state to localStorage
  useEffect(() => {
    if (isConnected) {
      localStorage.setItem('web3_connected', JSON.stringify(isConnected));
      localStorage.setItem('web3_address', walletAddress);
      localStorage.setItem('web3_network', networkId.toString());
    } else {
      localStorage.removeItem('web3_connected');
      localStorage.removeItem('web3_address');
      localStorage.removeItem('web3_network');
    }
  }, [isConnected, walletAddress, networkId]);

  // Mock wallet connection - will be replaced with actual Web3 implementation
  const connectWallet = async (): Promise<void> => {
    try {
      // Simulate connection delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Randomly select an address
      const randomIndex = Math.floor(Math.random() * MOCK_ADDRESSES.length);
      setWalletAddress(MOCK_ADDRESSES[randomIndex]);
      
      // Generate random balance
      const randomBalance = (Math.random() * 10).toFixed(4);
      setBalance(randomBalance);
      
      setIsConnected(true);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  };

  const disconnectWallet = (): void => {
    setIsConnected(false);
    setWalletAddress('');
    setBalance('0.00');
  };

  const switchNetwork = (newNetworkId: number): void => {
    setNetworkId(newNetworkId);
    
    // Update balance for different networks
    const randomBalance = (Math.random() * 10).toFixed(4);
    setBalance(randomBalance);
  };

  // Get current network name
  const getNetworkName = (): string => {
    const network = NETWORKS.find(n => n.id === networkId);
    return network ? network.name : 'Unknown';
  };

  const value = {
    isConnected,
    walletAddress,
    networkName: getNetworkName(),
    networkId,
    balance,
    connectWallet,
    disconnectWallet,
    switchNetwork
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = (): Web3ContextType => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

export default Web3Context;
