import { BrowserProvider, Contract, ethers } from 'ethers';

// Contract addresses and ABIs would be imported from configuration
// For now, we'll define placeholder values
const MISSION_FACTORY_ADDRESS = '0x1234567890123456789012345678901234567890';
const MISSION_FACTORY_ABI = [
  // Events
  "event MissionCreated(address indexed creator, address indexed missionAddress, string name, uint256 deadline)",
  
  // Read functions
  "function getMissions() view returns (address[])",
  
  // Write functions
  "function createMission(string name, string objective, string successCriteria, uint256 deadline, address[] participants, uint256[] amounts, address[] recipients) returns (address)"
];

const MISSION_ABI = [
  // Events
  "event EvidenceSubmitted(address indexed submitter, string evidenceHash, uint8 evidenceType, uint256 timestamp)",
  "event MissionStatusChanged(uint8 status, uint256 timestamp)",
  "event ResourceAllocated(address indexed recipient, uint256 amount, uint256 timestamp)",
  
  // Read functions
  "function name() view returns (string)",
  "function objective() view returns (string)",
  "function successCriteria() view returns (string)",
  "function deadline() view returns (uint256)",
  "function status() view returns (uint8)",
  "function creator() view returns (address)",
  "function participants() view returns (address[])",
  "function evidenceCount() view returns (uint256)",
  "function getEvidence(uint256 index) view returns (address submitter, string evidenceHash, uint8 evidenceType, string metadata, uint256 timestamp)",
  "function isComplete() view returns (bool)",
  "function getResourceAllocation(address recipient) view returns (uint256 allocated, uint256 claimed)",
  
  // Write functions
  "function submitEvidence(string evidenceHash, uint8 evidenceType, string metadata) returns (bool)",
  "function verifyEvidence(uint256 evidenceIndex, bool isValid) returns (bool)",
  "function completeIfCriteriaMet() returns (bool)",
  "function claimResources() returns (uint256)",
  "function allocateAdditionalResources(address[] recipients, uint256[] amounts) returns (bool)"
];

// Enum for mission status
export enum MissionStatus {
  PENDING = 0,
  ACTIVE = 1,
  COMPLETE = 2,
  FAILED = 3,
  CANCELLED = 4
}

// Enum for evidence type
export enum EvidenceType {
  PHOTO = 0,
  DOCUMENT = 1,
  AUDIO = 2,
  VIDEO = 3,
  OTHER = 4
}

// Interface for mission parameters
export interface MissionParameters {
  name: string;
  objective: string;
  successCriteria: string;
  deadline: number;
}

// Interface for resource allocation
export interface ResourceAllocation {
  recipients: string[];
  amounts: string[];
}

// Interface for mission data
export interface MissionData {
  address: string;
  name: string;
  objective: string;
  successCriteria: string;
  deadline: number;
  status: MissionStatus;
  creator: string;
  participants: string[];
  evidenceCount: number;
  isComplete: boolean;
}

// Interface for evidence data
export interface EvidenceData {
  submitter: string;
  evidenceHash: string;
  evidenceType: EvidenceType;
  metadata: string;
  timestamp: number;
}

// Interface for resource allocation data
export interface ResourceData {
  recipient: string;
  allocated: string;
  claimed: string;
}

/**
 * Deploy a new mission contract
 * @param parameters The mission parameters
 * @param participants The mission participants
 * @param resourceAllocation The resource allocation
 * @param provider The Ethereum provider
 * @returns The mission contract address
 */
export const deployMissionContract = async (
  parameters: MissionParameters,
  participants: string[],
  resourceAllocation: ResourceAllocation,
  provider: BrowserProvider
): Promise<string> => {
  try {
    const signer = await provider.getSigner();
    
    // Create mission factory instance
    const missionFactory = new Contract(
      MISSION_FACTORY_ADDRESS,
      MISSION_FACTORY_ABI,
      signer
    );
    
    // Deploy new mission contract
    const tx = await missionFactory.createMission(
      parameters.name,
      parameters.objective,
      parameters.successCriteria,
      parameters.deadline,
      participants,
      resourceAllocation.amounts.map(amount => ethers.parseEther(amount)),
      resourceAllocation.recipients
    );
    
    const receipt = await tx.wait();
    
    // Get mission contract address from event
    const missionCreatedEvent = receipt.logs
      .filter((log: any) => log.fragment && log.fragment.name === 'MissionCreated')
      .map((log: any) => {
        const parsedLog = missionFactory.interface.parseLog({
          topics: log.topics as string[],
          data: log.data
        });
        return parsedLog;
      })[0];
    
    return missionCreatedEvent.args.missionAddress;
  } catch (error) {
    console.error('Error deploying mission contract:', error);
    throw new Error(`Failed to deploy mission contract: ${(error as Error).message}`);
  }
};

