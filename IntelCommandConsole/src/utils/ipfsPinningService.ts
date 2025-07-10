// src/utils/ipfsPinningService.ts
import axios from 'axios';

// Configuration for pinning services
interface PinningServiceConfig {
  name: string;
  enabled: boolean;
  apiKey?: string;
  endpoint?: string;
}

// Pinning result
interface PinningResult {
  service: string;
  success: boolean;
  pinId?: string;
  error?: string;
}

/**
 * Get pinning service configurations from environment or local storage
 * @returns Array of configured pinning services
 */
export const getPinningServices = (): PinningServiceConfig[] => {
  try {
    // Try to get from local storage first (for user configuration)
    const storedConfig = localStorage.getItem('ipfsPinningServices');
    if (storedConfig) {
      return JSON.parse(storedConfig);
    }
    
    // Default configuration
    return [
      {
        name: 'infura',
        enabled: true,
        apiKey: process.env.VITE_INFURA_PROJECT_ID || '',
        endpoint: 'https://ipfs.infura.io:5001'
      },
      {
        name: 'pinata',
        enabled: !!process.env.VITE_PINATA_API_KEY,
        apiKey: process.env.VITE_PINATA_API_KEY || '',
        endpoint: 'https://api.pinata.cloud'
      },
      {
        name: 'web3storage',
        enabled: !!process.env.VITE_WEB3_STORAGE_TOKEN,
        apiKey: process.env.VITE_WEB3_STORAGE_TOKEN || '',
        endpoint: 'https://api.web3.storage'
      },
      {
        name: 'local',
        enabled: false,
        endpoint: 'http://localhost:5001'
      }
    ];
  } catch (error) {
    console.error('Error loading pinning services config:', error);
    return [];
  }
};

/**
 * Pin content to multiple IPFS pinning services for redundancy
 * @param cid - IPFS content identifier
 * @param name - Name for the pinned content
 * @param metadata - Optional metadata for the pinned content
 * @returns Results from each pinning service
 */
export const pinToMultipleServices = async (
  cid: string,
  name: string,
  metadata: Record<string, string> = {}
): Promise<PinningResult[]> => {
  const services = getPinningServices().filter(service => service.enabled);
  
  if (services.length === 0) {
    console.warn('No pinning services configured');
    return [];
  }
  
  const pinningPromises = services.map(service => 
    pinToService(service, cid, name, metadata)
  );
  
  return await Promise.all(pinningPromises);
};

/**
 * Pin content to a specific pinning service
 * @param service - Pinning service configuration
 * @param cid - IPFS content identifier
 * @param name - Name for the pinned content
 * @param metadata - Optional metadata for the pinned content
 * @returns Result of the pinning operation
 */
