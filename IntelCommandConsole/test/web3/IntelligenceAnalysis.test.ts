import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { ethers } from 'ethers';
import {
  submitIntelligence,
  voteOnIntelligence,
  getIntelligenceItems,
  submitAnonymousIntelligence,
  IntelAssessment
} from '../../src/web3/intelligence/intelligenceAnalysis';

// Mock ethers provider and contract
jest.mock('ethers', () => {
  const originalModule = jest.requireActual('ethers');
  return {
    ...originalModule,
    Contract: jest.fn().mockImplementation(() => ({
      submitIntelligence: jest.fn().mockResolvedValue({
        wait: jest.fn().mockResolvedValue({ hash: '0x123' })
      }),
      voteOnIntelligence: jest.fn().mockResolvedValue({
        wait: jest.fn().mockResolvedValue({ hash: '0x456' })
      }),
      getIntelligenceIds: jest.fn().mockResolvedValue([
        '0xabc123',
        '0xdef456'
      ]),
      getIntelligenceItem: jest.fn().mockImplementation((id) => {
        if (id === '0xabc123') {
          return [
            '0x1111',
            '{"content":"Test content 1","category":"tactical","sensitivity":"high"}',
            85,
            10,
            Date.now() / 1000
          ];
        } else {
          return [
            '0x2222',
            '{"content":"Test content 2","category":"general","sensitivity":"medium"}',
            60,
            5,
            Date.now() / 1000
          ];
        }
      })
    }))
  };
});

// Mock IPFS client
const mockIpfsClient = {
  add: jest.fn().mockResolvedValue({ path: 'Qm123456789' })
};

describe('Intelligence Analysis Module', () => {
  let mockProvider;

  beforeEach(() => {
    mockProvider = {
      getSigner: jest.fn().mockReturnValue({
        getAddress: jest.fn().mockResolvedValue('0xmockAddress'),
        signMessage: jest.fn().mockResolvedValue('0xmockSignature')
      })
    };
  });

  describe('submitIntelligence', () => {
    it('should submit intelligence and return an ID', async () => {
      const result = await submitIntelligence(
        'Test intelligence content',
        'tactical',
        'high',
        mockProvider
      );

      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(mockProvider.getSigner).toHaveBeenCalled();
    });
  });

  describe('voteOnIntelligence', () => {
    it('should submit a vote on intelligence', async () => {
      const result = await voteOnIntelligence(
        '0xabc123',
        75,
        IntelAssessment.ACCURATE,
        'Supporting evidence',
        mockProvider
      );

      expect(result).toBeTruthy();
      expect(mockProvider.getSigner).toHaveBeenCalled();
    });
  });

  describe('getIntelligenceItems', () => {
    it('should retrieve a list of intelligence items', async () => {
      const items = await getIntelligenceItems(mockProvider);

      expect(Array.isArray(items)).toBe(true);
      expect(items.length).toBe(2);
      expect(items[0]).toHaveProperty('id');
      expect(items[0]).toHaveProperty('submitter');
      expect(items[0]).toHaveProperty('confidenceScore');
      expect(items[0]).toHaveProperty('content');
      expect(items[0]).toHaveProperty('category');
      expect(items[0]).toHaveProperty('sensitivity');
    });
  });

  describe('submitAnonymousIntelligence', () => {
    it('should submit anonymous intelligence', async () => {
      const result = await submitAnonymousIntelligence(
        'Confidential information',
        'HUMINT',
        'critical',
        mockIpfsClient
      );

      expect(result).toBeTruthy();
      expect(result.includes('#')).toBe(true);
      const [cid, privateKey] = result.split('#');
      expect(cid).toBeTruthy();
      expect(privateKey).toBeTruthy();
    });
  });
});
