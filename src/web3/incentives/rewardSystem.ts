import { BrowserProvider, Contract, ethers } from 'ethers';

// Contract addresses and ABIs would be imported from configuration
// For now, we'll define placeholder values
const REWARD_CONTRACT_ADDRESS = '0x1234567890123456789012345678901234567890';
const REWARD_CONTRACT_ABI = [
  // Events
  "event RewardIssued(address indexed recipient, string indexed intelId, uint256 amount, uint256 timestamp)",
  "event RewardClaimed(address indexed recipient, uint256 amount, uint256 timestamp)",
  "event AnonymousRewardIssued(bytes32 indexed rewardId, uint256 amount, uint256 timestamp)",
  
  // Read functions
  "function getRewardBalance(address recipient) view returns (uint256)",
  "function getTotalRewardsIssued() view returns (uint256)",
  "function getAnonymousRewardDetails(bytes32 rewardId) view returns (uint256 amount, bool claimed, bytes32 claimCodeHash)",
  
  // Write functions
  "function rewardContributor(address recipient, string intelId, uint256 amount) returns (bool)",
  "function claimRewards() returns (uint256)",
  "function issueAnonymousReward(string intelId, uint256 amount, bytes32 claimCodeHash) returns (bytes32)",
  "function claimAnonymousReward(bytes32 rewardId, string claimCode) returns (uint256)"
];

const STAKING_CONTRACT_ADDRESS = '0x2345678901234567890123456789012345678901';
const STAKING_CONTRACT_ABI = [
  // Events
  "event StakeCreated(bytes32 indexed stakeId, address indexed staker, string indexed intelId, bool position, uint256 amount, uint256 expiryTime)",
  "event StakeResolved(bytes32 indexed stakeId, bool result, uint256 reward, uint256 timestamp)",
  "event StakeWithdrawn(bytes32 indexed stakeId, uint256 amount, uint256 timestamp)",
  
  // Read functions
  "function getStake(bytes32 stakeId) view returns (address staker, string intelId, bool position, uint256 amount, uint256 expiryTime, bool resolved, bool result, uint256 reward)",
  "function getStakesByStaker(address staker) view returns (bytes32[])",
  "function getStakesByIntelId(string intelId) view returns (bytes32[])",
  
  // Write functions
  "function createStake(string intelId, bool position, uint256 amount, uint256 expiryTime) returns (bytes32)",
  "function resolveStake(bytes32 stakeId, bool result) returns (bool)",
  "function withdrawStake(bytes32 stakeId) returns (uint256)"
];

// Interface for reward data
export interface RewardData {
  recipient: string;
  intelId: string;
  amount: string;
  timestamp: number;
}

// Interface for anonymous reward data
export interface AnonymousRewardData {
  rewardId: string;
  intelId: string;
  amount: string;
  claimed: boolean;
  claimCodeHash: string;
  timestamp: number;
}

// Interface for stake data
export interface StakeData {
  stakeId: string;
  staker: string;
  intelId: string;
  position: boolean; // true = accurate, false = inaccurate
  amount: string;
  expiryTime: number;
  resolved: boolean;
  result?: boolean;
  reward?: string;
}

/**
 * Reward a contributor for intelligence
 * @param contributorAddress The contributor's address
 * @param intelId The intelligence ID
 * @param rewardAmount The reward amount
 * @param provider The Ethereum provider
 * @returns The transaction hash
 */
export const rewardContribution = async (
  contributorAddress: string,
  intelId: string,
  rewardAmount: string,
  provider: BrowserProvider
): Promise<string> => {
  try {
    const signer = await provider.getSigner();
    
    // Get reward contract instance
    const rewardContract = new Contract(
      REWARD_CONTRACT_ADDRESS,
      REWARD_CONTRACT_ABI,
      signer
    );
    
    // Execute reward transaction
    const tx = await rewardContract.rewardContributor(
      contributorAddress,
      intelId,
      ethers.parseEther(rewardAmount)
    );
    
    const receipt = await tx.wait();
    
    return receipt.hash;
  } catch (error) {
    console.error('Error rewarding contribution:', error);
    throw new Error(`Failed to reward contribution: ${(error as Error).message}`);
  }
};