/**
 * Get all missions
 * @param provider The Ethereum provider
 * @returns Array of mission addresses
 */
export const getAllMissions = async (
  provider: BrowserProvider
): Promise<string[]> => {
  try {
    // Get mission factory instance
    const missionFactory = new Contract(
      MISSION_FACTORY_ADDRESS,
      MISSION_FACTORY_ABI,
      provider
    );
    
    // Get all mission addresses
    const missions = await missionFactory.getMissions();
    
    return missions;
  } catch (error) {
    console.error('Error getting all missions:', error);
    throw new Error(`Failed to get all missions: ${(error as Error).message}`);
  }
};

/**
 * Get mission data
 * @param missionAddress The mission contract address
 * @param provider The Ethereum provider
 * @returns The mission data
 */
export const getMissionData = async (
  missionAddress: string,
  provider: BrowserProvider
): Promise<MissionData> => {
  try {
    // Get mission contract instance
    const mission = new Contract(
      missionAddress,
      MISSION_ABI,
      provider
    );
    
    // Get mission data
    const [
      name,
      objective,
      successCriteria,
      deadline,
      status,
      creator,
      participants,
      evidenceCount,
      isComplete
    ] = await Promise.all([
      mission.name(),
      mission.objective(),
      mission.successCriteria(),
      mission.deadline(),
      mission.status(),
      mission.creator(),
      mission.participants(),
      mission.evidenceCount(),
      mission.isComplete()
    ]);
    
    return {
      address: missionAddress,
      name,
      objective,
      successCriteria,
      deadline: Number(deadline),
      status,
      creator,
      participants,
      evidenceCount: Number(evidenceCount),
      isComplete
    };
  } catch (error) {
    console.error(`Error getting mission data for ${missionAddress}:`, error);
    throw new Error(`Failed to get mission data: ${(error as Error).message}`);
  }
};

/**
 * Get all missions from the factory contract
 * @param provider The Ethereum provider
 * @returns Array of mission data
 */
export const getMissions = async (
  provider: BrowserProvider
): Promise<MissionData[]> => {
  try {
    const signer = await provider.getSigner();
    
    // Get factory contract instance
    const factoryContract = new Contract(
      MISSION_FACTORY_ADDRESS,
      MISSION_FACTORY_ABI,
      signer
    );
    
    // Get all mission addresses
    const missionAddresses = await factoryContract.getMissions();
    
    // Get details for each mission
    const missions = await Promise.all(
      missionAddresses.map(async (address: string) => {
        const missionContract = new Contract(
          address,
          MISSION_ABI,
          signer
        );
        
        // Get mission details
        const [
          name,
          objective,
          successCriteria,
          deadline,
          statusValue,
          creator,
          isComplete
        ] = await Promise.all([
          missionContract.name(),
          missionContract.objective(),
          missionContract.successCriteria(),
          missionContract.deadline(),
          missionContract.status(),
          missionContract.creator(),
          missionContract.isComplete()
        ]);
        
        // Get participants and evidence count
        const participants = await missionContract.participants();
        const evidenceCount = await missionContract.evidenceCount();
        
        return {
          address,
          name,
          objective,
          successCriteria,
          deadline: Number(deadline),
          status: Number(statusValue),
          creator,
          participants,
          evidenceCount: Number(evidenceCount),
          isComplete
        };
      })
    );
    
    return missions;
  } catch (error) {
    console.error('Error fetching missions:', error);
    
    // For development/testing, return mock data if contract call fails
    return [
      {
        address: '0x1234567890123456789012345678901234567890',
        name: 'Reconnaissance Mission Alpha',
        objective: 'Gather intelligence on target location',
        successCriteria: 'Minimum of 5 photographs and 1 detailed report',
        deadline: Math.floor(Date.now() / 1000) + 86400, // 24 hours from now
        status: MissionStatus.ACTIVE,
        creator: '0xabcdef1234567890abcdef1234567890abcdef12',
        participants: ['0x1111111111111111111111111111111111111111', '0x2222222222222222222222222222222222222222'],
        evidenceCount: 3,
        isComplete: false
      },
      {
        address: '0x0987654321098765432109876543210987654321',
        name: 'Security Assessment Beta',
        objective: 'Evaluate security measures at checkpoint',
        successCriteria: 'Complete vulnerability report with at least 3 findings',
        deadline: Math.floor(Date.now() / 1000) + 172800, // 48 hours from now
        status: MissionStatus.PENDING,
        creator: '0xfedcba0987654321fedcba0987654321fedcba09',
        participants: ['0x3333333333333333333333333333333333333333', '0x4444444444444444444444444444444444444444'],
        evidenceCount: 0,
        isComplete: false
      }
    ];
  }
};

