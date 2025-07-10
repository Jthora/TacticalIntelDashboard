// src/contexts/__tests__/Web3Context.simple.test.tsx
import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { Web3Provider, useWeb3, AccessLevel } from '../Web3Context';
import { Web3Error, Web3ErrorType } from '../../types/web3Errors';

// Mock ethers before any imports that use it
jest.mock('ethers', () => ({
  ethers: {
    BrowserProvider: jest.fn(),
    formatEther: jest.fn((_value) => '1.5000'),
  },
}));

// Test wrapper component
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <Web3Provider>{children}</Web3Provider>
);

describe('Web3Context', () => {
  let mockEthereum: any;
  let mockSend: jest.Mock;
  let mockGetNetwork: jest.Mock;
  let mockGetSigner: jest.Mock;
  let mockGetBalance: jest.Mock;
  let mockLookupAddress: jest.Mock;

  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();
    
    // Set up ethers mocks
    mockSend = jest.fn();
    mockGetNetwork = jest.fn();
    mockGetSigner = jest.fn();
    mockGetBalance = jest.fn();
    mockLookupAddress = jest.fn();

    const { ethers } = require('ethers');
    ethers.BrowserProvider.mockImplementation((provider: any) => {
      // If no provider (window.ethereum), throw the error that ethers would throw
      if (!provider) {
        throw new Error('No provider detected');
      }
      return {
        send: mockSend,
        getNetwork: mockGetNetwork,
        getSigner: mockGetSigner,
        getBalance: mockGetBalance,
        lookupAddress: mockLookupAddress,
      };
    });
    
    // Mock window.ethereum
    mockEthereum = {
      request: jest.fn(),
      on: jest.fn(),
      removeListener: jest.fn(),
      isMetaMask: true,
    };
    
    Object.defineProperty(window, 'ethereum', {
      value: mockEthereum,
      writable: true,
      configurable: true,
    });

    // Reset all mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    delete (window as any).ethereum;
  });

  describe('Initial State', () => {
    it('should provide default values when not connected', () => {
      const { result } = renderHook(() => useWeb3(), { wrapper });

      expect(result.current.isConnected).toBe(false);
      expect(result.current.walletAddress).toBe('');
      expect(result.current.ensName).toBeNull();
      expect(result.current.networkName).toBe('Ethereum');
      expect(result.current.networkId).toBe(1);
      expect(result.current.balance).toBe('0.00');
      expect(result.current.accessLevel).toBe(AccessLevel.PUBLIC);
      expect(result.current.provider).toBeNull();
      expect(result.current.signer).toBeNull();
      expect(result.current.error).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });

    it('should restore state from localStorage', () => {
      localStorage.setItem('web3_connected', 'true');
      localStorage.setItem('web3_address', '0x742d35Cc6634C0532925a3b844Bc454e4438f44e');
      localStorage.setItem('web3_network', '137');

      const { result } = renderHook(() => useWeb3(), { wrapper });

      expect(result.current.isConnected).toBe(true);
      expect(result.current.walletAddress).toBe('0x742d35Cc6634C0532925a3b844Bc454e4438f44e');
      expect(result.current.networkId).toBe(137);
    });
  });

  describe('connectWallet', () => {
    it('should connect wallet successfully', async () => {
      const mockAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
      
      // Mock the send method that will be called by BrowserProvider
      mockSend.mockResolvedValue([mockAddress]);
      mockGetNetwork.mockResolvedValue({ chainId: BigInt(1) });
      mockGetSigner.mockResolvedValue({});
      mockGetBalance.mockResolvedValue(BigInt('1500000000000000000')); // 1.5 ETH
      mockLookupAddress.mockResolvedValue(null);

      const { result } = renderHook(() => useWeb3(), { wrapper });

      expect(result.current.isConnected).toBe(false);

      await act(async () => {
        await result.current.connectWallet();
      });

      expect(result.current.isConnected).toBe(true);
      expect(result.current.walletAddress).toBe(mockAddress);
      expect(result.current.balance).toBe('1.5000');
      expect(result.current.error).toBeNull();
      expect(mockSend).toHaveBeenCalledWith('eth_requestAccounts', []);
    });

    it('should handle wallet not installed error', async () => {
      // Remove ethereum object and recreate wrapper to pick up the change
      delete (window as any).ethereum;
      
      // Verify it's really deleted
      expect((window as any).ethereum).toBeUndefined();

      const { result } = renderHook(() => useWeb3(), { wrapper });

      await act(async () => {
        try {
          await result.current.connectWallet();
        } catch (error) {
          // Expected to throw
        }
      });

      expect(result.current.isConnected).toBe(false);
      expect(result.current.error).toBeInstanceOf(Web3Error);
      expect(result.current.error?.type).toBe(Web3ErrorType.WALLET_NOT_INSTALLED);
      
      // Restore ethereum for other tests
      Object.defineProperty(window, 'ethereum', {
        value: mockEthereum,
        writable: true,
        configurable: true,
      });
    });

    it('should handle user rejection (4001)', async () => {
      mockSend.mockRejectedValue({
        code: 4001,
        message: 'User rejected the request'
      });

      const { result } = renderHook(() => useWeb3(), { wrapper });

      await act(async () => {
        try {
          await result.current.connectWallet();
        } catch (error) {
          // Expected to throw
        }
      });

      expect(result.current.isConnected).toBe(false);
      expect(result.current.error).toBeInstanceOf(Web3Error);
      expect(result.current.error?.type).toBe(Web3ErrorType.TRANSACTION_REJECTED);
    });

    it('should handle pending request error (-32002)', async () => {
      mockSend.mockRejectedValue({
        code: -32002,
        message: 'Request already pending'
      });

      const { result } = renderHook(() => useWeb3(), { wrapper });

      await act(async () => {
        try {
          await result.current.connectWallet();
        } catch (error) {
          // Expected to throw
        }
      });

      expect(result.current.error).toBeInstanceOf(Web3Error);
      expect(result.current.error?.type).toBe(Web3ErrorType.CONNECTION_ERROR);
    });

    it('should set loading state during connection', async () => {
      let resolveConnection: (value: any) => void;
      const connectionPromise = new Promise(resolve => {
        resolveConnection = resolve;
      });

      // Mock the send method to return a promise
      mockSend.mockReturnValue(connectionPromise);
      mockGetNetwork.mockResolvedValue({ chainId: BigInt(1) });
      mockGetSigner.mockResolvedValue({});
      mockGetBalance.mockResolvedValue(BigInt('1000000000000000000'));
      mockLookupAddress.mockResolvedValue(null);

      const { result } = renderHook(() => useWeb3(), { wrapper });

      // Start connection
      act(() => {
        result.current.connectWallet().catch(() => {});
      });

      // Should be loading
      expect(result.current.isLoading).toBe(true);
      expect(result.current.error).toBeNull();

      // Complete connection
      await act(async () => {
        resolveConnection(['0x742d35Cc6634C0532925a3b844Bc454e4438f44e']);
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should set correct access level for known addresses', async () => {
      const directorAddress = '0x71C7656EC7ab88b098defB751B7401B5f6d8976F';
      
      // Mock the send method that will be called by BrowserProvider
      mockSend.mockResolvedValue([directorAddress]);
      mockGetNetwork.mockResolvedValue({ chainId: BigInt(1) });
      mockGetSigner.mockResolvedValue({});
      mockGetBalance.mockResolvedValue(BigInt('1000000000000000000'));
      mockLookupAddress.mockResolvedValue(null);

      const { result } = renderHook(() => useWeb3(), { wrapper });

      await act(async () => {
        await result.current.connectWallet();
      });

      expect(result.current.accessLevel).toBe(AccessLevel.DIRECTOR);
      expect(result.current.walletAddress).toBe(directorAddress);
    });

    it('should resolve ENS name when available', async () => {
      const mockAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
      const mockEnsName = 'test.eth';

      // Mock the send method that will be called by BrowserProvider
      mockSend.mockResolvedValue([mockAddress]);
      mockGetNetwork.mockResolvedValue({ chainId: BigInt(1) });
      mockGetSigner.mockResolvedValue({});
      mockGetBalance.mockResolvedValue(BigInt('1000000000000000000'));
      mockLookupAddress.mockResolvedValue(mockEnsName);

      const { result } = renderHook(() => useWeb3(), { wrapper });

      await act(async () => {
        await result.current.connectWallet();
      });

      expect(result.current.ensName).toBe(mockEnsName);
    });

    it('should handle ENS resolution failure gracefully', async () => {
      const mockAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';

      // Mock the send method that will be called by BrowserProvider
      mockSend.mockResolvedValue([mockAddress]);
      mockGetNetwork.mockResolvedValue({ chainId: BigInt(1) });
      mockGetSigner.mockResolvedValue({});
      mockGetBalance.mockResolvedValue(BigInt('1000000000000000000'));
      mockLookupAddress.mockRejectedValue(new Error('ENS lookup failed'));

      const { result } = renderHook(() => useWeb3(), { wrapper });

      await act(async () => {
        await result.current.connectWallet();
      });

      expect(result.current.isConnected).toBe(true);
      expect(result.current.ensName).toBeNull();
    });
  });

  describe('disconnectWallet', () => {
    it('should disconnect wallet and clear state', async () => {
      // First connect
      const mockAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
      
      // Mock the send method that will be called by BrowserProvider
      mockSend.mockResolvedValue([mockAddress]);
      mockGetNetwork.mockResolvedValue({ chainId: BigInt(1) });
      mockGetSigner.mockResolvedValue({});
      mockGetBalance.mockResolvedValue(BigInt('1500000000000000000'));
      mockLookupAddress.mockResolvedValue('test.eth');

      const { result } = renderHook(() => useWeb3(), { wrapper });

      await act(async () => {
        await result.current.connectWallet();
      });

      expect(result.current.isConnected).toBe(true);

      // Then disconnect
      act(() => {
        result.current.disconnectWallet();
      });

      expect(result.current.isConnected).toBe(false);
      expect(result.current.walletAddress).toBe('');
      expect(result.current.ensName).toBeNull();
      expect(result.current.balance).toBe('0.00');
      expect(result.current.accessLevel).toBe(AccessLevel.PUBLIC);
      expect(result.current.provider).toBeNull();
      expect(result.current.signer).toBeNull();

      // Check localStorage is cleared
      expect(localStorage.getItem('web3_connected')).toBeNull();
      expect(localStorage.getItem('web3_address')).toBeNull();
    });

    it('should remove event listeners on disconnect', async () => {
      // First connect
      // Mock the send method that will be called by BrowserProvider
      mockSend.mockResolvedValue(['0x742d35Cc6634C0532925a3b844Bc454e4438f44e']);
      mockGetNetwork.mockResolvedValue({ chainId: BigInt(1) });
      mockGetSigner.mockResolvedValue({});
      mockGetBalance.mockResolvedValue(BigInt('1000000000000000000'));
      mockLookupAddress.mockResolvedValue(null);

      const { result } = renderHook(() => useWeb3(), { wrapper });

      await act(async () => {
        await result.current.connectWallet();
      });

      // Clear previous calls
      mockEthereum.on.mockClear();
      mockEthereum.removeListener.mockClear();

      // Disconnect
      act(() => {
        result.current.disconnectWallet();
      });

      // Verify event listeners were removed
      expect(mockEthereum.removeListener).toHaveBeenCalledWith('accountsChanged', expect.any(Function));
      expect(mockEthereum.removeListener).toHaveBeenCalledWith('chainChanged', expect.any(Function));
      expect(mockEthereum.removeListener).toHaveBeenCalledWith('disconnect', expect.any(Function));
    });
  });

  describe('error handling', () => {
    it('should clear error when clearError is called', async () => {
      // Cause an error
      mockEthereum.request.mockRejectedValue({
        code: 4001,
        message: 'User rejected'
      });

      const { result } = renderHook(() => useWeb3(), { wrapper });

      await act(async () => {
        try {
          await result.current.connectWallet();
        } catch (error) {
          // Expected to throw
        }
      });

      expect(result.current.error).toBeInstanceOf(Web3Error);

      // Clear the error
      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('signMessage', () => {
    it('should throw error when not connected', async () => {
      const { result } = renderHook(() => useWeb3(), { wrapper });

      await act(async () => {
        try {
          await result.current.signMessage('test message');
          throw new Error('Should have thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(Web3Error);
          expect((error as Web3Error).type).toBe(Web3ErrorType.WALLET_NOT_CONNECTED);
        }
      });
    });

    it('should sign message when connected', async () => {
      // First connect
      const mockAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
      const mockSignature = '0xsignature123';
      
      const mockSigner = {
        signMessage: jest.fn().mockResolvedValue(mockSignature)
      };

      // Mock the send method that will be called by BrowserProvider
      mockSend.mockResolvedValue([mockAddress]);
      mockGetNetwork.mockResolvedValue({ chainId: BigInt(1) });
      mockGetSigner.mockResolvedValue(mockSigner);
      mockGetBalance.mockResolvedValue(BigInt('1000000000000000000'));
      mockLookupAddress.mockResolvedValue(null);

      const { result } = renderHook(() => useWeb3(), { wrapper });

      await act(async () => {
        await result.current.connectWallet();
      });

      let signature: string = '';
      await act(async () => {
        signature = await result.current.signMessage('test message');
      });

      expect(signature).toBe(mockSignature);
      expect(mockSigner.signMessage).toHaveBeenCalledWith('test message');
    });
  });
});
