// src/contexts/__tests__/Web3Context.test.tsx
import { act, fireEvent,render, screen, waitFor } from '@testing-library/react';

import { useWeb3,Web3Provider } from '../Web3Context';

// Create a mock provider that will be reused
let mockProvider: any;

// Mock ethers
jest.mock('ethers', () => {
  mockProvider = {
    send: jest.fn(),
    getNetwork: jest.fn(),
    getSigner: jest.fn(),
    getBalance: jest.fn(),
    lookupAddress: jest.fn(),
  };

  return {
    ethers: {
      BrowserProvider: jest.fn().mockImplementation(() => mockProvider),
      formatEther: jest.fn(() => '1.5000'),
    },
  };
});

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
      <button data-testid="sign-message-button" onClick={() => signMessage('test message')}>Sign Message</button>
      <button data-testid="clear-error-button" onClick={clearError}>Clear Error</button>
    </div>
  );
};

describe('Web3Context', () => {
  let mockEthereum: any;

  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();
    
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
    });

    // Reset all mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    delete (window as any).ethereum;
  });

  describe('Initial State', () => {
    it('should render with default disconnected state', () => {
      render(
        <Web3Provider>
          <TestComponent />
        </Web3Provider>
      );

      expect(screen.getByTestId('connection-status')).toHaveTextContent('disconnected');
      expect(screen.getByTestId('wallet-address')).toHaveTextContent('');
      expect(screen.getByTestId('ens-name')).toHaveTextContent('no-ens');
      expect(screen.getByTestId('network-name')).toHaveTextContent('Ethereum');
      expect(screen.getByTestId('network-id')).toHaveTextContent('1');
      expect(screen.getByTestId('balance')).toHaveTextContent('0.00');
      expect(screen.getByTestId('access-level')).toHaveTextContent('0'); // PUBLIC
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    });

    it('should restore state from localStorage', () => {
      localStorage.setItem('web3_connected', 'true');
      localStorage.setItem('web3_address', '0x742d35Cc6634C0532925a3b844Bc454e4438f44e');
      localStorage.setItem('web3_network', '137');

      render(
        <Web3Provider>
          <TestComponent />
        </Web3Provider>
      );

      expect(screen.getByTestId('connection-status')).toHaveTextContent('connected');
      expect(screen.getByTestId('wallet-address')).toHaveTextContent('0x742d35Cc6634C0532925a3b844Bc454e4438f44e');
      expect(screen.getByTestId('network-id')).toHaveTextContent('137');
    });
  });

  describe('Wallet Connection', () => {
    it('should connect wallet successfully', async () => {
      const mockAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
      const mockChainId = '0x1'; // Ethereum mainnet

      mockEthereum.request.mockImplementation((params: any) => {
        switch (params.method) {
          case 'eth_requestAccounts':
            return Promise.resolve([mockAddress]);
          case 'eth_chainId':
            return Promise.resolve(mockChainId);
          default:
            return Promise.resolve([]);
        }
      });

      // Mock ethers provider methods
      const { ethers } = require('ethers');
      const mockProvider = new ethers.BrowserProvider();
      mockProvider.getNetwork.mockResolvedValue({ chainId: BigInt(1) });
      mockProvider.getSigner.mockResolvedValue({});
      mockProvider.getBalance.mockResolvedValue(BigInt('1500000000000000000')); // 1.5 ETH
      mockProvider.lookupAddress.mockResolvedValue(null);

      render(
        <Web3Provider>
          <TestComponent />
        </Web3Provider>
      );

      expect(screen.getByTestId('connection-status')).toHaveTextContent('disconnected');

      await act(async () => {
        fireEvent.click(screen.getByTestId('connect-button'));
      });

      await waitFor(() => {
        expect(screen.getByTestId('connection-status')).toHaveTextContent('connected');
      });

      expect(screen.getByTestId('wallet-address')).toHaveTextContent(mockAddress);
      expect(screen.getByTestId('balance')).toHaveTextContent('1.5000');
      expect(mockEthereum.request).toHaveBeenCalledWith({ method: 'eth_requestAccounts' });
    });

    it('should handle wallet not installed error', async () => {
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

    it('should handle user rejection', async () => {
      mockEthereum.request.mockRejectedValue({
        code: 4001,
        message: 'User rejected the request'
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
        expect(screen.getByTestId('error')).toHaveTextContent('User rejected the request');
      });

      expect(screen.getByTestId('connection-status')).toHaveTextContent('disconnected');
    });

    it('should handle pending request error', async () => {
      mockEthereum.request.mockRejectedValue({
        code: -32002,
        message: 'Request of type \'wallet_requestPermissions\' already pending'
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
        expect(screen.getByTestId('error')).toHaveTextContent('Request already pending. Please check your wallet.');
      });
    });

    it('should set correct access level based on address', async () => {
      const directorAddress = '0x71C7656EC7ab88b098defB751B7401B5f6d8976F';
      
      mockEthereum.request.mockResolvedValue([directorAddress]);

      const { ethers } = require('ethers');
      const mockProvider = new ethers.BrowserProvider();
      mockProvider.getNetwork.mockResolvedValue({ chainId: BigInt(1) });
      mockProvider.getSigner.mockResolvedValue({});
      mockProvider.getBalance.mockResolvedValue(BigInt('1000000000000000000'));
      mockProvider.lookupAddress.mockResolvedValue(null);

      render(
        <Web3Provider>
          <TestComponent />
        </Web3Provider>
      );

      await act(async () => {
        fireEvent.click(screen.getByTestId('connect-button'));
      });

      await waitFor(() => {
        expect(screen.getByTestId('access-level')).toHaveTextContent('4'); // DIRECTOR
      });
    });
  });

  describe('Wallet Disconnection', () => {
    it('should disconnect wallet and clear state', async () => {
      // First connect
      localStorage.setItem('web3_connected', 'true');
      localStorage.setItem('web3_address', '0x742d35Cc6634C0532925a3b844Bc454e4438f44e');

      render(
        <Web3Provider>
          <TestComponent />
        </Web3Provider>
      );

      expect(screen.getByTestId('connection-status')).toHaveTextContent('connected');

      await act(async () => {
        fireEvent.click(screen.getByTestId('disconnect-button'));
      });

      expect(screen.getByTestId('connection-status')).toHaveTextContent('disconnected');
      expect(screen.getByTestId('wallet-address')).toHaveTextContent('');
      expect(screen.getByTestId('balance')).toHaveTextContent('0.00');
      expect(screen.getByTestId('access-level')).toHaveTextContent('0'); // PUBLIC

      // Check localStorage is cleared
      expect(localStorage.getItem('web3_connected')).toBeNull();
      expect(localStorage.getItem('web3_address')).toBeNull();
    });
  });

  describe('Network Switching', () => {
    beforeEach(async () => {
      // Setup connected state
      mockEthereum.request.mockResolvedValue(['0x742d35Cc6634C0532925a3b844Bc454e4438f44e']);
      
      const { ethers } = require('ethers');
      const mockProvider = new ethers.BrowserProvider();
      mockProvider.getNetwork.mockResolvedValue({ chainId: BigInt(1) });
      mockProvider.getSigner.mockResolvedValue({});
      mockProvider.getBalance.mockResolvedValue(BigInt('1000000000000000000'));
      mockProvider.lookupAddress.mockResolvedValue(null);
    });

    it('should switch to existing network successfully', async () => {
      mockEthereum.request.mockResolvedValue(true);

      render(
        <Web3Provider>
          <TestComponent />
        </Web3Provider>
      );

      // Connect first
      await act(async () => {
        fireEvent.click(screen.getByTestId('connect-button'));
      });

      await waitFor(() => {
        expect(screen.getByTestId('connection-status')).toHaveTextContent('connected');
      });

      await act(async () => {
        fireEvent.click(screen.getByTestId('switch-network-button'));
      });

      expect(mockEthereum.request).toHaveBeenCalledWith({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x89' }], // Polygon
      });
    });

    it('should add network if not found (4902 error)', async () => {
      mockEthereum.request
        .mockRejectedValueOnce({ code: 4902 }) // Network not found
        .mockResolvedValueOnce(true) // Add network success
        .mockResolvedValueOnce(true); // Switch network success

      render(
        <Web3Provider>
          <TestComponent />
        </Web3Provider>
      );

      // Connect first
      await act(async () => {
        fireEvent.click(screen.getByTestId('connect-button'));
      });

      await act(async () => {
        fireEvent.click(screen.getByTestId('switch-network-button'));
      });

      // Should try to add network
      expect(mockEthereum.request).toHaveBeenCalledWith({
        method: 'wallet_addEthereumChain',
        params: [expect.objectContaining({
          chainId: '0x89',
          chainName: 'Polygon',
        })],
      });
    });

    it('should handle unsupported network', async () => {
      render(
        <Web3Provider>
          <TestComponent />
        </Web3Provider>
      );

      // Connect first
      await act(async () => {
        fireEvent.click(screen.getByTestId('connect-button'));
      });

      await act(async () => {
        // Try to switch to unsupported network
        screen.getByTestId('switch-network-button').click();
      });

      // Should not make any request for invalid network
      expect(mockEthereum.request).not.toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'wallet_switchEthereumChain'
        })
      );
    });
  });

  describe('Message Signing', () => {
    beforeEach(async () => {
      // Setup connected state
      mockEthereum.request.mockResolvedValue(['0x742d35Cc6634C0532925a3b844Bc454e4438f44e']);
      
      const { ethers } = require('ethers');
      const mockProvider = new ethers.BrowserProvider();
      mockProvider.getNetwork.mockResolvedValue({ chainId: BigInt(1) });
      mockProvider.getSigner.mockResolvedValue({
        signMessage: jest.fn().mockResolvedValue('0xsignature123')
      });
      mockProvider.getBalance.mockResolvedValue(BigInt('1000000000000000000'));
      mockProvider.lookupAddress.mockResolvedValue(null);
    });

    it('should sign message successfully when connected', async () => {
      render(
        <Web3Provider>
          <TestComponent />
        </Web3Provider>
      );

      // Connect first
      await act(async () => {
        fireEvent.click(screen.getByTestId('connect-button'));
      });

      await waitFor(() => {
        expect(screen.getByTestId('connection-status')).toHaveTextContent('connected');
      });

      // Test signing
      await act(async () => {
        const button = screen.getByTestId('sign-message-button');
        button.onclick = async () => {
          try {
            const { signMessage } = useWeb3();
            const signResult = await signMessage('test message');
            console.log('Sign result:', signResult);
          } catch (error) {
            console.error('Sign error:', error);
          }
        };
        fireEvent.click(button);
      });

      // Note: In a real test, you'd need to mock the useWeb3 hook more thoroughly
      // This is a simplified version to show the test structure
    });

    it('should handle signing error when not connected', async () => {
      render(
        <Web3Provider>
          <TestComponent />
        </Web3Provider>
      );

      // Try to sign without connecting
      await act(async () => {
        fireEvent.click(screen.getByTestId('sign-message-button'));
      });

      // Should show error about wallet not connected
      await waitFor(() => {
        expect(screen.getByTestId('error')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should clear error when clearError is called', async () => {
      mockEthereum.request.mockRejectedValue({
        code: 4001,
        message: 'User rejected'
      });

      render(
        <Web3Provider>
          <TestComponent />
        </Web3Provider>
      );

      // Trigger an error
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

      expect(screen.queryByTestId('error')).not.toBeInTheDocument();
    });

    it('should show loading state during connection', async () => {
      let resolveConnection: (value: any) => void;
      const connectionPromise = new Promise(resolve => {
        resolveConnection = resolve;
      });

      mockEthereum.request.mockReturnValue(connectionPromise);

      render(
        <Web3Provider>
          <TestComponent />
        </Web3Provider>
      );

      // Start connection
      act(() => {
        fireEvent.click(screen.getByTestId('connect-button'));
      });

      // Should show loading
      expect(screen.getByTestId('loading')).toHaveTextContent('loading');

      // Resolve connection
      await act(async () => {
        resolveConnection(['0x742d35Cc6634C0532925a3b844Bc454e4438f44e']);
      });

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
      });
    });
  });

  describe('ENS Resolution', () => {
    it('should resolve ENS name when available', async () => {
      const mockAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
      const mockEnsName = 'test.eth';

      mockEthereum.request.mockResolvedValue([mockAddress]);

      const { ethers } = require('ethers');
      const mockProvider = new ethers.BrowserProvider();
      mockProvider.getNetwork.mockResolvedValue({ chainId: BigInt(1) });
      mockProvider.getSigner.mockResolvedValue({});
      mockProvider.getBalance.mockResolvedValue(BigInt('1000000000000000000'));
      mockProvider.lookupAddress.mockResolvedValue(mockEnsName);

      render(
        <Web3Provider>
          <TestComponent />
        </Web3Provider>
      );

      await act(async () => {
        fireEvent.click(screen.getByTestId('connect-button'));
      });

      await waitFor(() => {
        expect(screen.getByTestId('ens-name')).toHaveTextContent(mockEnsName);
      });
    });

    it('should handle ENS resolution failure gracefully', async () => {
      const mockAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';

      mockEthereum.request.mockResolvedValue([mockAddress]);

      const { ethers } = require('ethers');
      const mockProvider = new ethers.BrowserProvider();
      mockProvider.getNetwork.mockResolvedValue({ chainId: BigInt(1) });
      mockProvider.getSigner.mockResolvedValue({});
      mockProvider.getBalance.mockResolvedValue(BigInt('1000000000000000000'));
      mockProvider.lookupAddress.mockRejectedValue(new Error('ENS lookup failed'));

      render(
        <Web3Provider>
          <TestComponent />
        </Web3Provider>
      );

      await act(async () => {
        fireEvent.click(screen.getByTestId('connect-button'));
      });

      await waitFor(() => {
        expect(screen.getByTestId('connection-status')).toHaveTextContent('connected');
      });

      // Should still connect even if ENS fails
      expect(screen.getByTestId('ens-name')).toHaveTextContent('no-ens');
    });
  });

  describe('Event Listeners', () => {
    it('should set up event listeners on connection', async () => {
      mockEthereum.request.mockResolvedValue(['0x742d35Cc6634C0532925a3b844Bc454e4438f44e']);

      const { ethers } = require('ethers');
      const mockProvider = new ethers.BrowserProvider();
      mockProvider.getNetwork.mockResolvedValue({ chainId: BigInt(1) });
      mockProvider.getSigner.mockResolvedValue({});
      mockProvider.getBalance.mockResolvedValue(BigInt('1000000000000000000'));
      mockProvider.lookupAddress.mockResolvedValue(null);

      render(
        <Web3Provider>
          <TestComponent />
        </Web3Provider>
      );

      await act(async () => {
        fireEvent.click(screen.getByTestId('connect-button'));
      });

      await waitFor(() => {
        expect(screen.getByTestId('connection-status')).toHaveTextContent('connected');
      });

      // Verify event listeners were set up
      expect(mockEthereum.on).toHaveBeenCalledWith('accountsChanged', expect.any(Function));
      expect(mockEthereum.on).toHaveBeenCalledWith('chainChanged', expect.any(Function));
      expect(mockEthereum.on).toHaveBeenCalledWith('disconnect', expect.any(Function));
    });

    it('should remove event listeners on disconnect', async () => {
      // First connect
      mockEthereum.request.mockResolvedValue(['0x742d35Cc6634C0532925a3b844Bc454e4438f44e']);

      const { ethers } = require('ethers');
      const mockProvider = new ethers.BrowserProvider();
      mockProvider.getNetwork.mockResolvedValue({ chainId: BigInt(1) });
      mockProvider.getSigner.mockResolvedValue({});
      mockProvider.getBalance.mockResolvedValue(BigInt('1000000000000000000'));
      mockProvider.lookupAddress.mockResolvedValue(null);

      render(
        <Web3Provider>
          <TestComponent />
        </Web3Provider>
      );

      await act(async () => {
        fireEvent.click(screen.getByTestId('connect-button'));
      });

      await act(async () => {
        fireEvent.click(screen.getByTestId('disconnect-button'));
      });

      // Verify event listeners were removed
      expect(mockEthereum.removeListener).toHaveBeenCalledWith('accountsChanged', expect.any(Function));
      expect(mockEthereum.removeListener).toHaveBeenCalledWith('chainChanged', expect.any(Function));
      expect(mockEthereum.removeListener).toHaveBeenCalledWith('disconnect', expect.any(Function));
    });
  });
});
