// src/utils/signatureUtils.ts
import { ethers } from 'ethers';
import { BrowserProvider } from 'ethers';

/**
 * Signs a message using the connected wallet
 * @param message - Message to sign
 * @param provider - Ethers.js provider
 * @returns Signature string
 */
export const signMessage = async (
  message: string, 
  provider: BrowserProvider
): Promise<string> => {
  try {
    const signer = await provider.getSigner();
    const signature = await signer.signMessage(message);
    return signature;
  } catch (error) {
    console.error('Error signing message:', error);
    throw new Error('Failed to sign message');
  }
};

/**
 * Verifies a message signature
 * @param message - Original message that was signed
 * @param signature - Signature to verify
 * @param expectedAddress - Expected address of signer
 * @returns Whether the signature is valid
 */
export const verifySignature = (
  message: string,
  signature: string,
  expectedAddress: string
): boolean => {
  try {
    const recoveredAddress = ethers.verifyMessage(message, signature);
    return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();
  } catch (error) {
    console.error('Error verifying signature:', error);
    return false;
  }
};

/**
 * Creates a verification message with timestamp
 * @param content - Content to include in verification message
 * @returns Formatted verification message
 */
export const createVerificationMessage = (content: string): string => {
  const timestamp = new Date().toISOString();
  return `Earth Alliance Intelligence Verification:
  
${content}

Timestamp: ${timestamp}
  
By signing this message, I cryptographically verify that I am the author of this intelligence.`;
};
