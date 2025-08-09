import '@testing-library/jest-dom';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { BrowserProvider } from 'ethers';
import React from 'react';

import { getProposalById, GovernanceProposal, ProposalStatus, ProposalType, voteOnProposal,VoteSupport } from '../../../web3/dao/governanceProposal';
import ProposalVotingPanel from '../ProposalVotingPanel';

// Mock the governanceProposal module
jest.mock('../../../web3/dao/governanceProposal', () => ({
  ProposalType: {
    GENERAL: 0,
    PARAMETER_CHANGE: 1,
    FUND_ALLOCATION: 2,
    EMERGENCY: 3
  },
  ProposalStatus: {
    PENDING: 0,
    ACTIVE: 1,
    SUCCEEDED: 2,
    DEFEATED: 3,
    EXECUTED: 4,
    CANCELED: 5,
    EXPIRED: 6
  },
  VoteSupport: {
    AGAINST: 0,
    FOR: 1,
    ABSTAIN: 2
  },
  getProposalById: jest.fn(),
  voteOnProposal: jest.fn()
}));

describe('ProposalVotingPanel', () => {
  // Sample provider mock
  const mockProvider = {} as BrowserProvider;
  
  // Sample proposal mock
  const mockProposal: GovernanceProposal = {
    id: '1',
    title: 'Test Proposal',
    description: 'This is a test proposal description that explains the purpose and details of the governance action being proposed.',
    proposalType: ProposalType.GENERAL,
    status: ProposalStatus.ACTIVE,
    startTime: Math.floor(Date.now() / 1000) - 86400, // Started 1 day ago
    endTime: Math.floor(Date.now() / 1000) + 86400 * 6, // Ends in 6 days
    yesVotes: BigInt(100),
    noVotes: BigInt(50),
    abstainVotes: BigInt(25),
    creator: '0x1234567890abcdef1234567890abcdef12345678'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock getProposalById to return the mock proposal by default
    (getProposalById as jest.Mock).mockResolvedValue(mockProposal);
  });

  it('renders loading state initially', () => {
    render(<ProposalVotingPanel proposalId="1" provider={mockProvider} />);
    expect(screen.getByText('Loading proposal...')).toBeInTheDocument();
  });

  it('shows a warning when no provider is connected', () => {
    render(<ProposalVotingPanel proposalId="1" provider={null} />);
    expect(screen.getByText('Connect your wallet to vote on governance proposals.')).toBeInTheDocument();
  });

  it('displays proposal details once loaded', async () => {
    render(<ProposalVotingPanel proposalId="1" provider={mockProvider} />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Proposal')).toBeInTheDocument();
      expect(screen.getByText('This is a test proposal description that explains the purpose and details of the governance action being proposed.')).toBeInTheDocument();
      expect(screen.getByText('General')).toBeInTheDocument();
      expect(screen.getByText('Active')).toBeInTheDocument();
    });
  });

  it('displays voting options for active proposals', async () => {
    render(<ProposalVotingPanel proposalId="1" provider={mockProvider} />);
    
    await waitFor(() => {
      expect(screen.getByLabelText('For')).toBeInTheDocument();
      expect(screen.getByLabelText('Against')).toBeInTheDocument();
      expect(screen.getByLabelText('Abstain')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Submit Vote' })).toBeInTheDocument();
    });
  });

  it('does not display voting options for non-active proposals', async () => {
    const inactiveProposal = {
      ...mockProposal,
      status: ProposalStatus.SUCCEEDED
    };
    
    (getProposalById as jest.Mock).mockResolvedValue(inactiveProposal);
    
    render(<ProposalVotingPanel proposalId="1" provider={mockProvider} />);
    
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: 'Submit Vote' })).not.toBeInTheDocument();
      expect(screen.getByText('This proposal is no longer active and cannot be voted on.')).toBeInTheDocument();
    });
  });

  it('successfully submits a vote', async () => {
    // Mock successful vote submission
    (voteOnProposal as jest.Mock).mockResolvedValue(true);
    
    render(<ProposalVotingPanel proposalId="1" provider={mockProvider} />);
    
    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByLabelText('For')).toBeInTheDocument();
    });
    
    // Select "For" option and submit
    fireEvent.click(screen.getByLabelText('For'));
    fireEvent.click(screen.getByRole('button', { name: 'Submit Vote' }));
    
    // Check if voteOnProposal was called with correct args
    await waitFor(() => {
      expect(voteOnProposal).toHaveBeenCalledWith('1', VoteSupport.FOR, mockProvider);
      expect(screen.getByText('Vote submitted successfully!')).toBeInTheDocument();
    });
  });

  it('displays error message when voting fails', async () => {
    // Mock failed vote submission
    const errorMessage = 'Transaction rejected';
    (voteOnProposal as jest.Mock).mockRejectedValue(new Error(errorMessage));
    
    render(<ProposalVotingPanel proposalId="1" provider={mockProvider} />);
    
    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByLabelText('For')).toBeInTheDocument();
    });
    
    // Select "Against" option and submit
    fireEvent.click(screen.getByLabelText('Against'));
    fireEvent.click(screen.getByRole('button', { name: 'Submit Vote' }));
    
    // Check for error message
    await waitFor(() => {
      expect(screen.getByText(`Failed to submit vote: ${errorMessage}`)).toBeInTheDocument();
    });
  });

  it('displays vote distribution with correct percentages', async () => {
    render(<ProposalVotingPanel proposalId="1" provider={mockProvider} />);
    
    await waitFor(() => {
      // Total votes = 175 (100 + 50 + 25)
      // Yes = 57.14%, No = 28.57%, Abstain = 14.29%
      expect(screen.getByText('57%')).toBeInTheDocument(); // Yes votes
      expect(screen.getByText('29%')).toBeInTheDocument(); // No votes
      expect(screen.getByText('14%')).toBeInTheDocument(); // Abstain votes
    });
  });
});