/**
 * Claim earned rewards
 * @param provider The Ethereum provider
 * @returns The amount claimed
 */
export const claimRewards = async (
  provider: BrowserProvider
): Promise<string> => {
  try {
    const signer = await provider.getSigner();
    
    // Get reward contract instance
    const rewardContract = new Contract(
      REWARD_CONTRACT_ADDRESS,
      REWARD_CONTRACT_ABI,
      signer
    );
    
    // Execute claim transaction
    const tx = await rewardContract.claimRewards();
    const receipt = await tx.wait();
    
    // Get claimed amount from event
    const claimedEvent = receipt.logs
      .filter((log: any) => log.fragment && log.fragment.name === 'RewardClaimed')
      .map((log: any) => {
        const parsedLog = rewardContract.interface.parseLog({
          topics: log.topics as string[],
          data: log.data
        });
        return parsedLog;
      })[0];
    
    return ethers.formatEther(claimedEvent.args.amount);
  } catch (error) {
    console.error('Error claiming rewards:', error);
    throw new Error(`Failed to claim rewards: ${(error as Error).message}`);
  }
};

/**
 * Get reward balance
 * @param address The address to check
 * @param provider The Ethereum provider
 * @returns The reward balance
 */
export const getRewardBalance = async (
  address: string,
  provider: BrowserProvider
): Promise<string> => {
  try {
    // Get reward contract instance
    const rewardContract = new Contract(
      REWARD_CONTRACT_ADDRESS,
      REWARD_CONTRACT_ABI,
      provider
    );
    
    // Get balance
    const balance = await rewardContract.getRewardBalance(address);
    
    return ethers.formatEther(balance);
  } catch (error) {
    console.error(`Error getting reward balance for ${address}:`, error);
    throw new Error(`Failed to get reward balance: ${(error as Error).message}`);
  }
};

/**
 * Issue an anonymous reward
 * @param intelId The intelligence ID
 * @param rewardAmount The reward amount
 * @param claimCode The claim code (only hash will be stored on-chain)
 * @param provider The Ethereum provider
 * @returns The reward ID
 */
export const issueAnonymousReward = async (
  intelId: string,
  rewardAmount: string,
  claimCode: string,
  provider: BrowserProvider
): Promise<string> => {
  try {
    const signer = await provider.getSigner();
    
    // Get reward contract instance
    const rewardContract = new Contract(
      REWARD_CONTRACT_ADDRESS,
      REWARD_CONTRACT_ABI,
      signer
    );
    
    // Hash the claim code
    const claimCodeHash = ethers.keccak256(ethers.toUtf8Bytes(claimCode));
    
    // Execute reward transaction
    const tx = await rewardContract.issueAnonymousReward(
      intelId,
      ethers.parseEther(rewardAmount),
      claimCodeHash
    );
    
    const receipt = await tx.wait();
    
    // Get reward ID from event
    const rewardEvent = receipt.logs
      .filter((log: any) => log.fragment && log.fragment.name === 'AnonymousRewardIssued')
      .map((log: any) => {
        const parsedLog = rewardContract.interface.parseLog({
          topics: log.topics as string[],
          data: log.data
        });
        return parsedLog;
      })[0];
    
    return rewardEvent.args.rewardId;
  } catch (error) {
    console.error('Error issuing anonymous reward:', error);
    throw new Error(`Failed to issue anonymous reward: ${(error as Error).message}`);
  }
};

/**
 * Claim an anonymous reward
 * @param rewardId The reward ID
 * @param claimCode The claim code
 * @param provider The Ethereum provider
 * @returns The amount claimed
 */
