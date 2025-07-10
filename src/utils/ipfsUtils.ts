// src/utils/ipfsUtils.ts
import { create, IPFSHTTPClient } from 'ipfs-http-client';
import { Buffer } from 'buffer';

// Safely access environment variables
const getEnvVar = (name: string): string => {
  if (typeof process !== 'undefined' && process.env && process.env[name]) {
    return process.env[name] || '';
  }
  // Fallback for environments where process.env is not available
  return '';
};

// Environment variables for IPFS configuration
const INFURA_PROJECT_ID = getEnvVar('VITE_INFURA_PROJECT_ID');
const INFURA_API_SECRET = getEnvVar('VITE_INFURA_API_SECRET');

// Initialize IPFS client with Infura gateway
export const initIPFSClient = (): IPFSHTTPClient => {
  try {
    return create({
      host: 'ipfs.infura.io',
      port: 5001,
      protocol: 'https',
      headers: {
        authorization: 'Basic ' + Buffer.from(
          INFURA_PROJECT_ID + ':' + INFURA_API_SECRET
        ).toString('base64')
      }
    });
  } catch (error) {
    console.error('Error initializing IPFS client:', error);
    throw new Error('Failed to connect to IPFS');
  }
};

// Upload content to IPFS
export const uploadToIPFS = async (
  content: string | Buffer,
  ipfs: IPFSHTTPClient
): Promise<string> => {
  try {
    const result = await ipfs.add(content);
    return result.cid.toString();
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    throw new Error('Failed to upload content to IPFS');
  }
};

// Retrieve content from IPFS
export const retrieveFromIPFS = async (
  cid: string,
  ipfs: IPFSHTTPClient
): Promise<string> => {
  try {
    const stream = ipfs.cat(cid);
    const decoder = new TextDecoder();
    let data = '';
    
    for await (const chunk of stream) {
      data += decoder.decode(chunk);
    }
    
    return data;
  } catch (error) {
    console.error('Error retrieving from IPFS:', error);
    throw new Error('Failed to retrieve content from IPFS');
  }
};

// Pin content to ensure persistence
export const pinContent = async (
  cid: string,
  ipfs: IPFSHTTPClient
): Promise<void> => {
  try {
    await ipfs.pin.add(cid);
    console.log(`Content with CID ${cid} pinned successfully`);
  } catch (error) {
    console.error('Error pinning content:', error);
    throw new Error('Failed to pin content to IPFS');
  }
};

// Unpin content
export const unpinContent = async (
  cid: string,
  ipfs: IPFSHTTPClient
): Promise<void> => {
  try {
    await ipfs.pin.rm(cid);
    console.log(`Content with CID ${cid} unpinned successfully`);
  } catch (error) {
    console.error('Error unpinning content:', error);
    throw new Error('Failed to unpin content from IPFS');
  }
};

// Get gateway URL for content
export const getIPFSGatewayURL = (cid: string): string => {
  return `https://ipfs.io/ipfs/${cid}`;
};

// Get local gateway URL for content (useful for development)
export const getLocalIPFSGatewayURL = (cid: string): string => {
  return `http://localhost:8080/ipfs/${cid}`;
};
