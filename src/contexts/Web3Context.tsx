import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';
import { BrowserProvider, JsonRpcSigner } from 'ethers';
import { signMessage as signMessageUtil } from '../utils/signatureUtils';
import { Web3Error, Web3ErrorType } from '../types/web3Errors';

/**
 * Web3Context provides state management for Web3 wallet connections
 * Enhanced implementation using ethers.js for real blockchain connectivity
 */

// Networks configuration with RPC endpoints
const NETWORKS = [
  { id: 1, name: 'Ethereum', symbol: 'ETH', rpcUrl: 'https://mainnet.infura.io/v3/${INFURA_KEY}' },
  { id: 137, name: 'Polygon', symbol: 'MATIC', rpcUrl: 'https://polygon-rpc.com' },
  { id: 56, name: 'BSC', symbol: 'BNB', rpcUrl: 'https://bsc-dataseed.binance.org' },
  { id: 42161, name: 'Arbitrum', symbol: 'ETH', rpcUrl: 'https://arb1.arbitrum.io/rpc' }
];

// Permission levels for access control
export enum AccessLevel {
  PUBLIC = 0,
  FIELD_OPERATIVE = 1,
  ANALYST = 2,
  COMMANDER = 3,
  DIRECTOR = 4
}

interface Web3ContextType {
  isConnected: boolean;
  walletAddress: string;
  ensName: string | null;
  networkName: string;
  networkId: number;
  balance: string;
  accessLevel: AccessLevel;
  provider: BrowserProvider | null;
  signer: JsonRpcSigner | null;
  error: Web3Error | null;
  isLoading: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchNetwork: (networkId: number) => Promise<void>;
  signMessage: (message: string) => Promise<string>;
  clearError: () => void;
}

const defaultContext: Web3ContextType = {
  isConnected: false,
  walletAddress: '',
  ensName: null,
  networkName: 'Ethereum',
  networkId: 1,
  balance: '0.00',
  accessLevel: AccessLevel.PUBLIC,
  provider: null,
  signer: null,
  error: null,
  isLoading: false,
  connectWallet: async () => {},
  disconnectWallet: () => {},
  switchNetwork: async () => {},
  signMessage: async () => '',
  clearError: () => {},
};

const Web3Context = createContext<Web3ContextType>(defaultContext);