export const claimAnonymousReward = async (
  rewardId: string,
  claimCode: string,
  provider: BrowserProvider
): Promise<string> => {
  try {
    const signer = await provider.getSigner();
    
    // Get reward contract instance
    const rewardContract = new Contract(
      REWARD_CONTRACT_ADDRESS,
      REWARD_CONTRACT_ABI,
      signer
    );
    
    // Execute claim transaction
    const tx = await rewardContract.claimAnonymousReward(
      rewardId,
      claimCode
    );
    
    const receipt = await tx.wait();
    
    // Get claimed amount from event
    const claimedEvent = receipt.logs
      .filter((log: any) => log.fragment && log.fragment.name === 'RewardClaimed')
      .map((log: any) => {
        const parsedLog = rewardContract.interface.parseLog({
          topics: log.topics as string[],
          data: log.data
        });
        return parsedLog;
      })[0];
    
    return ethers.formatEther(claimedEvent.args.amount);
  } catch (error) {
    console.error(`Error claiming anonymous reward ${rewardId}:`, error);
    throw new Error(`Failed to claim anonymous reward: ${(error as Error).message}`);
  }
};

/**
 * Get anonymous reward details
 * @param rewardId The reward ID
 * @param provider The Ethereum provider
 * @returns The reward details
 */
export const getAnonymousRewardDetails = async (
  rewardId: string,
  provider: BrowserProvider
): Promise<{amount: string, claimed: boolean, claimCodeHash: string}> => {
  try {
    // Get reward contract instance
    const rewardContract = new Contract(
      REWARD_CONTRACT_ADDRESS,
      REWARD_CONTRACT_ABI,
      provider
    );
    
    // Get details
    const details = await rewardContract.getAnonymousRewardDetails(rewardId);
    
    return {
      amount: ethers.formatEther(details.amount),
      claimed: details.claimed,
      claimCodeHash: details.claimCodeHash
    };
  } catch (error) {
    console.error(`Error getting anonymous reward details for ${rewardId}:`, error);
    throw new Error(`Failed to get anonymous reward details: ${(error as Error).message}`);
  }
};

/**
 * Stake on intelligence accuracy
 * @param intelId The intelligence ID
 * @param position The position (true = accurate, false = inaccurate)
 * @param stakeAmount The stake amount
 * @param expiryTime The expiry time
 * @param provider The Ethereum provider
 * @returns The stake ID
 */
export const stakeOnIntelligence = async (
  intelId: string,
  position: boolean,
  stakeAmount: string,
  expiryTime: number,
  provider: BrowserProvider
): Promise<string> => {
  try {
    const signer = await provider.getSigner();
    
    // Get staking contract instance
    const stakingContract = new Contract(
      STAKING_CONTRACT_ADDRESS,
      STAKING_CONTRACT_ABI,
      signer
    );
    
    // Execute staking transaction
    const tx = await stakingContract.createStake(
      intelId,
      position,
      ethers.parseEther(stakeAmount),
      expiryTime
    );
    
    const receipt = await tx.wait();
    
    // Get stake ID from event
    const stakeEvent = receipt.logs
      .filter((log: any) => log.fragment && log.fragment.name === 'StakeCreated')
      .map((log: any) => {
        const parsedLog = stakingContract.interface.parseLog({
          topics: log.topics as string[],
          data: log.data
        });
        return parsedLog;
      })[0];
    
    return stakeEvent.args.stakeId;
  } catch (error) {
    console.error('Error staking on intelligence:', error);
    throw new Error(`Failed to create stake: ${(error as Error).message}`);
  }
};

/**
 * Resolve a stake
 * @param stakeId The stake ID
 * @param result The result (true = accurate, false = inaccurate)
 * @param provider The Ethereum provider
 * @returns True if successful
 */
export const resolveStake = async (
  stakeId: string,
  result: boolean,
  provider: BrowserProvider
): Promise<boolean> => {
  try {
    const signer = await provider.getSigner();
    
    // Get staking contract instance
    const stakingContract = new Contract(
      STAKING_CONTRACT_ADDRESS,
      STAKING_CONTRACT_ABI,
      signer
    );
    
    // Execute resolve transaction
    const tx = await stakingContract.resolveStake(
      stakeId,
      result
    );
    
    await tx.wait();
    
    return true;
  } catch (error) {
    console.error(`Error resolving stake ${stakeId}:`, error);
    throw new Error(`Failed to resolve stake: ${(error as Error).message}`);
  }
};

/**
 * Withdraw a stake
 * @param stakeId The stake ID
 * @param provider The Ethereum provider
 * @returns The amount withdrawn
 */
