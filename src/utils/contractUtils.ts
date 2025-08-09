// src/utils/contractUtils.ts
import { BaseContract,BrowserProvider, ethers } from 'ethers';

// Interface for feed source validation contract
const FEED_SOURCE_VALIDATOR_ABI = [
  "function validateSource(address source) view returns (bool)",
  "function registerSource(address source, string calldata metadata) external",
  "function getSourceMetadata(address source) view returns (string memory)",
  "function getVerifiedSources() view returns (address[])",
  "function isVerified(address source) view returns (bool)"
];

// Smart contract addresses for different networks
const CONTRACT_ADDRESSES: { [chainId: number]: string } = {
  1: "0x0000000000000000000000000000000000000000", // Mainnet - placeholder
  5: "0x0000000000000000000000000000000000000000", // Goerli - placeholder
  137: "0x0000000000000000000000000000000000000000", // Polygon - placeholder
  80001: "0x0000000000000000000000000000000000000000" // Mumbai - placeholder
};

// Interface representing the FeedValidator contract
interface FeedValidatorContract extends BaseContract {
  validateSource(source: string): Promise<boolean>;
  registerSource(source: string, metadata: string): Promise<any>;
  getSourceMetadata(source: string): Promise<string>;
  getVerifiedSources(): Promise<string[]>;
  isVerified(source: string): Promise<boolean>;
}

/**
 * Get a contract instance for the Feed Source Validator
 * @param provider - Ethers.js provider
 * @param chainId - Chain ID of the current network
 * @returns Contract instance or null if not available on current network
 */
export const getFeedValidatorContract = (
  provider: BrowserProvider,
  chainId: number
): FeedValidatorContract | null => {
  const contractAddress = CONTRACT_ADDRESSES[chainId];
  
  if (!contractAddress || contractAddress === "0x0000000000000000000000000000000000000000") {
    console.warn(`Feed validator contract not deployed on chain ${chainId}`);
    return null;
  }
  
  return new ethers.Contract(
    contractAddress, 
    FEED_SOURCE_VALIDATOR_ABI, 
    provider
  ) as unknown as FeedValidatorContract;
};

/**
 * Check if a feed source is verified on-chain
 * @param sourceAddress - Ethereum address of the source
 * @param provider - Ethers.js provider
 * @param chainId - Chain ID of the current network
 * @returns Whether the source is verified
 */
export const isSourceVerified = async (
  sourceAddress: string,
  provider: BrowserProvider,
  chainId: number
): Promise<boolean> => {
  try {
    const contract = getFeedValidatorContract(provider, chainId);
    
    if (!contract) {
      console.warn('Feed validator contract not available on current network');
      return false;
    }
    
    return await contract.isVerified(sourceAddress);
  } catch (error) {
    console.error('Error checking source verification:', error);
    return false;
  }
};

/**
 * Get metadata for a verified source
 * @param sourceAddress - Ethereum address of the source
 * @param provider - Ethers.js provider
 * @param chainId - Chain ID of the current network
 * @returns Source metadata or empty string if not verified
 */
export const getSourceMetadata = async (
  sourceAddress: string,
  provider: BrowserProvider,
  chainId: number
): Promise<string> => {
  try {
    const contract = getFeedValidatorContract(provider, chainId);
    
    if (!contract) {
      console.warn('Feed validator contract not available on current network');
      return '';
    }
    
    return await contract.getSourceMetadata(sourceAddress);
  } catch (error) {
    console.error('Error getting source metadata:', error);
    return '';
  }
};

/**
 * Register a new feed source on-chain (requires transaction)
 * @param sourceAddress - Ethereum address of the source
 * @param metadata - JSON metadata about the source
 * @param provider - Ethers.js provider
 * @param chainId - Chain ID of the current network
 * @returns Transaction hash or empty string if failed
 */
export const registerFeedSource = async (
  sourceAddress: string,
  metadata: string,
  provider: BrowserProvider,
  chainId: number
): Promise<string> => {
  try {
    const contract = getFeedValidatorContract(provider, chainId);
    
    if (!contract) {
      throw new Error('Feed validator contract not available on current network');
    }
    
    const signer = await provider.getSigner();
    const contractWithSigner = contract.connect(signer) as FeedValidatorContract;
    
    const tx = await contractWithSigner.registerSource(sourceAddress, metadata);
    await tx.wait();
    
    return tx.hash;
  } catch (error) {
    console.error('Error registering feed source:', error);
    throw error;
  }
};

/**
 * Get all verified feed sources
 * @param provider - Ethers.js provider
 * @param chainId - Chain ID of the current network
 * @returns Array of verified source addresses
 */
export const getVerifiedSources = async (
  provider: BrowserProvider,
  chainId: number
): Promise<string[]> => {
  try {
    const contract = getFeedValidatorContract(provider, chainId);
    
    if (!contract) {
      console.warn('Feed validator contract not available on current network');
      return [];
    }
    
    return await contract.getVerifiedSources();
  } catch (error) {
    console.error('Error getting verified sources:', error);
    return [];
  }
};