const pinToService = async (
  service: PinningServiceConfig,
  cid: string,
  name: string,
  metadata: Record<string, string>
): Promise<PinningResult> => {
  try {
    switch (service.name) {
      case 'pinata':
        return await pinToPinata(service, cid, name, metadata);
      case 'web3storage':
        return await pinToWeb3Storage(service, cid, name);
      case 'local':
        return await pinToLocalNode(service, cid);
      case 'infura':
      default:
        // For infura, we're already pinning when uploading
        return {
          service: service.name,
          success: true,
          pinId: cid
        };
    }
  } catch (error) {
    console.error(`Error pinning to ${service.name}:`, error);
    return {
      service: service.name,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Pin content to Pinata service
 * @param service - Pinata service configuration
 * @param cid - IPFS content identifier
 * @param name - Name for the pinned content
 * @param metadata - Optional metadata for the pinned content
 * @returns Result of the pinning operation
 */
const pinToPinata = async (
  service: PinningServiceConfig,
  cid: string,
  name: string,
  metadata: Record<string, string>
): Promise<PinningResult> => {
  try {
    if (!service.apiKey) {
      throw new Error('Pinata API key not configured');
    }
    
    const response = await axios.post(
      `${service.endpoint}/pinning/pinByHash`,
      {
        hashToPin: cid,
        pinataMetadata: {
          name,
          keyvalues: metadata
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${service.apiKey}`
        }
      }
    );
    
    return {
      service: 'pinata',
      success: true,
      pinId: response.data.id
    };
  } catch (error) {
    console.error('Error pinning to Pinata:', error);
    throw error;
  }
};

/**
 * Pin content to Web3.Storage service
 * @param service - Web3.Storage service configuration
 * @param cid - IPFS content identifier
 * @param name - Name for the pinned content
 * @param metadata - Optional metadata for the pinned content
 * @returns Result of the pinning operation
 */
const pinToWeb3Storage = async (
  service: PinningServiceConfig,
  cid: string,
  name: string
): Promise<PinningResult> => {
  try {
    if (!service.apiKey) {
      throw new Error('Web3.Storage token not configured');
    }
    
    const response = await axios.post(
      `${service.endpoint}/pins`,
      {
        cid,
        name
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${service.apiKey}`
        }
      }
    );
    
    return {
      service: 'web3storage',
      success: true,
      pinId: response.data.requestid
    };
  } catch (error) {
    console.error('Error pinning to Web3.Storage:', error);
    throw error;
  }
};

/**
 * Pin content to local IPFS node
 * @param service - Local node service configuration
 * @param cid - IPFS content identifier
 * @returns Result of the pinning operation
 */
const pinToLocalNode = async (
  service: PinningServiceConfig,
  cid: string
): Promise<PinningResult> => {
  try {
    await axios.post(
      `${service.endpoint}/api/v0/pin/add?arg=${cid}`
    );
    
    return {
      service: 'local',
      success: true,
      pinId: cid
    };
  } catch (error) {
    console.error('Error pinning to local node:', error);
    throw error;
  }
};

/**
 * Get pin status across all services
 * @param cid - IPFS content identifier
 * @returns Status from each pinning service
 */
export const getPinStatus = async (cid: string): Promise<PinningResult[]> => {
  const services = getPinningServices().filter(service => service.enabled);
  
  const statusPromises = services.map(service => 
    checkPinStatus(service, cid)
  );
  
  return await Promise.all(statusPromises);
};

/**
 * Check pin status on a specific service
 * @param service - Pinning service configuration
 * @param cid - IPFS content identifier
 * @returns Pin status result
 */
const checkPinStatus = async (
  service: PinningServiceConfig,
  cid: string
): Promise<PinningResult> => {
  try {
    switch (service.name) {
      case 'pinata':
        return await checkPinataPinStatus(service, cid);
      case 'web3storage':
        return await checkWeb3StoragePinStatus(service, cid);
      case 'local':
        return await checkLocalPinStatus(service, cid);
      case 'infura':
      default:
        // For infura, assume pinned if we have access
        return {
          service: service.name,
          success: true,
          pinId: cid
        };
    }
  } catch (error) {
    return {
      service: service.name,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Check pin status on Pinata
 * @param service - Pinata service configuration
 * @param cid - IPFS content identifier
 * @returns Pin status result
 */
const checkPinataPinStatus = async (
  service: PinningServiceConfig,
  cid: string
): Promise<PinningResult> => {
  try {
    if (!service.apiKey) {
      throw new Error('Pinata API key not configured');
    }
    
    const response = await axios.get(
      `${service.endpoint}/pinning/pinJobs?ipfs_pin_hash=${cid}`,
      {
        headers: {
          'Authorization': `Bearer ${service.apiKey}`
        }
      }
    );
    
    const pinned = response.data.rows.length > 0;
    
    return {
      service: 'pinata',
      success: pinned,
      pinId: pinned ? response.data.rows[0].id : undefined
    };
  } catch (error) {
    console.error('Error checking Pinata pin status:', error);
    throw error;
  }
};

/**
 * Check pin status on Web3.Storage
 * @param service - Web3.Storage service configuration
 * @param cid - IPFS content identifier
 * @returns Pin status result
 */
const checkWeb3StoragePinStatus = async (
  service: PinningServiceConfig,
  cid: string
): Promise<PinningResult> => {
  try {
    if (!service.apiKey) {
      throw new Error('Web3.Storage token not configured');
    }
    
    const response = await axios.get(
      `${service.endpoint}/pins?cid=${cid}`,
      {
        headers: {
          'Authorization': `Bearer ${service.apiKey}`
        }
      }
    );
    
    const pinned = response.data.results.length > 0;
    
    return {
      service: 'web3storage',
      success: pinned,
      pinId: pinned ? response.data.results[0].requestid : undefined
    };
  } catch (error) {
    console.error('Error checking Web3.Storage pin status:', error);
    throw error;
  }
};

/**
 * Check pin status on local IPFS node
 * @param service - Local node service configuration
 * @param cid - IPFS content identifier
 * @returns Pin status result
 */
const checkLocalPinStatus = async (
  service: PinningServiceConfig,
  cid: string
): Promise<PinningResult> => {
  try {
    const response = await axios.post(
      `${service.endpoint}/api/v0/pin/ls?arg=${cid}`
    );
    
    const pinned = response.data.Keys && response.data.Keys[cid];
    
    return {
      service: 'local',
      success: !!pinned,
      pinId: cid
    };
  } catch (error) {
    console.error('Error checking local pin status:', error);
    throw error;
  }
};

/**
 * Save pinning service configurations to local storage
 * @param services - Array of pinning service configurations
 */
export const savePinningServiceConfig = (services: PinningServiceConfig[]): void => {
  try {
    localStorage.setItem('ipfsPinningServices', JSON.stringify(services));
  } catch (error) {
    console.error('Error saving pinning services config:', error);
  }
};
