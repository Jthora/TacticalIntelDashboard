// src/contexts/IPFSContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { IPFSHTTPClient } from 'ipfs-http-client';
import { initIPFSClient, uploadToIPFS, retrieveFromIPFS, pinContent } from '../utils/ipfsUtils';
import { useWeb3 } from './Web3Context';

interface IPFSContextType {
  ipfs: IPFSHTTPClient | null;
  isConnected: boolean;
  uploadContent: (content: string | ArrayBuffer) => Promise<string>;
  getContent: (cid: string) => Promise<string>;
  pinContent: (cid: string) => Promise<void>;
  ipfsError: string | null;
}

const defaultContext: IPFSContextType = {
  ipfs: null,
  isConnected: false,
  uploadContent: async () => '',
  getContent: async () => '',
  pinContent: async () => {},
  ipfsError: null
};

const IPFSContext = createContext<IPFSContextType>(defaultContext);

interface IPFSProviderProps {
  children: ReactNode;
}

export const IPFSProvider: React.FC<IPFSProviderProps> = ({ children }) => {
  const { isConnected: isWeb3Connected } = useWeb3();
  const [ipfs, setIPFS] = useState<IPFSHTTPClient | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [ipfsError, setIPFSError] = useState<string | null>(null);

  // Initialize IPFS client when the component mounts
  useEffect(() => {
    const connectToIPFS = async () => {
      try {
        if (!isWeb3Connected) {
          setIPFSError('Web3 wallet must be connected to use IPFS features');
          return;
        }

        setIPFSError(null);
        const client = initIPFSClient();
        setIPFS(client);
        setIsConnected(true);
      } catch (error) {
        console.error('Failed to connect to IPFS:', error);
        setIPFSError('Failed to connect to IPFS network');
        setIsConnected(false);
      }
    };

    connectToIPFS();

    return () => {
      // Cleanup if needed
      setIPFS(null);
      setIsConnected(false);
    };
  }, [isWeb3Connected]);

  // Upload content to IPFS
  const uploadContent = async (content: string | ArrayBuffer): Promise<string> => {
    if (!ipfs) {
      throw new Error('IPFS client not initialized');
    }

    try {
      const contentBuffer = content instanceof ArrayBuffer 
        ? Buffer.from(content)
        : Buffer.from(content);
      
      return await uploadToIPFS(contentBuffer, ipfs);
    } catch (error) {
      console.error('Error uploading to IPFS:', error);
      throw new Error('Failed to upload content to IPFS');
    }
  };

  // Get content from IPFS
  const getContent = async (cid: string): Promise<string> => {
    if (!ipfs) {
      throw new Error('IPFS client not initialized');
    }

    try {
      return await retrieveFromIPFS(cid, ipfs);
    } catch (error) {
      console.error('Error retrieving from IPFS:', error);
      throw new Error('Failed to retrieve content from IPFS');
    }
  };

  // Pin content on IPFS
  const pinIPFSContent = async (cid: string): Promise<void> => {
    if (!ipfs) {
      throw new Error('IPFS client not initialized');
    }

    try {
      await pinContent(cid, ipfs);
    } catch (error) {
      console.error('Error pinning content:', error);
      throw new Error('Failed to pin content to IPFS');
    }
  };

  const value = {
    ipfs,
    isConnected,
    uploadContent,
    getContent,
    pinContent: pinIPFSContent,
    ipfsError
  };

  return (
    <IPFSContext.Provider value={value}>
      {children}
    </IPFSContext.Provider>
  );
};

export const useIPFS = (): IPFSContextType => {
  const context = useContext(IPFSContext);
  if (context === undefined) {
    throw new Error('useIPFS must be used within an IPFSProvider');
  }
  return context;
};

export default IPFSContext;
