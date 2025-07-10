// src/types/web3Errors.ts
export enum Web3ErrorType {
  WALLET_NOT_CONNECTED = 'WALLET_NOT_CONNECTED',
  WALLET_NOT_INSTALLED = 'WALLET_NOT_INSTALLED',
  NETWORK_UNSUPPORTED = 'NETWORK_UNSUPPORTED',
  TRANSACTION_REJECTED = 'TRANSACTION_REJECTED',
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  CONTRACT_ERROR = 'CONTRACT_ERROR',
  PROVIDER_ERROR = 'PROVIDER_ERROR',
  CONNECTION_ERROR = 'CONNECTION_ERROR',
  SIGNATURE_ERROR = 'SIGNATURE_ERROR',
  NETWORK_SWITCH_ERROR = 'NETWORK_SWITCH_ERROR'
}

export class Web3Error extends Error {
  constructor(
    public type: Web3ErrorType,
    message: string,
    public originalError?: any,
    public code?: number
  ) {
    super(message);
    this.name = 'Web3Error';
  }

  static fromEthereumError(error: any): Web3Error {
    // User rejected request
    if (error.code === 4001) {
      return new Web3Error(
        Web3ErrorType.TRANSACTION_REJECTED,
        'User rejected the request',
        error,
        4001
      );
    }

    // Unauthorized (no wallet)
    if (error.code === 4100) {
      return new Web3Error(
        Web3ErrorType.WALLET_NOT_CONNECTED,
        'Wallet is not connected',
        error,
        4100
      );
    }

    // Unsupported method
    if (error.code === 4200) {
      return new Web3Error(
        Web3ErrorType.PROVIDER_ERROR,
        'Unsupported method',
        error,
        4200
      );
    }

    // Chain disconnected
    if (error.code === 4900) {
      return new Web3Error(
        Web3ErrorType.CONNECTION_ERROR,
        'Chain is disconnected',
        error,
        4900
      );
    }

    // Chain not added to wallet
    if (error.code === 4902) {
      return new Web3Error(
        Web3ErrorType.NETWORK_SWITCH_ERROR,
        'Network not added to wallet',
        error,
        4902
      );
    }

    // Request pending
    if (error.code === -32002) {
      return new Web3Error(
        Web3ErrorType.CONNECTION_ERROR,
        'Request already pending. Please check your wallet.',
        error,
        -32002
      );
    }

    // Insufficient funds
    if (error.message?.includes('insufficient funds')) {
      return new Web3Error(
        Web3ErrorType.INSUFFICIENT_FUNDS,
        'Insufficient funds for transaction',
        error
      );
    }

    // Network error
    if (error.message?.includes('network')) {
      return new Web3Error(
        Web3ErrorType.PROVIDER_ERROR,
        'Network connection error',
        error
      );
    }

    // Default error
    return new Web3Error(
      Web3ErrorType.PROVIDER_ERROR,
      error.message || 'Unknown Web3 error',
      error
    );
  }

  getUserFriendlyMessage(): string {
    switch (this.type) {
      case Web3ErrorType.WALLET_NOT_INSTALLED:
        return 'Please install MetaMask or another Web3 wallet to continue.';
      case Web3ErrorType.WALLET_NOT_CONNECTED:
        return 'Please connect your wallet to access this feature.';
      case Web3ErrorType.TRANSACTION_REJECTED:
        return 'Transaction was cancelled. Please try again if you want to proceed.';
      case Web3ErrorType.NETWORK_UNSUPPORTED:
        return 'This network is not supported. Please switch to a supported network.';
      case Web3ErrorType.INSUFFICIENT_FUNDS:
        return 'Insufficient funds to complete this transaction.';
      case Web3ErrorType.CONNECTION_ERROR:
        return 'Connection error. Please check your internet connection and try again.';
      case Web3ErrorType.NETWORK_SWITCH_ERROR:
        return 'Unable to switch networks. Please manually switch in your wallet.';
      default:
        return this.message || 'An unexpected error occurred. Please try again.';
    }
  }
}