export const withdrawStake = async (
  stakeId: string,
  provider: BrowserProvider
): Promise<string> => {
  try {
    const signer = await provider.getSigner();
    
    // Get staking contract instance
    const stakingContract = new Contract(
      STAKING_CONTRACT_ADDRESS,
      STAKING_CONTRACT_ABI,
      signer
    );
    
    // Execute withdraw transaction
    const tx = await stakingContract.withdrawStake(
      stakeId
    );
    
    const receipt = await tx.wait();
    
    // Get withdrawn amount from event
    const withdrawEvent = receipt.logs
      .filter((log: any) => log.fragment && log.fragment.name === 'StakeWithdrawn')
      .map((log: any) => {
        const parsedLog = stakingContract.interface.parseLog({
          topics: log.topics as string[],
          data: log.data
        });
        return parsedLog;
      })[0];
    
    return ethers.formatEther(withdrawEvent.args.amount);
  } catch (error) {
    console.error(`Error withdrawing stake ${stakeId}:`, error);
    throw new Error(`Failed to withdraw stake: ${(error as Error).message}`);
  }
};

/**
 * Get stake details
 * @param stakeId The stake ID
 * @param provider The Ethereum provider
 * @returns The stake details
 */
export const getStakeDetails = async (
  stakeId: string,
  provider: BrowserProvider
): Promise<StakeData> => {
  try {
    // Get staking contract instance
    const stakingContract = new Contract(
      STAKING_CONTRACT_ADDRESS,
      STAKING_CONTRACT_ABI,
      provider
    );
    
    // Get stake details
    const stake = await stakingContract.getStake(stakeId);
    
    return {
      stakeId,
      staker: stake.staker,
      intelId: stake.intelId,
      position: stake.position,
      amount: ethers.formatEther(stake.amount),
      expiryTime: Number(stake.expiryTime),
      resolved: stake.resolved,
      result: stake.resolved ? stake.result : undefined,
      reward: stake.resolved ? ethers.formatEther(stake.reward) : undefined
    };
  } catch (error) {
    console.error(`Error getting stake details for ${stakeId}:`, error);
    throw new Error(`Failed to get stake details: ${(error as Error).message}`);
  }
};

/**
 * Get stakes by staker address
 * @param stakerAddress The staker's address
 * @param provider The Ethereum provider
 * @returns Array of stake data
 */
export const getStakesByStaker = async (
  stakerAddress: string,
  provider: BrowserProvider
): Promise<StakeData[]> => {
  try {
    const signer = await provider.getSigner();
    
    // Get staking contract instance
    const stakingContract = new Contract(
      STAKING_CONTRACT_ADDRESS,
      STAKING_CONTRACT_ABI,
      signer
    );
    
    // Get stake IDs for staker
    const stakeIds = await stakingContract.getStakesByStaker(stakerAddress);
    
    // Get stake data for each ID
    const stakes = await Promise.all(
      stakeIds.map(async (stakeId: string) => {
        const [
          staker,
          intelId,
          position,
          amount,
          expiryTime,
          resolved,
          result,
          reward
        ] = await stakingContract.getStake(stakeId);
        
        return {
          stakeId,
          staker,
          intelId,
          position,
          amount: amount.toString(),
          expiryTime: Number(expiryTime),
          resolved,
          result,
          reward: reward.toString()
        };
      })
    );
    
    return stakes;
  } catch (error) {
    console.error('Error fetching stakes:', error);
    
    // For development/testing, return mock data if contract call fails
    return [
      {
        stakeId: '0x1234567890123456789012345678901234567890123456789012345678901234',
        staker: stakerAddress,
        intelId: '0x123456789abcdef',
        position: true, // accurate
        amount: '1000000000000000000', // 1 ETH in wei
        expiryTime: Math.floor(Date.now() / 1000) + 604800, // 1 week from now
        resolved: false,
        result: undefined,
        reward: undefined
      },
      {
        stakeId: '0x2345678901234567890123456789012345678901234567890123456789012345',
        staker: stakerAddress,
        intelId: '0xfedcba987654321',
        position: false, // inaccurate
        amount: '500000000000000000', // 0.5 ETH in wei
        expiryTime: Math.floor(Date.now() / 1000) + 1209600, // 2 weeks from now
        resolved: true,
        result: true,
        reward: '750000000000000000' // 0.75 ETH in wei
      }
    ];
  }
};

