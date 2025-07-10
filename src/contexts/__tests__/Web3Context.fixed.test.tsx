// src/contexts/__tests__/Web3Context.fixed.test.tsx
import { render, act, waitFor, screen, fireEvent } from '@testing-library/react';
import { Web3Provider, useWeb3 } from '../Web3Context';

// Type definitions for our mocks
interface MockProvider {
  send: jest.MockedFunction<any>;
  getNetwork: jest.MockedFunction<any>;
  getSigner: jest.MockedFunction<any>;
  getBalance: jest.MockedFunction<any>;
  lookupAddress: jest.MockedFunction<any>;
}

interface MockEthereum {
  request: jest.MockedFunction<any>;
  on: jest.MockedFunction<any>;
  removeListener: jest.MockedFunction<any>;
  isMetaMask: boolean;
}

// Create mocks
const mockProvider: MockProvider = {
  send: jest.fn(),
  getNetwork: jest.fn(),
  getSigner: jest.fn(),
  getBalance: jest.fn(),
  lookupAddress: jest.fn(),
};

// Mock ethers
jest.mock('ethers', () => ({
  ethers: {
    BrowserProvider: jest.fn().mockImplementation(() => mockProvider),
    formatEther: jest.fn().mockReturnValue('1.5000'),
  },
}));

// Mock component to test the hook
const TestComponent = () => {
  const {
    isConnected,
    walletAddress,
    ensName,
    networkName,
    networkId,
    balance,
    accessLevel,
    error,
    isLoading,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    signMessage,
    clearError
  } = useWeb3();

  return (
    <div>
      <div data-testid="connection-status">{isConnected ? 'connected' : 'disconnected'}</div>
      <div data-testid="wallet-address">{walletAddress}</div>
      <div data-testid="ens-name">{ensName || 'no-ens'}</div>
      <div data-testid="network-name">{networkName}</div>
      <div data-testid="network-id">{networkId}</div>
      <div data-testid="balance">{balance}</div>
      <div data-testid="access-level">{accessLevel}</div>
      <div data-testid="loading">{isLoading ? 'loading' : 'not-loading'}</div>
      {error && <div data-testid="error">{error.message}</div>}
      
      <button data-testid="connect-button" onClick={connectWallet}>Connect</button>
      <button data-testid="disconnect-button" onClick={disconnectWallet}>Disconnect</button>
      <button data-testid="switch-network-button" onClick={() => switchNetwork(137)}>Switch to Polygon</button>
      <button data-testid="sign-message-button" onClick={async () => {
        try {
          const result = await signMessage('test message');
          console.log('Sign result:', result);
        } catch (error) {
          console.error('Sign error:', error);
        }
      }}>Sign Message</button>
      <button data-testid="clear-error-button" onClick={clearError}>Clear Error</button>
    </div>
  );
};

describe('Web3Context Fixed Tests', () => {
  let mockEthereum: MockEthereum;

  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();
    
    // Create mock ethereum object
    mockEthereum = {
      request: jest.fn(),
      on: jest.fn(),
      removeListener: jest.fn(),
      isMetaMask: true,
    };
    
    // Set up window.ethereum
    Object.defineProperty(window, 'ethereum', {
      value: mockEthereum,
      writable: true,
    });

    // Reset all mocks
    jest.clearAllMocks();
    
    // Reset provider mocks
    mockProvider.send.mockReset();
    mockProvider.getNetwork.mockReset();
    mockProvider.getSigner.mockReset();
    mockProvider.getBalance.mockReset();
    mockProvider.lookupAddress.mockReset();
  });

  afterEach(() => {
    delete (window as any).ethereum;
  });

  describe('Wallet Connection with Fixed Mocks', () => {
    it('should connect wallet successfully with proper mocking', async () => {
      const mockAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
      
      // Set up provider mocks to return expected values
      mockProvider.send.mockImplementation((method: string) => {
        switch (method) {
          case 'eth_requestAccounts':
            return Promise.resolve([mockAddress]);
          case 'eth_chainId':
            return Promise.resolve('0x1');
          default:
            return Promise.resolve([]);
        }
      });
      
      mockProvider.getNetwork.mockResolvedValue({ 
        chainId: BigInt(1),
        name: 'mainnet'
      });
      
      mockProvider.getSigner.mockResolvedValue({
        getAddress: () => Promise.resolve(mockAddress)
      });
      
      mockProvider.getBalance.mockResolvedValue(BigInt('1500000000000000000')); // 1.5 ETH
      mockProvider.lookupAddress.mockResolvedValue(null);

      render(
        <Web3Provider>
          <TestComponent />
        </Web3Provider>
      );

      // Verify initial disconnected state
      expect(screen.getByTestId('connection-status')).toHaveTextContent('disconnected');

      // Trigger connection
      await act(async () => {
        fireEvent.click(screen.getByTestId('connect-button'));
      });

      // Wait for connection to complete
      await waitFor(() => {
        expect(screen.getByTestId('connection-status')).toHaveTextContent('connected');
      }, { timeout: 3000 });

      // Verify connected state
      expect(screen.getByTestId('wallet-address')).toHaveTextContent(mockAddress);
      expect(screen.getByTestId('balance')).toHaveTextContent('1.5000');
      expect(mockProvider.send).toHaveBeenCalledWith('eth_requestAccounts', []);
    });

    it('should handle wallet not available', async () => {
      // Remove ethereum object
      delete (window as any).ethereum;

      render(
        <Web3Provider>
          <TestComponent />
        </Web3Provider>
      );

      await act(async () => {
        fireEvent.click(screen.getByTestId('connect-button'));
      });

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Please install MetaMask or another Web3 wallet');
      });
    });

    it('should handle empty accounts response', async () => {
      // Mock empty accounts response
      mockProvider.send.mockImplementation((method: string) => {
        switch (method) {
          case 'eth_requestAccounts':
            return Promise.resolve([]); // Empty accounts
          default:
            return Promise.resolve([]);
        }
      });

      render(
        <Web3Provider>
          <TestComponent />
        </Web3Provider>
      );

      await act(async () => {
        fireEvent.click(screen.getByTestId('connect-button'));
      });

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('No accounts available');
      });
    });

    it('should handle provider send error', async () => {
      // Mock provider to throw error
      mockProvider.send.mockRejectedValue(new Error('User rejected request'));

      render(
        <Web3Provider>
          <TestComponent />
        </Web3Provider>
      );

      await act(async () => {
        fireEvent.click(screen.getByTestId('connect-button'));
      });

      await waitFor(() => {
        expect(screen.getByTestId('error')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should clear error when clearError is called', async () => {
      // Trigger an error first
      delete (window as any).ethereum;

      render(
        <Web3Provider>
          <TestComponent />
        </Web3Provider>
      );

      await act(async () => {
        fireEvent.click(screen.getByTestId('connect-button'));
      });

      await waitFor(() => {
        expect(screen.getByTestId('error')).toBeInTheDocument();
      });

      // Clear the error
      await act(async () => {
        fireEvent.click(screen.getByTestId('clear-error-button'));
      });

      await waitFor(() => {
        expect(screen.queryByTestId('error')).not.toBeInTheDocument();
      });
    });
  });
});
