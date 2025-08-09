import { BrowserProvider, Contract } from 'ethers';

// Contract addresses and ABIs would be imported from configuration
// For now, we'll define placeholder values
const GOVERNANCE_ADDRESS = '0x1234567890123456789012345678901234567890';
const GOVERNANCE_ABI = [
  // Events
  "event ProposalCreated(uint256 indexed proposalId, address indexed creator, string title, uint256 startTime, uint256 endTime)",
  "event VoteCast(address indexed voter, uint256 indexed proposalId, uint8 support, uint256 weight)",
  "event ProposalStatusChanged(uint256 indexed proposalId, uint8 status)",
  "event DelegationChanged(address indexed delegator, address indexed delegatee)",
  
  // Read functions
  "function governanceToken() view returns (address)",
  "function quorumPercentage() view returns (uint256)",
  "function getProposalCount() view returns (uint256)",
  "function getProposalById(uint256 proposalId) view returns (uint256 id, address creator, string title, string description, uint8 proposalType, uint256 startTime, uint256 endTime, uint256 yesVotes, uint256 noVotes, uint256 abstainVotes, uint256 quorum, uint8 status)",
  "function getVoteInfo(uint256 proposalId, address voter) view returns (bool hasVoted, uint8 support)",
  "function getProposals() view returns (uint256[] ids, address[] creators, string[] titles, uint8[] proposalTypes, uint256[] startTimes, uint256[] endTimes, uint256[] yesVotes, uint256[] noVotes, uint256[] abstainVotes, uint8[] statuses)",
  "function delegations(address delegator) view returns (address)",
  "function getVotingPower(address voter) view returns (uint256)",
  
  // Write functions
  "function createProposal(string title, string description, uint8 proposalType, uint256 startTime, uint256 endTime, address[] targets, uint256[] values, bytes[] calldata_, string metadataURI) returns (uint256)",
  "function vote(uint256 proposalId, uint8 support)",
  "function updateProposalStatus(uint256 proposalId)",
  "function executeProposal(uint256 proposalId)",
  "function cancelProposal(uint256 proposalId)",
  "function delegate(address delegatee)",
  "function clearDelegation()"
];

// Enum for proposal types
export enum ProposalType {
  GENERAL = 0,
  PARAMETER_CHANGE = 1,
  FUND_ALLOCATION = 2,
  EMERGENCY = 3
}

// Enum for proposal status
export enum ProposalStatus {
  PENDING = 0,
  ACTIVE = 1,
  SUCCEEDED = 2,
  DEFEATED = 3,
  EXECUTED = 4,
  CANCELED = 5,
  EXPIRED = 6
}

// Enum for vote support
export enum VoteSupport {
  AGAINST = 0,
  FOR = 1,
  ABSTAIN = 2
}

// Interface for proposal creation data
export interface ProposalCreationData {
  title: string;
  description: string;
  proposalType: ProposalType;
  startTime: number;
  endTime: number;
  targets?: string[];     // Contract addresses to call
  values?: string[];      // ETH values to send
  calldata?: string[];    // Function data to call
  metadataURI?: string;   // IPFS URI for additional metadata
}

// Interface for a full governance proposal
export interface GovernanceProposal {
  id: string;
  creator: string;
  title: string;
  description: string;
  proposalType: ProposalType;
  status: ProposalStatus;
  startTime: number;
  endTime: number;
  yesVotes: bigint;
  noVotes: bigint;
  abstainVotes: bigint;
  quorum?: bigint;
  targets?: string[];
  values?: string[];
  calldata?: string[];
  metadataURI?: string;
  executed?: boolean;
  createdAt?: number;
  executedAt?: number;
}

// Interface for voter info
export interface VoterInfo {
  hasVoted: boolean;
  support: VoteSupport;
  weight?: bigint;
}

// Interface for delegation info
export interface DelegationInfo {
  delegatee: string;
  votingPower: bigint;
}

