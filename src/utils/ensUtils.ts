// src/utils/ensUtils.ts
import { BrowserProvider } from 'ethers';

/**
 * Resolves an Ethereum address to an ENS name
 * @param address - Ethereum address to resolve
 * @param provider - Ethers.js provider
 * @returns ENS name or null if not found
 */
export const resolveEnsName = async (
  address: string, 
  provider: BrowserProvider
): Promise<string | null> => {
  try {
    const name = await provider.lookupAddress(address);
    return name;
  } catch (error) {
    console.error('Error resolving ENS name:', error);
    return null;
  }
};

/**
 * Resolves an ENS name to an Ethereum address
 * @param ensName - ENS name to resolve
 * @param provider - Ethers.js provider
 * @returns Ethereum address or null if not found
 */
export const resolveAddress = async (
  ensName: string, 
  provider: BrowserProvider
): Promise<string | null> => {
  try {
    const address = await provider.resolveName(ensName);
    return address;
  } catch (error) {
    console.error('Error resolving address from ENS:', error);
    return null;
  }
};

/**
 * Fetches ENS avatar for an address or ENS name
 * @param addressOrName - Ethereum address or ENS name
 * @param provider - Ethers.js provider
 * @returns Avatar URL or null if not found
 */
export const getEnsAvatar = async (
  _addressOrName: string,
  _provider: BrowserProvider
): Promise<string | null> => {
  try {
    // TODO: Implement ENS avatar resolution in future update
    // This requires additional libraries or custom resolver
    return null;
  } catch (error) {
    console.error('Error getting ENS avatar:', error);
    return null;
  }
};
