// src/hooks/useTransaction.ts
import { TransactionReceipt,TransactionResponse } from 'ethers';
import { useCallback,useState } from 'react';

import { Web3Error, Web3ErrorType } from '../types/web3Errors';

export interface TransactionState {
  isLoading: boolean;
  hash?: string;
  confirmations: number;
  error?: Web3Error;
  receipt?: TransactionReceipt;
  gasUsed?: bigint;
  effectiveGasPrice?: bigint;
}

export interface TransactionOptions {
  requiredConfirmations?: number;
  timeout?: number; // in milliseconds
  onTxHash?: (hash: string) => void;
  onConfirmation?: (confirmations: number) => void;
}

export const useTransaction = () => {
  const [state, setState] = useState<TransactionState>({
    isLoading: false,
    confirmations: 0
  });

  const executeTransaction = useCallback(async (
    transactionFunction: () => Promise<TransactionResponse>,
    options: TransactionOptions = {}
  ): Promise<TransactionReceipt> => {
    const {
      requiredConfirmations = 1,
      timeout = 300000, // 5 minutes default
      onTxHash,
      onConfirmation
    } = options;

    setState(prev => ({ 
      ...prev, 
      isLoading: true, 
      // omit optional fields instead of forcing undefined
      confirmations: 0
    }));
    
    try {
      // Execute the transaction function
      const tx = await transactionFunction();
      
      setState(prev => ({ ...prev, hash: tx.hash }));
      onTxHash?.(tx.hash);
      
      // Create a timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Web3Error(
            Web3ErrorType.PROVIDER_ERROR,
            `Transaction timeout after ${timeout / 1000} seconds`
          ));
        }, timeout);
      });

      // Wait for transaction receipt with timeout
      const receipt = await Promise.race([
        tx.wait(requiredConfirmations),
        timeoutPromise
      ]);

      if (!receipt) {
        throw new Web3Error(
          Web3ErrorType.PROVIDER_ERROR,
          'Transaction receipt not received'
        );
      }

      // Check if transaction was successful
      if (receipt.status === 0) {
        throw new Web3Error(
          Web3ErrorType.CONTRACT_ERROR,
          'Transaction failed during execution'
        );
      }

      // Get confirmation count (ethers v6 returns a function)
      const confirmationCount = await receipt.confirmations();

      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        confirmations: confirmationCount,
        receipt,
        gasUsed: receipt.gasUsed,
        effectiveGasPrice: receipt.gasPrice
      }));

      onConfirmation?.(confirmationCount);
      
      return receipt;
    } catch (error: any) {
      const web3Error = error instanceof Web3Error 
        ? error 
        : Web3Error.fromEthereumError(error);

      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: web3Error
      }));
      
      throw web3Error;
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      confirmations: 0
    });
  }, []);

  return {
    ...state,
    executeTransaction,
    reset
  };
};