/**
 * Submit evidence for a mission
 * @param missionAddress The mission contract address
 * @param evidenceHash The IPFS hash of the evidence
 * @param evidenceType The type of evidence
 * @param metadata Additional metadata for the evidence
 * @param provider The Ethereum provider
 * @returns The transaction hash
 */
export const submitEvidence = async (
  missionAddress: string,
  evidenceHash: string,
  evidenceType: EvidenceType,
  metadata: string,
  provider: BrowserProvider
): Promise<string> => {
  try {
    const signer = await provider.getSigner();
    
    // Get mission contract instance
    const missionContract = new Contract(
      missionAddress,
      MISSION_ABI,
      signer
    );
    
    // Submit evidence
    const tx = await missionContract.submitEvidence(
      evidenceHash,
      evidenceType,
      metadata
    );
    
    await tx.wait();
    return tx.hash;
  } catch (error) {
    console.error('Error submitting evidence:', error);
    throw new Error('Failed to submit evidence');
  }
};

/**
 * Check if mission criteria are met and complete it if they are
 * @param missionAddress The mission contract address
 * @param provider The Ethereum provider
 * @returns The transaction hash
 */
export const completeIfCriteriaMet = async (
  missionAddress: string,
  provider: BrowserProvider
): Promise<string> => {
  try {
    const signer = await provider.getSigner();
    
    // Get mission contract instance
    const missionContract = new Contract(
      missionAddress,
      MISSION_ABI,
      signer
    );
    
    // Check if criteria are met and complete if they are
    const tx = await missionContract.completeIfCriteriaMet();
    
    await tx.wait();
    return tx.hash;
  } catch (error) {
    console.error('Error completing mission:', error);
    throw new Error('Failed to complete mission');
  }
};

/**
 * Claim resources allocated for a mission
 * @param missionAddress The mission contract address
 * @param provider The Ethereum provider
 * @returns The transaction hash
 */
export const claimResources = async (
  missionAddress: string,
  provider: BrowserProvider
): Promise<string> => {
  try {
    const signer = await provider.getSigner();
    
    // Get mission contract instance
    const missionContract = new Contract(
      missionAddress,
      MISSION_ABI,
      signer
    );
    
    // Claim resources
    const tx = await missionContract.claimResources();
    
    await tx.wait();
    return tx.hash;
  } catch (error) {
    console.error('Error claiming resources:', error);
    throw new Error('Failed to claim resources');
  }
};

/**
 * Get all evidence for a mission
 * @param missionAddress The mission contract address
 * @param provider The Ethereum provider
 * @returns Array of evidence data
 */
export const getAllMissionEvidence = async (
  missionAddress: string,
  provider: BrowserProvider
): Promise<EvidenceData[]> => {
  try {
    // Get mission contract instance
    const mission = new Contract(
      missionAddress,
      MISSION_ABI,
      provider
    );
    
    // Get evidence count
    const count = await mission.evidenceCount();
    
    // Get all evidence
    const evidencePromises = [];
    for (let i = 0; i < count; i++) {
      // Get individual evidence item directly from the contract
      const evidence = await mission.getEvidence(i);
      evidencePromises.push({
        submitter: evidence.submitter,
        evidenceHash: evidence.evidenceHash,
        evidenceType: evidence.evidenceType,
        metadata: evidence.metadata,
        timestamp: evidence.timestamp.toNumber()
      });
    }
    
    return evidencePromises;
  } catch (error) {
    console.error(`Error getting all evidence for mission ${missionAddress}:`, error);
    throw new Error(`Failed to get all mission evidence: ${(error as Error).message}`);
  }
};

