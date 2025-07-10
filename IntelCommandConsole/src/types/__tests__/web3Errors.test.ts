// src/types/__tests__/web3Errors.test.ts
import { Web3Error, Web3ErrorType } from '../web3Errors';

describe('Web3Error', () => {
  describe('constructor', () => {
    it('should create Web3Error with type and message', () => {
      const error = new Web3Error(
        Web3ErrorType.WALLET_NOT_CONNECTED,
        'Wallet is not connected'
      );

      expect(error.type).toBe(Web3ErrorType.WALLET_NOT_CONNECTED);
      expect(error.message).toBe('Wallet is not connected');
      expect(error.name).toBe('Web3Error');
      expect(error.originalError).toBeUndefined();
      expect(error.code).toBeUndefined();
    });

    it('should create Web3Error with original error and code', () => {
      const originalError = new Error('Original error');
      const error = new Web3Error(
        Web3ErrorType.PROVIDER_ERROR,
        'Provider error',
        originalError,
        4001
      );

      expect(error.type).toBe(Web3ErrorType.PROVIDER_ERROR);
      expect(error.message).toBe('Provider error');
      expect(error.originalError).toBe(originalError);
      expect(error.code).toBe(4001);
    });
  });

  describe('fromEthereumError', () => {
    it('should convert user rejection error (4001)', () => {
      const ethereumError = {
        code: 4001,
        message: 'User rejected the request'
      };

      const web3Error = Web3Error.fromEthereumError(ethereumError);

      expect(web3Error.type).toBe(Web3ErrorType.TRANSACTION_REJECTED);
      expect(web3Error.message).toBe('User rejected the request');
      expect(web3Error.code).toBe(4001);
      expect(web3Error.originalError).toBe(ethereumError);
    });

    it('should convert wallet not connected error (4100)', () => {
      const ethereumError = {
        code: 4100,
        message: 'The requested account has not been authorized'
      };

      const web3Error = Web3Error.fromEthereumError(ethereumError);

      expect(web3Error.type).toBe(Web3ErrorType.WALLET_NOT_CONNECTED);
      expect(web3Error.message).toBe('Wallet is not connected');
      expect(web3Error.code).toBe(4100);
    });

    it('should convert pending request error (-32002)', () => {
      const ethereumError = {
        code: -32002,
        message: 'Request of type \'wallet_requestPermissions\' already pending'
      };

      const web3Error = Web3Error.fromEthereumError(ethereumError);

      expect(web3Error.type).toBe(Web3ErrorType.CONNECTION_ERROR);
      expect(web3Error.message).toBe('Request already pending. Please check your wallet.');
      expect(web3Error.code).toBe(-32002);
    });

    it('should convert network not added error (4902)', () => {
      const ethereumError = {
        code: 4902,
        message: 'Unrecognized chain ID'
      };

      const web3Error = Web3Error.fromEthereumError(ethereumError);

      expect(web3Error.type).toBe(Web3ErrorType.NETWORK_SWITCH_ERROR);
      expect(web3Error.message).toBe('Network not added to wallet');
      expect(web3Error.code).toBe(4902);
    });

    it('should detect insufficient funds from message', () => {
      const ethereumError = {
        message: 'insufficient funds for intrinsic transaction cost'
      };

      const web3Error = Web3Error.fromEthereumError(ethereumError);

      expect(web3Error.type).toBe(Web3ErrorType.INSUFFICIENT_FUNDS);
      expect(web3Error.message).toBe('Insufficient funds for transaction');
    });

    it('should detect network errors from message', () => {
      const ethereumError = {
        message: 'network connection error'
      };

      const web3Error = Web3Error.fromEthereumError(ethereumError);

      expect(web3Error.type).toBe(Web3ErrorType.PROVIDER_ERROR);
      expect(web3Error.message).toBe('Network connection error');
    });

    it('should default to provider error for unknown errors', () => {
      const ethereumError = {
        code: 9999,
        message: 'Unknown error'
      };

      const web3Error = Web3Error.fromEthereumError(ethereumError);

      expect(web3Error.type).toBe(Web3ErrorType.PROVIDER_ERROR);
      expect(web3Error.message).toBe('Unknown error');
    });

    it('should handle errors without message', () => {
      const ethereumError = {
        code: 9999
      };

      const web3Error = Web3Error.fromEthereumError(ethereumError);

      expect(web3Error.type).toBe(Web3ErrorType.PROVIDER_ERROR);
      expect(web3Error.message).toBe('Unknown Web3 error');
    });
  });

  describe('getUserFriendlyMessage', () => {
    it('should return user-friendly message for wallet not installed', () => {
      const error = new Web3Error(
        Web3ErrorType.WALLET_NOT_INSTALLED,
        'MetaMask not detected'
      );

      expect(error.getUserFriendlyMessage()).toBe(
        'Please install MetaMask or another Web3 wallet to continue.'
      );
    });

    it('should return user-friendly message for wallet not connected', () => {
      const error = new Web3Error(
        Web3ErrorType.WALLET_NOT_CONNECTED,
        'No accounts available'
      );

      expect(error.getUserFriendlyMessage()).toBe(
        'Please connect your wallet to access this feature.'
      );
    });

    it('should return user-friendly message for transaction rejected', () => {
      const error = new Web3Error(
        Web3ErrorType.TRANSACTION_REJECTED,
        'User rejected'
      );

      expect(error.getUserFriendlyMessage()).toBe(
        'Transaction was cancelled. Please try again if you want to proceed.'
      );
    });

    it('should return user-friendly message for network unsupported', () => {
      const error = new Web3Error(
        Web3ErrorType.NETWORK_UNSUPPORTED,
        'Chain not supported'
      );

      expect(error.getUserFriendlyMessage()).toBe(
        'This network is not supported. Please switch to a supported network.'
      );
    });

    it('should return user-friendly message for insufficient funds', () => {
      const error = new Web3Error(
        Web3ErrorType.INSUFFICIENT_FUNDS,
        'Not enough ETH'
      );

      expect(error.getUserFriendlyMessage()).toBe(
        'Insufficient funds to complete this transaction.'
      );
    });

    it('should return user-friendly message for connection error', () => {
      const error = new Web3Error(
        Web3ErrorType.CONNECTION_ERROR,
        'Network timeout'
      );

      expect(error.getUserFriendlyMessage()).toBe(
        'Connection error. Please check your internet connection and try again.'
      );
    });

    it('should return user-friendly message for network switch error', () => {
      const error = new Web3Error(
        Web3ErrorType.NETWORK_SWITCH_ERROR,
        'Cannot switch network'
      );

      expect(error.getUserFriendlyMessage()).toBe(
        'Unable to switch networks. Please manually switch in your wallet.'
      );
    });

    it('should return original message for unknown error types', () => {
      const error = new Web3Error(
        Web3ErrorType.PROVIDER_ERROR,
        'Custom error message'
      );

      expect(error.getUserFriendlyMessage()).toBe('Custom error message');
    });

    it('should return default message when no message is provided', () => {
      const error = new Web3Error(Web3ErrorType.PROVIDER_ERROR, '');

      expect(error.getUserFriendlyMessage()).toBe(
        'An unexpected error occurred. Please try again.'
      );
    });
  });
});
