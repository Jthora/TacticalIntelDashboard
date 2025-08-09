import '@testing-library/jest-dom';

import { fireEvent,screen } from '@testing-library/dom';
import { render, waitFor } from '@testing-library/react';
import { BrowserProvider } from 'ethers';

import { createProposal, getProposals,ProposalType } from '../../../web3/dao/governanceProposal';
import ProposalCreationPanel from '../ProposalCreationPanel';

// Mock the governanceProposal module
jest.mock('../../../web3/dao/governanceProposal', () => ({
  ProposalType: {
    GENERAL: 0,
    PARAMETER_CHANGE: 1,
    FUND_ALLOCATION: 2,
    EMERGENCY: 3
  },
  createProposal: jest.fn(),
  getProposals: jest.fn()
}));

describe('ProposalCreationPanel', () => {
  // Sample provider mock
  const mockProvider = {} as BrowserProvider;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock getProposals to return empty array by default
    (getProposals as jest.Mock).mockResolvedValue([]);
  });

  it('renders the component with form elements', () => {
    render(<ProposalCreationPanel provider={mockProvider} />);
    
    expect(screen.getByText('Create Governance Proposal')).toBeInTheDocument();
    expect(screen.getByLabelText('Title')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByLabelText('Proposal Type')).toBeInTheDocument();
    expect(screen.getByLabelText('Start Time')).toBeInTheDocument();
    expect(screen.getByLabelText('Duration (days)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create Proposal' })).toBeInTheDocument();
  });

  it('shows a warning when no provider is connected', () => {
    render(<ProposalCreationPanel provider={null} />);
    
    expect(screen.getByText('Connect your wallet to create and manage governance proposals.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create Proposal' })).toBeDisabled();
  });

  it('shows validation error when submitting with empty fields', async () => {
    render(<ProposalCreationPanel provider={mockProvider} />);
    
    // Submit the form without filling in the required fields
    fireEvent.click(screen.getByRole('button', { name: 'Create Proposal' }));
    
    expect(await screen.findByText('Please fill in all required fields')).toBeInTheDocument();
  });

  it('successfully creates a proposal when form is valid', async () => {
    // Mock successful proposal creation
    (createProposal as jest.Mock).mockResolvedValue('123');
    
    render(<ProposalCreationPanel provider={mockProvider} />);
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Test Proposal' } });
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Test Description' } });
    
    // Set start time (need to format as expected by datetime-local input)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const formattedDate = tomorrow.toISOString().slice(0, 16); // Format: YYYY-MM-DDThh:mm
    
    fireEvent.change(screen.getByLabelText('Start Time'), { target: { value: formattedDate } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: 'Create Proposal' }));
    
    // Check if the createProposal function was called with the expected arguments
    await waitFor(() => {
      expect(createProposal).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test Proposal',
          description: 'Test Description',
          proposalType: ProposalType.GENERAL,
        }),
        mockProvider
      );
    });
    
    // Check for success message
    expect(await screen.findByText('Proposal created successfully! Proposal ID: 123')).toBeInTheDocument();
  });

  it('displays error message when proposal creation fails', async () => {
    // Mock failed proposal creation
    const errorMessage = 'Transaction rejected';
    (createProposal as jest.Mock).mockRejectedValue(new Error(errorMessage));
    
    render(<ProposalCreationPanel provider={mockProvider} />);
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Test Proposal' } });
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Test Description' } });
    
    // Set start time
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const formattedDate = tomorrow.toISOString().slice(0, 16);
    
    fireEvent.change(screen.getByLabelText('Start Time'), { target: { value: formattedDate } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: 'Create Proposal' }));
    
    // Check for error message
    expect(await screen.findByText(`Failed to create proposal: ${errorMessage}`)).toBeInTheDocument();
  });

  it('displays recent proposals when available', async () => {
    // Mock proposals data
    const mockProposals = [
      {
        id: '1',
        title: 'First Proposal',
        proposalType: ProposalType.GENERAL,
        startTime: Math.floor(Date.now() / 1000),
        endTime: Math.floor(Date.now() / 1000) + 86400 * 7,
        status: 1,
        creator: '0x123',
        description: 'Description',
        yesVotes: BigInt(100),
        noVotes: BigInt(50),
        abstainVotes: BigInt(25)
      },
      {
        id: '2',
        title: 'Second Proposal',
        proposalType: ProposalType.FUND_ALLOCATION,
        startTime: Math.floor(Date.now() / 1000),
        endTime: Math.floor(Date.now() / 1000) + 86400 * 3,
        status: 1,
        creator: '0x456',
        description: 'Description',
        yesVotes: BigInt(200),
        noVotes: BigInt(100),
        abstainVotes: BigInt(50)
      }
    ];
    
    (getProposals as jest.Mock).mockResolvedValue(mockProposals);
    
    render(<ProposalCreationPanel provider={mockProvider} />);
    
    // Check if the proposals are displayed
    await waitFor(() => {
      expect(screen.getByText('First Proposal')).toBeInTheDocument();
      expect(screen.getByText('Second Proposal')).toBeInTheDocument();
    });
  });
});