/**
 * Creates a new governance proposal
 * @param proposalData The proposal data
 * @param provider The Ethereum provider
 * @returns The ID of the created proposal
 */
export const createProposal = async (
  proposalData: ProposalCreationData,
  provider: BrowserProvider
): Promise<string> => {
  try {
    const signer = await provider.getSigner();
    const governanceContract = new Contract(
      GOVERNANCE_ADDRESS,
      GOVERNANCE_ABI,
      signer
    );
    
    // Call the createProposal function on the contract
    const tx = await governanceContract.createProposal(
      proposalData.title,
      proposalData.description,
      proposalData.proposalType,
      proposalData.startTime,
      proposalData.endTime,
      proposalData.targets || [],
      proposalData.values || [],
      proposalData.calldata || [],
      proposalData.metadataURI || ''
    );
    
    // Wait for the transaction to be mined
    const receipt = await tx.wait();
    
    // Get the proposal ID from the event
    const proposalCreatedEvent = receipt.events.find(
      (e: any) => e.event === 'ProposalCreated'
    );
    
    return proposalCreatedEvent.args.proposalId;
  } catch (error) {
    console.error('Error creating proposal:', error);
    throw new Error(`Failed to create proposal: ${(error as Error).message}`);
  }
};

/**
 * Gets a governance proposal by ID
 * @param proposalId The ID of the proposal
 * @param provider The Ethereum provider
 * @returns The proposal data
 */
export const getProposalById = async (
  proposalId: string,
  provider: BrowserProvider
): Promise<GovernanceProposal> => {
  try {
    const governanceContract = new Contract(
      GOVERNANCE_ADDRESS,
      GOVERNANCE_ABI,
      provider
    );
    
    // Call the getProposalById function on the contract
    const result = await governanceContract.getProposalById(proposalId);
    
    // Transform the result into our GovernanceProposal interface
    const proposal: GovernanceProposal = {
      id: proposalId,
      creator: result.creator,
      title: result.title,
      description: result.description,
      proposalType: result.proposalType,
      status: result.status,
      startTime: Number(result.startTime),
      endTime: Number(result.endTime),
      yesVotes: result.yesVotes,
      noVotes: result.noVotes,
      abstainVotes: result.abstainVotes,
      quorum: result.quorum
    };
    
    return proposal;
  } catch (error) {
    console.error(`Error getting proposal ${proposalId}:`, error);
    throw new Error(`Failed to get proposal: ${(error as Error).message}`);
  }
};

/**
 * Gets all governance proposals
 * @param provider The Ethereum provider
 * @returns Array of proposals
 */
export const getProposals = async (
  provider: BrowserProvider
): Promise<GovernanceProposal[]> => {
  try {
    const governanceContract = new Contract(
      GOVERNANCE_ADDRESS,
      GOVERNANCE_ABI,
      provider
    );
    
    // Call the getProposals function on the contract
    const result = await governanceContract.getProposals();
    
    // Transform the result into our GovernanceProposal interface
    const proposals: GovernanceProposal[] = [];
    
    for (let i = 0; i < result.ids.length; i++) {
      proposals.push({
        id: result.ids[i].toString(),
        creator: result.creators[i],
        title: result.titles[i],
        description: '', // Not returned in bulk query for gas efficiency
        proposalType: result.proposalTypes[i],
        status: result.statuses[i],
        startTime: Number(result.startTimes[i]),
        endTime: Number(result.endTimes[i]),
        yesVotes: result.yesVotes[i],
        noVotes: result.noVotes[i],
        abstainVotes: result.abstainVotes[i]
      });
    }
    
    return proposals;
  } catch (error) {
    console.error('Error getting proposals:', error);
    throw new Error(`Failed to get proposals: ${(error as Error).message}`);
  }
};

