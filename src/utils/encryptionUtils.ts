// src/utils/encryptionUtils.ts
import CryptoJS from 'crypto-js';
import { ethers } from 'ethers';
import { BrowserProvider } from 'ethers';

/**
 * Encrypts content with a key derived from user's signature
 * @param content - Content to encrypt
 * @param provider - Ethers.js provider for signing
 * @returns Encrypted content and metadata
 */
export const encryptContent = async (
  content: string,
  provider: BrowserProvider
): Promise<{ encryptedContent: string; metadata: any }> => {
  try {
    // Get signer and address
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    
    // Create a unique message to sign for encryption
    const timestamp = Date.now();
    const message = `Generate encryption key for IPFS content at ${timestamp}`;
    
    // Sign the message to derive an encryption key
    const signature = await signer.signMessage(message);
    
    // Use the first 32 bytes of the signature as the encryption key
    const encryptionKey = signature.slice(0, 64);
    
    // Encrypt the content
    const encryptedContent = CryptoJS.AES.encrypt(content, encryptionKey).toString();
    
    // Create metadata for decryption
    const metadata = {
      encryptionVersion: 1,
      encryptionMethod: 'AES',
      timestamp,
      creator: address,
      message, // Store the message that was signed
      encryptionKeyHash: CryptoJS.SHA256(encryptionKey).toString() // Store hash of key for verification
    };
    
    return { encryptedContent, metadata };
  } catch (error) {
    console.error('Error encrypting content:', error);
    throw new Error('Failed to encrypt content');
  }
};

/**
 * Decrypts content encrypted with encryptContent
 * @param encryptedContent - Encrypted content
 * @param metadata - Encryption metadata
 * @param provider - Ethers.js provider for signing
 * @returns Decrypted content
 */
export const decryptContent = async (
  encryptedContent: string,
  metadata: any,
  provider: BrowserProvider
): Promise<string> => {
  try {
    // Get signer
    const signer = await provider.getSigner();
    
    // Sign the same message to derive the decryption key
    const signature = await signer.signMessage(metadata.message);
    
    // Use the first 32 bytes of the signature as the decryption key
    const decryptionKey = signature.slice(0, 64);
    
    // Verify the key hash
    const keyHash = CryptoJS.SHA256(decryptionKey).toString();
    if (keyHash !== metadata.encryptionKeyHash) {
      throw new Error('Invalid decryption key. You may not be the content creator.');
    }
    
    // Decrypt the content
    const decryptedBytes = CryptoJS.AES.decrypt(encryptedContent, decryptionKey);
    const decryptedContent = decryptedBytes.toString(CryptoJS.enc.Utf8);
    
    if (!decryptedContent) {
      throw new Error('Decryption failed. The content may be corrupted or the key is incorrect.');
    }
    
    return decryptedContent;
  } catch (error) {
    console.error('Error decrypting content:', error);
    throw error;
  }
};

/**
 * Creates a shared encryption key between two addresses
 * @param targetAddress - Address to share with
 * @param provider - Ethers.js provider for signing
 * @returns Shared encryption key and metadata
 */
export const createSharedEncryptionKey = async (
  targetAddress: string,
  provider: BrowserProvider
): Promise<{ sharedKey: string; metadata: any }> => {
  try {
    // Get signer and address
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    
    // Create a unique message including both addresses
    const timestamp = Date.now();
    const message = `Create shared encryption key between ${address.toLowerCase()} and ${targetAddress.toLowerCase()} at ${timestamp}`;
    
    // Sign the message
    const signature = await signer.signMessage(message);
    
    // Use the signature as the shared encryption key
    const sharedKey = signature;
    
    // Create metadata
    const metadata = {
      keyType: 'shared',
      creator: address,
      sharedWith: targetAddress,
      timestamp,
      message,
      keyHash: ethers.keccak256(ethers.toUtf8Bytes(sharedKey))
    };
    
    return { sharedKey, metadata };
  } catch (error) {
    console.error('Error creating shared encryption key:', error);
    throw new Error('Failed to create shared encryption key');
  }
};

/**
 * Encrypts content with a shared key for a specific recipient
 * @param content - Content to encrypt
 * @param sharedKey - Shared encryption key
 * @returns Encrypted content
 */
export const encryptWithSharedKey = (
  content: string,
  sharedKey: string
): string => {
  try {
    return CryptoJS.AES.encrypt(content, sharedKey).toString();
  } catch (error) {
    console.error('Error encrypting with shared key:', error);
    throw new Error('Failed to encrypt with shared key');
  }
};

/**
 * Decrypts content with a shared key
 * @param encryptedContent - Encrypted content
 * @param sharedKey - Shared encryption key
 * @returns Decrypted content
 */
export const decryptWithSharedKey = (
  encryptedContent: string,
  sharedKey: string
): string => {
  try {
    const decryptedBytes = CryptoJS.AES.decrypt(encryptedContent, sharedKey);
    const decryptedContent = decryptedBytes.toString(CryptoJS.enc.Utf8);
    
    if (!decryptedContent) {
      throw new Error('Decryption failed. The content may be corrupted or the key is incorrect.');
    }
    
    return decryptedContent;
  } catch (error) {
    console.error('Error decrypting with shared key:', error);
    throw error;
  }
};
