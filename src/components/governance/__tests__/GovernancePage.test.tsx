import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import GovernancePage from '../GovernancePage';
import { BrowserProvider } from 'ethers';
import { GovernanceProposal, ProposalStatus, ProposalType, getProposals } from '../../../web3/dao/governanceProposal';

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
  getProposals: jest.fn(),
  getProposalById: jest.fn(),
  voteOnProposal: jest.fn(),
  createProposal: jest.fn()
}));

// Mock the child components
jest.mock('../ProposalCreationPanel', () => {
  return function MockProposalCreationPanel({ provider }: { provider: BrowserProvider | null }) {
    return <div data-testid="proposal-creation-panel">Proposal Creation Panel (Provider: {provider ? 'Connected' : 'Not Connected'})</div>;
  };
});

jest.mock('../ProposalVotingPanel', () => {
  return function MockProposalVotingPanel({ proposalId, provider }: { proposalId: string, provider: BrowserProvider | null }) {
    return <div data-testid="proposal-voting-panel">Proposal Voting Panel for ID: {proposalId} (Provider: {provider ? 'Connected' : 'Not Connected'})</div>;
  };
});

describe('GovernancePage', () => {
  // Sample provider mock
  const mockProvider = {} as BrowserProvider;
  
  // Sample proposals mock
  const mockProposals: GovernanceProposal[] = [
    {
      id: '1',
      title: 'Test Proposal 1',
      description: 'This is test proposal 1',
      proposalType: ProposalType.GENERAL,
      status: ProposalStatus.ACTIVE,
      startTime: Math.floor(Date.now() / 1000) - 86400, // Started 1 day ago
      endTime: Math.floor(Date.now() / 1000) + 86400 * 6, // Ends in 6 days
      yesVotes: BigInt(100),
      noVotes: BigInt(50),
      abstainVotes: BigInt(25),
      creator: '0x1234567890abcdef1234567890abcdef12345678'
    },
    {
      id: '2',
      title: 'Test Proposal 2',
      description: 'This is test proposal 2',
      proposalType: ProposalType.PARAMETER_CHANGE,
      status: ProposalStatus.SUCCEEDED,
      startTime: Math.floor(Date.now() / 1000) - 86400 * 10, // Started 10 days ago
      endTime: Math.floor(Date.now() / 1000) - 86400 * 3, // Ended 3 days ago
      yesVotes: BigInt(200),
      noVotes: BigInt(50),
      abstainVotes: BigInt(10),
      creator: '0x1234567890abcdef1234567890abcdef12345678'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock getProposals to return the mock proposals by default
    (getProposals as jest.Mock).mockResolvedValue(mockProposals);
  });

  it('renders the governance page with header', () => {
    render(<GovernancePage provider={mockProvider} />);
    
    expect(screen.getByText('Tactical Intel Dashboard Governance')).toBeInTheDocument();
    expect(screen.getByText('Participate in decentralized decision-making for the Earth Alliance intelligence operations')).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    render(<GovernancePage provider={mockProvider} />);
    
    expect(screen.getByText('Loading governance proposals...')).toBeInTheDocument();
  });

  it('displays proposals once loaded', async () => {
    render(<GovernancePage provider={mockProvider} />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Proposal 1')).toBeInTheDocument();
      expect(screen.getByText('Test Proposal 2')).toBeInTheDocument();
    });
  });

  it('navigates to create proposal view when button is clicked', async () => {
    render(<GovernancePage provider={mockProvider} />);
    
    // Wait for proposals to load
    await waitFor(() => {
      expect(screen.getByText('Create New Proposal')).toBeInTheDocument();
    });
    
    // Click the create proposal button
    fireEvent.click(screen.getByText('Create New Proposal'));
    
    // Check if the creation panel is displayed
    expect(screen.getByTestId('proposal-creation-panel')).toBeInTheDocument();
    expect(screen.getByText('Create New Governance Proposal')).toBeInTheDocument();
  });

  it('navigates to proposal details when a proposal card is clicked', async () => {
    render(<GovernancePage provider={mockProvider} />);
    
    // Wait for proposals to load
    await waitFor(() => {
      expect(screen.getByText('Test Proposal 1')).toBeInTheDocument();
    });
    
    // Click the first proposal
    fireEvent.click(screen.getByText('Test Proposal 1'));
    
    // Check if the voting panel is displayed
    expect(screen.getByTestId('proposal-voting-panel')).toBeInTheDocument();
    expect(screen.getByText('Proposal Details')).toBeInTheDocument();
  });

  it('returns to list view when back button is clicked', async () => {
    render(<GovernancePage provider={mockProvider} />);
    
    // Wait for proposals to load
    await waitFor(() => {
      expect(screen.getByText('Test Proposal 1')).toBeInTheDocument();
    });
    
    // Navigate to proposal details
    fireEvent.click(screen.getByText('Test Proposal 1'));
    
    // Click the back button
    fireEvent.click(screen.getByText('← Back to Proposals'));
    
    // Check if we're back at the list view
    expect(screen.getByText('Create New Proposal')).toBeInTheDocument();
    expect(screen.getByText('Test Proposal 1')).toBeInTheDocument();
    expect(screen.getByText('Test Proposal 2')).toBeInTheDocument();
  });

  it('disables create proposal button when no provider is connected', async () => {
    render(<GovernancePage provider={null} />);
    
    await waitFor(() => {
      const createButton = screen.getByText('Create New Proposal');
      expect(createButton).toBeDisabled();
    });
  });

  it('shows an empty state when no proposals are found', async () => {
    // Mock empty proposals array
    (getProposals as jest.Mock).mockResolvedValue([]);
    
    render(<GovernancePage provider={mockProvider} />);
    
    await waitFor(() => {
      expect(screen.getByText('No governance proposals found.')).toBeInTheDocument();
    });
  });

  it('shows an error message when proposals loading fails', async () => {
    // Mock error
    const errorMessage = 'Failed to fetch proposals';
    (getProposals as jest.Mock).mockRejectedValue(new Error(errorMessage));
    
    render(<GovernancePage provider={mockProvider} />);
    
    await waitFor(() => {
      expect(screen.getByText(/Failed to load proposals/)).toBeInTheDocument();
    });
  });
});