/**
 * Verify evidence for a mission (only mission creator or authorized verifiers)
 * @param missionAddress The mission contract address
 * @param evidenceIndex The evidence index
 * @param isValid Whether the evidence is valid
 * @param provider The Ethereum provider
 * @returns True if successful
 */
export const verifyMissionEvidence = async (
  missionAddress: string,
  evidenceIndex: number,
  isValid: boolean,
  provider: BrowserProvider
): Promise<boolean> => {
  try {
    const signer = await provider.getSigner();
    
    // Get mission contract instance
    const mission = new Contract(
      missionAddress,
      MISSION_ABI,
      signer
    );
    
    // Verify evidence
    const tx = await mission.verifyEvidence(
      evidenceIndex,
      isValid
    );
    
    await tx.wait();
    
    // Check if mission is now complete
    try {
      const completeTx = await mission.completeIfCriteriaMet();
      await completeTx.wait();
    } catch (e) {
      // Mission completion criteria not met yet
    }
    
    return true;
  } catch (error) {
    console.error(`Error verifying evidence ${evidenceIndex} for mission ${missionAddress}:`, error);
    throw new Error(`Failed to verify mission evidence: ${(error as Error).message}`);
  }
};

/**
 * Claim allocated resources from a mission
 * @param missionAddress The mission contract address
 * @param provider The Ethereum provider
 * @returns The amount claimed
 */
export const claimMissionResources = async (
  missionAddress: string,
  provider: BrowserProvider
): Promise<string> => {
  try {
    const signer = await provider.getSigner();
    
    // Get mission contract instance
    const mission = new Contract(
      missionAddress,
      MISSION_ABI,
      signer
    );
    
    // Claim resources
    const tx = await mission.claimResources();
    const receipt = await tx.wait();
    
    // Get claimed amount from event
    const claimedEvent = receipt.logs
      .filter((log: any) => log.fragment && log.fragment.name === 'ResourceAllocated')
      .map((log: any) => {
        const parsedLog = mission.interface.parseLog({
          topics: log.topics as string[],
          data: log.data
        });
        return parsedLog;
      })[0];
    
    return ethers.formatEther(claimedEvent.args.amount);
  } catch (error) {
    console.error(`Error claiming resources from mission ${missionAddress}:`, error);
    throw new Error(`Failed to claim mission resources: ${(error as Error).message}`);
  }
};

/**
 * Get resource allocation for a mission participant
 * @param missionAddress The mission contract address
 * @param recipientAddress The recipient address
 * @param provider The Ethereum provider
 * @returns The resource allocation data
 */
export const getMissionResourceAllocation = async (
  missionAddress: string,
  recipientAddress: string,
  provider: BrowserProvider
): Promise<ResourceData> => {
  try {
    // Get mission contract instance
    const mission = new Contract(
      missionAddress,
      MISSION_ABI,
      provider
    );
    
    // Get resource allocation
    const allocation = await mission.getResourceAllocation(recipientAddress);
    
    return {
      recipient: recipientAddress,
      allocated: ethers.formatEther(allocation.allocated),
      claimed: ethers.formatEther(allocation.claimed)
    };
  } catch (error) {
    console.error(`Error getting resource allocation for ${recipientAddress} in mission ${missionAddress}:`, error);
    throw new Error(`Failed to get mission resource allocation: ${(error as Error).message}`);
  }
};

/**
 * Allocate additional resources to mission participants (only mission creator)
 * @param missionAddress The mission contract address
 * @param recipients The recipient addresses
 * @param amounts The amounts to allocate
 * @param provider The Ethereum provider
 * @returns True if successful
 */
export const allocateAdditionalMissionResources = async (
  missionAddress: string,
  recipients: string[],
  amounts: string[],
  provider: BrowserProvider
): Promise<boolean> => {
  try {
    const signer = await provider.getSigner();
    
    // Get mission contract instance
    const mission = new Contract(
      missionAddress,
      MISSION_ABI,
      signer
    );
    
    // Allocate resources
    const tx = await mission.allocateAdditionalResources(
      recipients,
      amounts.map(amount => ethers.parseEther(amount))
    );
    
    await tx.wait();
    
    return true;
  } catch (error) {
    console.error(`Error allocating additional resources for mission ${missionAddress}:`, error);
    throw new Error(`Failed to allocate additional mission resources: ${(error as Error).message}`);
  }
};
