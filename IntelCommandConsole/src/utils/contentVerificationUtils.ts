// src/utils/contentVerificationUtils.ts
import { IPFSHTTPClient } from 'ipfs-http-client';
import { BrowserProvider } from 'ethers';
import { uploadToIPFS, retrieveFromIPFS } from './ipfsUtils';
import { signMessage, verifySignature } from './signatureUtils';
import CryptoJS from 'crypto-js';

export interface VerifiedContent {
  content: string;
  cid: string;
  signature: string;
  timestamp: string;
  author: string;
  verified: boolean;
}

export interface ContentMetadata {
  cid: string;
  contentHash: string;
  timestamp: string;
  authorAddress: string;
  signature: string;
}

/**
 * Creates and signs content with metadata
 * @param content - The content to sign and store
 * @param authorAddress - The author's Ethereum address
 * @param provider - Ethers.js provider
 * @param ipfs - IPFS client
 * @returns Content metadata with CID, signature, and verification info
 */
export const createVerifiedContent = async (
  content: string,
  authorAddress: string,
  provider: BrowserProvider,
  ipfs: IPFSHTTPClient
): Promise<ContentMetadata> => {
  try {
    // 1. Upload content to IPFS
    const cid = await uploadToIPFS(content, ipfs);
    
    // 2. Create content hash
    const contentHash = CryptoJS.SHA256(content).toString();
    
    // 3. Create metadata
    const timestamp = new Date().toISOString();
    const metadataStr = JSON.stringify({
      cid,
      contentHash,
      timestamp,
      authorAddress
    });
    
    // 4. Sign metadata
    const signature = await signMessage(metadataStr, provider);
    
    return {
      cid,
      contentHash,
      timestamp,
      authorAddress,
      signature
    };
  } catch (error) {
    console.error('Error creating verified content:', error);
    throw new Error('Failed to create verified content');
  }
};

/**
 * Verifies content against its metadata and signature
 * @param cid - Content identifier on IPFS
 * @param metadata - Content metadata with signature
 * @param ipfs - IPFS client
 * @returns Verified content with verification status
 */
export const verifyContent = async (
  cid: string,
  metadata: ContentMetadata,
  ipfs: IPFSHTTPClient
): Promise<VerifiedContent> => {
  try {
    // 1. Retrieve content from IPFS
    const content = await retrieveFromIPFS(cid, ipfs);
    
    // 2. Verify content hash
    const contentHash = CryptoJS.SHA256(content).toString();
    const hashMatches = contentHash === metadata.contentHash;
    
    // 3. Verify signature
    const metadataForSig = JSON.stringify({
      cid: metadata.cid,
      contentHash: metadata.contentHash,
      timestamp: metadata.timestamp,
      authorAddress: metadata.authorAddress
    });
    
    const signatureValid = verifySignature(
      metadataForSig,
      metadata.signature,
      metadata.authorAddress
    );
    
    // 4. Content is verified if both hash and signature are valid
    const verified = hashMatches && signatureValid;
    
    return {
      content,
      cid,
      signature: metadata.signature,
      timestamp: metadata.timestamp,
      author: metadata.authorAddress,
      verified
    };
  } catch (error) {
    console.error('Error verifying content:', error);
    throw new Error('Failed to verify content');
  }
};

/**
 * Creates a content verification message
 * @param metadata - Content metadata
 * @returns Formatted verification message
 */
export const createContentVerificationMessage = (metadata: ContentMetadata): string => {
  return `Earth Alliance Intelligence Verification

Content CID: ${metadata.cid}
Content Hash: ${metadata.contentHash}
Timestamp: ${metadata.timestamp}
Author: ${metadata.authorAddress}

The above information is certified as authentic Earth Alliance intelligence.`;
};