/**
 * Votes on a governance proposal
 * @param proposalId The ID of the proposal
 * @param support The vote support (0=Against, 1=For, 2=Abstain)
 * @param provider The Ethereum provider
 * @returns True if the vote was successful
 */
export const voteOnProposal = async (
  proposalId: string,
  support: VoteSupport,
  provider: BrowserProvider
): Promise<boolean> => {
  try {
    const signer = await provider.getSigner();
    const governanceContract = new Contract(
      GOVERNANCE_ADDRESS,
      GOVERNANCE_ABI,
      signer
    );
    
    // Call the vote function on the contract
    const tx = await governanceContract.vote(
      proposalId,
      support
    );
    
    await tx.wait();
    
    return true;
  } catch (error) {
    console.error(`Error voting on proposal ${proposalId}:`, error);
    throw new Error(`Failed to vote on proposal: ${(error as Error).message}`);
  }
};

/**
 * Updates the status of a proposal
 * @param proposalId The ID of the proposal
 * @param provider The Ethereum provider
 * @returns True if the update was successful
 */
export const updateProposalStatus = async (
  proposalId: string,
  provider: BrowserProvider
): Promise<boolean> => {
  try {
    const signer = await provider.getSigner();
    const governanceContract = new Contract(
      GOVERNANCE_ADDRESS,
      GOVERNANCE_ABI,
      signer
    );
    
    // Call the updateProposalStatus function on the contract
    const tx = await governanceContract.updateProposalStatus(proposalId);
    
    await tx.wait();
    
    return true;
  } catch (error) {
    console.error(`Error updating proposal status ${proposalId}:`, error);
    throw new Error(`Failed to update proposal status: ${(error as Error).message}`);
  }
};

/**
 * Executes a proposal that has passed
 * @param proposalId The ID of the proposal
 * @param provider The Ethereum provider
 * @returns True if the execution was successful
 */
export const executeProposal = async (
  proposalId: string,
  provider: BrowserProvider
): Promise<boolean> => {
  try {
    const signer = await provider.getSigner();
    const governanceContract = new Contract(
      GOVERNANCE_ADDRESS,
      GOVERNANCE_ABI,
      signer
    );
    
    // Call the executeProposal function on the contract
    const tx = await governanceContract.executeProposal(proposalId);
    
    await tx.wait();
    
    return true;
  } catch (error) {
    console.error(`Error executing proposal ${proposalId}:`, error);
    throw new Error(`Failed to execute proposal: ${(error as Error).message}`);
  }
};

/**
 * Cancels a proposal (only the creator can call)
 * @param proposalId The ID of the proposal
 * @param provider The Ethereum provider
 * @returns True if the cancellation was successful
 */
export const cancelProposal = async (
  proposalId: string,
  provider: BrowserProvider
): Promise<boolean> => {
  try {
    const signer = await provider.getSigner();
    const governanceContract = new Contract(
      GOVERNANCE_ADDRESS,
      GOVERNANCE_ABI,
      signer
    );
    
    // Call the cancelProposal function on the contract
    const tx = await governanceContract.cancelProposal(proposalId);
    
    await tx.wait();
    
    return true;
  } catch (error) {
    console.error(`Error canceling proposal ${proposalId}:`, error);
    throw new Error(`Failed to cancel proposal: ${(error as Error).message}`);
  }
};

/**
 * Gets voter information for a proposal
 * @param proposalId The ID of the proposal
 * @param voterAddress The address of the voter
 * @param provider The Ethereum provider
 * @returns The voter information
 */
export const getVoterInfo = async (
  proposalId: string,
  voterAddress: string,
  provider: BrowserProvider
): Promise<VoterInfo> => {
  try {
    const governanceContract = new Contract(
      GOVERNANCE_ADDRESS,
      GOVERNANCE_ABI,
      provider
    );
    
    // Call the getVoteInfo function on the contract
    const result = await governanceContract.getVoteInfo(
      proposalId,
      voterAddress
    );
    
    return {
      hasVoted: result.hasVoted,
      support: result.support
    };
  } catch (error) {
    console.error(`Error getting voter info for proposal ${proposalId}:`, error);
    throw new Error(`Failed to get voter info: ${(error as Error).message}`);
  }
};

