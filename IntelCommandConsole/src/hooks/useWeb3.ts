import { useContext } from 'react';
import Web3Context from '../contexts/Web3Context';

/**
 * Hook to access Web3 context for Ethereum connectivity
 * @returns Web3Context containing provider, signer, connected status, and account
 */
export const useWeb3 = () => {
  const context = useContext(Web3Context);
  
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  
  return context;
};