/**
 * Get stakes by intelligence ID
 * @param intelId The intelligence ID
 * @param provider The Ethereum provider
 * @returns Array of stake IDs
 */
export const getStakesByIntelId = async (
  intelId: string,
  provider: BrowserProvider
): Promise<string[]> => {
  try {
    // Get staking contract instance
    const stakingContract = new Contract(
      STAKING_CONTRACT_ADDRESS,
      STAKING_CONTRACT_ABI,
      provider
    );
    
    // Get stakes
    const stakeIds = await stakingContract.getStakesByIntelId(intelId);
    
    return stakeIds;
  } catch (error) {
    console.error(`Error getting stakes for intelligence ${intelId}:`, error);
    throw new Error(`Failed to get stakes by intelligence ID: ${(error as Error).message}`);
  }
};

/**
 * Calculate potential rewards for a stake
 * @param stakeAmount The stake amount
 * @param odds The odds (e.g., 2.5 = 2.5x return if correct)
 * @returns The potential reward
 */
export const calculatePotentialReward = (
  stakeAmount: string,
  odds: number
): string => {
  const stakeInEther = parseFloat(stakeAmount);
  const potentialReward = stakeInEther * odds;
  
  // Return formatted to 6 decimal places
  return potentialReward.toFixed(6);
};

/**
 * Get resource pool allocation for an intelligence topic
 * @param topicId The topic ID
 * @param provider The Ethereum provider
 * @returns The allocated resources
 */
export const getResourcePoolAllocation = async (
  topicId: string,
  provider: BrowserProvider
): Promise<{allocated: string, used: string, remaining: string}> => {
  // This is a placeholder - in a real implementation, this would interact with a resource pool contract
  console.log(`Getting resource pool allocation for topic ${topicId}`);
  
  // Return mock data for now
  return {
    allocated: "1000.0",
    used: "250.0",
    remaining: "750.0"
  };
};

/**
 * Allocate resources to a resource pool
 * @param topicId The topic ID
 * @param amount The amount to allocate
 * @param provider The Ethereum provider
 * @returns True if successful
 */
export const allocateResourcePool = async (
  topicId: string,
  amount: string,
  provider: BrowserProvider
): Promise<boolean> => {
  // This is a placeholder - in a real implementation, this would interact with a resource pool contract
  console.log(`Allocating ${amount} to resource pool for topic ${topicId}`);
  
  // Return success for now
  return true;
};

/**
 * Create a stake on intelligence accuracy
 * @param intelId The intelligence ID
 * @param position The stake position (true = accurate, false = inaccurate)
 * @param amount The stake amount
 * @param expiryTime The expiry time for the stake
 * @param provider The Ethereum provider
 * @returns The stake ID
 */
export const createStake = async (
  intelId: string,
  position: boolean,
  amount: string,
  expiryTime: number,
  provider: BrowserProvider
): Promise<string> => {
  try {
    const signer = await provider.getSigner();
    
    // Get staking contract instance
    const stakingContract = new Contract(
      STAKING_CONTRACT_ADDRESS,
      STAKING_CONTRACT_ABI,
      signer
    );
    
    // Convert amount to wei
    const amountWei = ethers.parseEther(amount);
    
    // Create stake
    const tx = await stakingContract.createStake(
      intelId,
      position,
      amountWei,
      expiryTime
    );
    
    // Wait for transaction confirmation
    const receipt = await tx.wait();
    
    // Extract stake ID from event logs
    const stakeEvent = receipt.logs
      .filter((log: any) => {
        try {
          const parsed = stakingContract.interface.parseLog(log);
          return parsed && parsed.name === 'StakeCreated';
        } catch (e) {
          return false;
        }
      })
      .map((log: any) => stakingContract.interface.parseLog(log))[0];
    
    return stakeEvent.args.stakeId;
  } catch (error) {
    console.error('Error creating stake:', error);
    throw new Error('Failed to create stake');
  }
};
