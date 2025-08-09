// src/hooks/__tests__/useTransaction.test.ts
import { act,renderHook } from '@testing-library/react';

import { Web3Error, Web3ErrorType } from '../../types/web3Errors';
import { useTransaction } from '../useTransaction';

// Mock ethers
const mockTx = {
  hash: '0x123456789abcdef',
  wait: jest.fn()
};

const mockReceipt = {
  status: 1,
  confirmations: jest.fn().mockResolvedValue(3),
  gasUsed: BigInt('21000'),
  gasPrice: BigInt('20000000000')
};

describe('useTransaction', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useTransaction());

      expect(result.current.isLoading).toBe(false);
      expect(result.current.hash).toBeUndefined();
      expect(result.current.confirmations).toBe(0);
      expect(result.current.error).toBeUndefined();
      expect(result.current.receipt).toBeUndefined();
      expect(result.current.gasUsed).toBeUndefined();
      expect(result.current.effectiveGasPrice).toBeUndefined();
    });
  });

  describe('executeTransaction', () => {
    it('should execute transaction successfully', async () => {
      mockTx.wait.mockResolvedValue(mockReceipt);

      const { result } = renderHook(() => useTransaction());

      const mockTransactionFunction = jest.fn().mockResolvedValue(mockTx);

      let transactionResult: any;
      await act(async () => {
        transactionResult = await result.current.executeTransaction(mockTransactionFunction);
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.hash).toBe('0x123456789abcdef');
      expect(result.current.confirmations).toBe(3);
      expect(result.current.error).toBeUndefined();
      expect(result.current.receipt).toBe(mockReceipt);
      expect(result.current.gasUsed).toBe(BigInt('21000'));
      expect(result.current.effectiveGasPrice).toBe(BigInt('20000000000'));
      expect(transactionResult).toBe(mockReceipt);
    });

    it('should set loading state during transaction', async () => {
      let resolveTransaction: (value: any) => void;
      const transactionPromise = new Promise(resolve => {
        resolveTransaction = resolve;
      });

      const { result } = renderHook(() => useTransaction());

      const mockTransactionFunction = jest.fn().mockReturnValue(transactionPromise);

      // Start transaction
      act(() => {
        result.current.executeTransaction(mockTransactionFunction);
      });

      // Should be loading
      expect(result.current.isLoading).toBe(true);
      expect(result.current.error).toBeUndefined();
      expect(result.current.hash).toBeUndefined();

      // Resolve transaction
      await act(async () => {
        resolveTransaction(mockTx);
        mockTx.wait.mockResolvedValue(mockReceipt);
      });

      expect(result.current.isLoading).toBe(false);
    });

    it('should call onTxHash callback when transaction is submitted', async () => {
      mockTx.wait.mockResolvedValue(mockReceipt);
      const onTxHash = jest.fn();

      const { result } = renderHook(() => useTransaction());

      const mockTransactionFunction = jest.fn().mockResolvedValue(mockTx);

      await act(async () => {
        await result.current.executeTransaction(mockTransactionFunction, { onTxHash });
      });

      expect(onTxHash).toHaveBeenCalledWith('0x123456789abcdef');
    });

    it('should call onConfirmation callback when transaction is confirmed', async () => {
      mockTx.wait.mockResolvedValue(mockReceipt);
      const onConfirmation = jest.fn();

      const { result } = renderHook(() => useTransaction());

      const mockTransactionFunction = jest.fn().mockResolvedValue(mockTx);

      await act(async () => {
        await result.current.executeTransaction(mockTransactionFunction, { onConfirmation });
      });

      expect(onConfirmation).toHaveBeenCalledWith(3);
    });

    it('should handle transaction failure during execution', async () => {
      const error = new Error('Transaction failed');
      const mockTransactionFunction = jest.fn().mockRejectedValue(error);

      const { result } = renderHook(() => useTransaction());

      let thrownError: any;
      await act(async () => {
        try {
          await result.current.executeTransaction(mockTransactionFunction);
        } catch (e) {
          thrownError = e;
        }
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeInstanceOf(Web3Error);
      expect(result.current.error?.type).toBe(Web3ErrorType.PROVIDER_ERROR);
      expect(thrownError).toBeInstanceOf(Web3Error);
    });

    it('should handle transaction failure with status 0', async () => {
      const failedReceipt = {
        ...mockReceipt,
        status: 0 // Failed transaction
      };
      mockTx.wait.mockResolvedValue(failedReceipt);

      const { result } = renderHook(() => useTransaction());

      const mockTransactionFunction = jest.fn().mockResolvedValue(mockTx);

      let thrownError: any;
      await act(async () => {
        try {
          await result.current.executeTransaction(mockTransactionFunction);
        } catch (e) {
          thrownError = e;
        }
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeInstanceOf(Web3Error);
      expect(result.current.error?.type).toBe(Web3ErrorType.CONTRACT_ERROR);
      expect(result.current.error?.message).toBe('Transaction failed during execution');
      expect(thrownError).toBeInstanceOf(Web3Error);
    });

    it('should handle timeout', async () => {
      // Mock transaction that never resolves
      const neverResolvingPromise = new Promise(() => {});
      mockTx.wait.mockReturnValue(neverResolvingPromise);

      const { result } = renderHook(() => useTransaction());

      const mockTransactionFunction = jest.fn().mockResolvedValue(mockTx);

      let thrownError: any;
      await act(async () => {
        try {
          await result.current.executeTransaction(mockTransactionFunction, { timeout: 100 });
        } catch (e) {
          thrownError = e;
        }
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeInstanceOf(Web3Error);
      expect(result.current.error?.type).toBe(Web3ErrorType.PROVIDER_ERROR);
      expect(result.current.error?.message).toContain('Transaction timeout');
      expect(thrownError).toBeInstanceOf(Web3Error);
    }, 10000);

    it('should handle missing receipt', async () => {
      mockTx.wait.mockResolvedValue(null);

      const { result } = renderHook(() => useTransaction());

      const mockTransactionFunction = jest.fn().mockResolvedValue(mockTx);

      let thrownError: any;
      await act(async () => {
        try {
          await result.current.executeTransaction(mockTransactionFunction);
        } catch (e) {
          thrownError = e;
        }
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeInstanceOf(Web3Error);
      expect(result.current.error?.type).toBe(Web3ErrorType.PROVIDER_ERROR);
      expect(result.current.error?.message).toBe('Transaction receipt not received');
      expect(thrownError).toBeInstanceOf(Web3Error);
    });

    it('should use custom required confirmations', async () => {
      const customReceipt = {
        ...mockReceipt,
        confirmations: jest.fn().mockResolvedValue(5)
      };
      mockTx.wait.mockResolvedValue(customReceipt);

      const { result } = renderHook(() => useTransaction());

      const mockTransactionFunction = jest.fn().mockResolvedValue(mockTx);

      await act(async () => {
        await result.current.executeTransaction(mockTransactionFunction, { requiredConfirmations: 3 });
      });

      expect(mockTx.wait).toHaveBeenCalledWith(3);
      expect(result.current.confirmations).toBe(5);
    });

    it('should preserve Web3Error type when thrown', async () => {
      const web3Error = new Web3Error(Web3ErrorType.TRANSACTION_REJECTED, 'User rejected');
      const mockTransactionFunction = jest.fn().mockRejectedValue(web3Error);

      const { result } = renderHook(() => useTransaction());

      let thrownError: any;
      await act(async () => {
        try {
          await result.current.executeTransaction(mockTransactionFunction);
        } catch (e) {
          thrownError = e;
        }
      });

      expect(result.current.error).toBe(web3Error);
      expect(thrownError).toBe(web3Error);
    });
  });

  describe('reset', () => {
    it('should reset state to initial values', async () => {
      mockTx.wait.mockResolvedValue(mockReceipt);

      const { result } = renderHook(() => useTransaction());

      // Execute a transaction first
      const mockTransactionFunction = jest.fn().mockResolvedValue(mockTx);
      await act(async () => {
        await result.current.executeTransaction(mockTransactionFunction);
      });

      // Verify state is populated
      expect(result.current.hash).toBe('0x123456789abcdef');
      expect(result.current.confirmations).toBe(3);

      // Reset
      act(() => {
        result.current.reset();
      });

      // Verify state is reset
      expect(result.current.isLoading).toBe(false);
      expect(result.current.hash).toBeUndefined();
      expect(result.current.confirmations).toBe(0);
      expect(result.current.error).toBeUndefined();
      expect(result.current.receipt).toBeUndefined();
      expect(result.current.gasUsed).toBeUndefined();
      expect(result.current.effectiveGasPrice).toBeUndefined();
    });
  });
});
