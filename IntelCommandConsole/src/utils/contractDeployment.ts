// src/utils/contractDeployment.ts
import { ethers, BrowserProvider } from 'ethers';
import FeedSourceValidatorABI from '../contracts/abi/FeedSourceValidator.json';
import FeedSourceValidatorBytecode from '../contracts/bytecode/FeedSourceValidator.json';

export interface DeploymentResult {
  success: boolean;
  contractAddress?: string;
  transactionHash?: string;
  error?: string;
}

/**
 * Deploy the FeedSourceValidator contract
 * @param provider - Ethers.js provider
 * @returns Deployment result with contract address and transaction hash
 */
export const deployFeedSourceValidator = async (
  provider: BrowserProvider
): Promise<DeploymentResult> => {
  try {
    const signer = await provider.getSigner();
    
    // Create contract factory
    const factory = new ethers.ContractFactory(
      FeedSourceValidatorABI,
      FeedSourceValidatorBytecode.bytecode,
      signer
    );
    
    // Deploy contract
    const contract = await factory.deploy();
    await contract.deploymentTransaction()?.wait();
    
    return {
      success: true,
      contractAddress: await contract.getAddress(),
      transactionHash: contract.deploymentTransaction()?.hash
    };
  } catch (error) {
    console.error('Error deploying FeedSourceValidator contract:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Register contract address in local configuration
 * @param contractAddress - Address of the deployed contract
 * @param chainId - ID of the blockchain network
 */
export const registerContractAddress = (
  contractAddress: string,
  chainId: number
): void => {
  try {
    // Get existing contract addresses
    const contractAddressesStr = localStorage.getItem('contractAddresses') || '{}';
    const contractAddresses = JSON.parse(contractAddressesStr);
    
    // Update with new address
    contractAddresses[chainId.toString()] = contractAddress;
    
    // Save to local storage
    localStorage.setItem('contractAddresses', JSON.stringify(contractAddresses));
    
    console.log(`Contract address registered for chain ID ${chainId}: ${contractAddress}`);
  } catch (error) {
    console.error('Error registering contract address:', error);
  }
};

/**
 * Get contract address for a specific chain
 * @param chainId - ID of the blockchain network
 * @returns Contract address or null if not found
 */
export const getContractAddress = (chainId: number): string | null => {
  try {
    const contractAddressesStr = localStorage.getItem('contractAddresses') || '{}';
    const contractAddresses = JSON.parse(contractAddressesStr);
    
    return contractAddresses[chainId.toString()] || null;
  } catch (error) {
    console.error('Error getting contract address:', error);
    return null;
  }
};
