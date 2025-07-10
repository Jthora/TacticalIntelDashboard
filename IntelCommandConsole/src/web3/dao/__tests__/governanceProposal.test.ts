import { ethers } from 'ethers';
import { GovernanceProposal, ProposalStatus, ProposalType, createProposal, getProposalById, getProposals, voteOnProposal } from '../governanceProposal';

// Mock the provider and signer
jest.mock('ethers', () => {
  const originalModule = jest.requireActual('ethers');
  
  return {
    ...originalModule,
    Contract: jest.fn().mockImplementation(() => ({
      createProposal: jest.fn().mockResolvedValue({
        hash: '0x123456789abcdef',
        wait: jest.fn().mockResolvedValue({
          events: [{
            event: 'ProposalCreated',
            args: {
              proposalId: '1',
              creator: '0x1234567890123456789012345678901234567890',
              title: 'Test Proposal',
              description: 'Test Description',
              proposalType: 0, // GENERAL
              startTime: Math.floor(Date.now() / 1000),
              endTime: Math.floor(Date.now() / 1000) + 86400
            }
          }]
        })
      }),
      getProposalById: jest.fn().mockImplementation((id) => {
        if (id === '1') {
          return Promise.resolve({
            id: '1',
            creator: '0x1234567890123456789012345678901234567890',
            title: 'Test Proposal',
            description: 'Test Description',
            proposalType: 0, // GENERAL
            status: 1, // ACTIVE
            startTime: Math.floor(Date.now() / 1000),
            endTime: Math.floor(Date.now() / 1000) + 86400,
            yesVotes: ethers.parseEther('100'),
            noVotes: ethers.parseEther('50'),
            abstainVotes: ethers.parseEther('25')
          });
        }
        return Promise.reject(new Error('Proposal not found'));
      }),
      getProposals: jest.fn().mockResolvedValue([
        {
          id: '1',
          creator: '0x1234567890123456789012345678901234567890',
          title: 'Test Proposal',
          description: 'Test Description',
          proposalType: 0, // GENERAL
          status: 1, // ACTIVE
          startTime: Math.floor(Date.now() / 1000),
          endTime: Math.floor(Date.now() / 1000) + 86400,
          yesVotes: ethers.parseEther('100'),
          noVotes: ethers.parseEther('50'),
          abstainVotes: ethers.parseEther('25')
        }
      ]),
      vote: jest.fn().mockResolvedValue({
        hash: '0x123456789abcdef',
        wait: jest.fn().mockResolvedValue({
          events: [{
            event: 'VoteCast',
            args: {
              proposalId: '1',
              voter: '0x1234567890123456789012345678901234567890',
              support: 1, // YES
              weight: ethers.parseEther('10')
            }
          }]
        })
      })
    })),
    BrowserProvider: jest.fn().mockImplementation(() => ({
      getSigner: jest.fn().mockResolvedValue({
        getAddress: jest.fn().mockResolvedValue('0x1234567890123456789012345678901234567890'),
        signMessage: jest.fn().mockResolvedValue('0xsignature')
      })
    }))
  };
});

describe('Governance Proposal Module', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createProposal', () => {
    it('should create a new proposal successfully', async () => {
      const mockProvider = new ethers.BrowserProvider({} as any);
      const proposalData = {
        title: 'Test Proposal',
        description: 'Test Description',
        proposalType: ProposalType.GENERAL,
        startTime: Math.floor(Date.now() / 1000),
        endTime: Math.floor(Date.now() / 1000) + 86400
      };

      const result = await createProposal(proposalData, mockProvider);

      expect(result).toEqual('1');
      expect(ethers.Contract).toHaveBeenCalled();
    });

    it('should throw an error when creation fails', async () => {
      const mockProvider = new ethers.BrowserProvider({} as any);
      const proposalData = {
        title: 'Test Proposal',
        description: 'Test Description',
        proposalType: ProposalType.GENERAL,
        startTime: Math.floor(Date.now() / 1000),
        endTime: Math.floor(Date.now() / 1000) + 86400
      };

      // Override the mock to throw an error
      (ethers.Contract as jest.Mock).mockImplementationOnce(() => ({
        createProposal: jest.fn().mockRejectedValue(new Error('Failed to create proposal'))
      }));

      await expect(createProposal(proposalData, mockProvider)).rejects.toThrow('Failed to create proposal');
    });
  });

  describe('getProposalById', () => {
    it('should retrieve a proposal by id', async () => {
      const mockProvider = new ethers.BrowserProvider({} as any);
      const proposalId = '1';

      const result = await getProposalById(proposalId, mockProvider);

      expect(result).toHaveProperty('id', '1');
      expect(result).toHaveProperty('title', 'Test Proposal');
      expect(result).toHaveProperty('description', 'Test Description');
      expect(ethers.Contract).toHaveBeenCalled();
    });

    it('should throw an error when proposal is not found', async () => {
      const mockProvider = new ethers.BrowserProvider({} as any);
      const proposalId = '999'; // Non-existent ID

      await expect(getProposalById(proposalId, mockProvider)).rejects.toThrow('Proposal not found');
    });
  });

  describe('getProposals', () => {
    it('should retrieve a list of proposals', async () => {
      const mockProvider = new ethers.BrowserProvider({} as any);

      const result = await getProposals(mockProvider);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('id', '1');
      expect(ethers.Contract).toHaveBeenCalled();
    });
  });

  describe('voteOnProposal', () => {
    it('should cast a vote on a proposal', async () => {
      const mockProvider = new ethers.BrowserProvider({} as any);
      const proposalId = '1';
      const support = 1; // YES

      const result = await voteOnProposal(proposalId, support, mockProvider);

      expect(result).toBe(true);
      expect(ethers.Contract).toHaveBeenCalled();
    });

    it('should throw an error when voting fails', async () => {
      const mockProvider = new ethers.BrowserProvider({} as any);
      const proposalId = '1';
      const support = 1; // YES

      // Override the mock to throw an error
      (ethers.Contract as jest.Mock).mockImplementationOnce(() => ({
        vote: jest.fn().mockRejectedValue(new Error('Failed to vote on proposal'))
      }));

      await expect(voteOnProposal(proposalId, support, mockProvider)).rejects.toThrow('Failed to vote on proposal');
    });
  });
});