/**
 * Delegates voting power to another address
 * @param delegateeAddress The address to delegate to
 * @param provider The Ethereum provider
 * @returns True if the delegation was successful
 */
export const delegateVotingPower = async (
  delegateeAddress: string,
  provider: BrowserProvider
): Promise<boolean> => {
  try {
    const signer = await provider.getSigner();
    const governanceContract = new Contract(
      GOVERNANCE_ADDRESS,
      GOVERNANCE_ABI,
      signer
    );
    
    // Call the delegate function on the contract
    const tx = await governanceContract.delegate(delegateeAddress);
    
    await tx.wait();
    
    return true;
  } catch (error) {
    console.error(`Error delegating voting power to ${delegateeAddress}:`, error);
    throw new Error(`Failed to delegate voting power: ${(error as Error).message}`);
  }
};

/**
 * Clears any active delegation
 * @param provider The Ethereum provider
 * @returns True if the delegation was cleared successfully
 */
export const clearDelegation = async (
  provider: BrowserProvider
): Promise<boolean> => {
  try {
    const signer = await provider.getSigner();
    const governanceContract = new Contract(
      GOVERNANCE_ADDRESS,
      GOVERNANCE_ABI,
      signer
    );
    
    // Call the clearDelegation function on the contract
    const tx = await governanceContract.clearDelegation();
    
    await tx.wait();
    
    return true;
  } catch (error) {
    console.error('Error clearing delegation:', error);
    throw new Error(`Failed to clear delegation: ${(error as Error).message}`);
  }
};

/**
 * Gets the current delegation for an address
 * @param delegatorAddress The address to check
 * @param provider The Ethereum provider
 * @returns The delegatee address (zero address if no delegation)
 */
export const getDelegation = async (
  delegatorAddress: string,
  provider: BrowserProvider
): Promise<string> => {
  try {
    const governanceContract = new Contract(
      GOVERNANCE_ADDRESS,
      GOVERNANCE_ABI,
      provider
    );
    
    // Call the delegations function on the contract
    const delegatee = await governanceContract.delegations(delegatorAddress);
    
    return delegatee;
  } catch (error) {
    console.error(`Error getting delegation for ${delegatorAddress}:`, error);
    throw new Error(`Failed to get delegation: ${(error as Error).message}`);
  }
};

/**
 * Gets the voting power of an address
 * @param address The address to check
 * @param provider The Ethereum provider
 * @returns The voting power (own balance + delegated)
 */
export const getVotingPower = async (
  address: string,
  provider: BrowserProvider
): Promise<bigint> => {
  try {
    const governanceContract = new Contract(
      GOVERNANCE_ADDRESS,
      GOVERNANCE_ABI,
      provider
    );
    
    // Call the getVotingPower function on the contract
    const votingPower = await governanceContract.getVotingPower(address);
    
    return votingPower;
  } catch (error) {
    console.error(`Error getting voting power for ${address}:`, error);
    throw new Error(`Failed to get voting power: ${(error as Error).message}`);
  }
};

/**
 * Gets the governance token address
 * @param provider The Ethereum provider
 * @returns The governance token address
 */
export const getGovernanceTokenAddress = async (
  provider: BrowserProvider
): Promise<string> => {
  try {
    const governanceContract = new Contract(
      GOVERNANCE_ADDRESS,
      GOVERNANCE_ABI,
      provider
    );
    
    // Call the governanceToken function on the contract
    const tokenAddress = await governanceContract.governanceToken();
    
    return tokenAddress;
  } catch (error) {
    console.error('Error getting governance token address:', error);
    throw new Error(`Failed to get governance token address: ${(error as Error).message}`);
  }
};