interface Web3ProviderProps {
  children: ReactNode;
}

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  // State variables
  const [isConnected, setIsConnected] = useState<boolean>(() => {
    const saved = localStorage.getItem('web3_connected');
    return saved ? JSON.parse(saved) : false;
  });
  
  const [walletAddress, setWalletAddress] = useState<string>(() => {
    const saved = localStorage.getItem('web3_address');
    return saved || '';
  });
  
  const [ensName, setEnsName] = useState<string | null>(null);
  
  const [networkId, setNetworkId] = useState<number>(() => {
    const saved = localStorage.getItem('web3_network');
    return saved ? parseInt(saved, 10) : 1;
  });
  
  const [balance, setBalance] = useState<string>('0.00');
  const [accessLevel, setAccessLevel] = useState<AccessLevel>(AccessLevel.PUBLIC);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [error, setError] = useState<Web3Error | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

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

  // Function to resolve ENS name for an address
  const resolveEnsName = async (address: string, web3Provider: BrowserProvider) => {
    try {
      const name = await web3Provider.lookupAddress(address);
      setEnsName(name);
      return name;
    } catch (error) {
      console.error('Error resolving ENS name:', error);
      setEnsName(null);
      return null;
    }
  };

  // Function to get account balance
  const getAccountBalance = async (address: string, web3Provider: BrowserProvider) => {
    try {
      const balanceWei = await web3Provider.getBalance(address);
      const balanceEth = ethers.formatEther(balanceWei);
      setBalance(parseFloat(balanceEth).toFixed(4));
    } catch (error) {
      console.error('Error getting account balance:', error);
      setBalance('0.00');
    }
  };

  // Function to determine access level based on address
  const determineAccessLevel = (address: string): AccessLevel => {
    // Phase 1: Simple lookup from mapping (will be enhanced in future phases)
    const permissionMap: Record<string, AccessLevel> = {
      '0x71c7656ec7ab88b098defb751b7401b5f6d8976f': AccessLevel.DIRECTOR,
      '0x742d35cc6634c0532925a3b844bc454e4438f44e': AccessLevel.ANALYST,
      '0x8626f6940e2eb28930efb4cef49b2d1f2c9c1199': AccessLevel.FIELD_OPERATIVE,
    };
    
    return permissionMap[address.toLowerCase()] || AccessLevel.PUBLIC;
  };

  // Error handling utilities
  const clearError = (): void => {
    setError(null);
  };

  const handleError = (error: any): Web3Error => {
    // If it's already a Web3Error, just set it and return it
    if (error instanceof Web3Error) {
      setError(error);
      return error;
    }
    
    // Otherwise, convert from Ethereum error
    const web3Error = Web3Error.fromEthereumError(error);
    setError(web3Error);
    return web3Error;
  };

  // Real wallet connection implementation
  const connectWallet = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if Ethereum provider exists in window
      if (!window.ethereum) {
        throw new Web3Error(
          Web3ErrorType.WALLET_NOT_INSTALLED,
          'Please install MetaMask or another Web3 wallet'
        );
      }

      // Create ethers provider
      const ethersProvider = new ethers.BrowserProvider(window.ethereum);
      
      // Request account access
      const accounts = await ethersProvider.send('eth_requestAccounts', []);
      
      if (!accounts || !Array.isArray(accounts) || accounts.length === 0) {
        throw new Web3Error(
          Web3ErrorType.WALLET_NOT_CONNECTED,
          'No accounts available'
        );
      }
      
      const address = accounts[0];
      setWalletAddress(address);
      
      // Get network
      const network = await ethersProvider.getNetwork();
      const chainId = Number(network.chainId);
      setNetworkId(chainId);
      
      // Get signer
      const ethersSigner = await ethersProvider.getSigner();
      setSigner(ethersSigner);
      
      // Get balance
      await getAccountBalance(address, ethersProvider);        // Resolve ENS name
        await resolveEnsName(address, ethersProvider);
        
        // Determine access level
        const level = determineAccessLevel(address);
        setAccessLevel(level);
        
        // Set provider and connected state
        setProvider(ethersProvider);
        setIsConnected(true);
        
        // Set up event listeners
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', handleChainChanged);
        window.ethereum.on('disconnect', handleDisconnect);
        
    } catch (error: any) {
      const web3Error = handleError(error);
      throw web3Error;
    } finally {
      setIsLoading(false);
    }
  };

  // Handle account change
  const handleAccountsChanged = async (accounts: string[]) => {
    if (accounts.length === 0) {
      // User disconnected their wallet
      disconnectWallet();
    } else if (accounts[0] !== walletAddress) {
      // User switched accounts
      setWalletAddress(accounts[0]);
      
      if (provider) {
        await getAccountBalance(accounts[0], provider);
        await resolveEnsName(accounts[0], provider);
        const level = determineAccessLevel(accounts[0]);
        setAccessLevel(level);
      }
    }
  };

  // Handle network change
  const handleChainChanged = (_chainIdHex: string) => {
    // Need to reload the page as recommended by MetaMask
    window.location.reload();
  };

  // Handle disconnect
  const handleDisconnect = () => {
    disconnectWallet();
  };

  const disconnectWallet = (): void => {
    // Remove event listeners
    if (window.ethereum) {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
      window.ethereum.removeListener('disconnect', handleDisconnect);
    }
    
    // Reset state
    setIsConnected(false);
    setWalletAddress('');
    setBalance('0.00');
    setEnsName(null);
    setProvider(null);
    setSigner(null);
    setAccessLevel(AccessLevel.PUBLIC);
  };

  // Function to switch networks
  const switchNetwork = async (newNetworkId: number): Promise<void> => {
    if (!window.ethereum) {
      alert('No Ethereum provider detected');
      return;
    }
    
    const network = NETWORKS.find(n => n.id === newNetworkId);
    if (!network) {
      alert('Invalid network selection');
      return;
    }
    
    try {
      // Try to switch to the network
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${newNetworkId.toString(16)}` }],
      });
      
      // Network switch successful, will trigger chainChanged event
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${newNetworkId.toString(16)}`,
                chainName: network.name,
                nativeCurrency: {
                  name: network.symbol,
                  symbol: network.symbol,
                  decimals: 18
                },
                rpcUrls: [network.rpcUrl],
              },
            ],
          });
          
          // Network has been added, now try to switch again
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${newNetworkId.toString(16)}` }],
          });
          
        } catch (addError) {
          console.error('Error adding network:', addError);
        }
      } else {
        console.error('Error switching network:', switchError);
      }
    }
  };

  // Function to sign messages
  const signMessage = async (message: string): Promise<string> => {
    if (!signer) {
      throw new Web3Error(
        Web3ErrorType.WALLET_NOT_CONNECTED,
        'No wallet connected'
      );
    }
    
    try {
      return await signMessageUtil(message, provider!);
    } catch (error) {
      console.error('Error signing message:', error);
      throw handleError(error);
    }
  };

  // Get current network name
  const getNetworkName = (): string => {
    const network = NETWORKS.find(n => n.id === networkId);
    return network ? network.name : 'Unknown';
  };

  const value = {
    isConnected,
    walletAddress,
    ensName,
    networkName: getNetworkName(),
    networkId,
    balance,
    accessLevel,
    provider,
    signer,
    error,
    isLoading,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    signMessage,
    clearError
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
