import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../../contexts/Web3Context';

interface Web3ButtonProps {
  isConnected?: boolean;
  walletAddress?: string;
}

/**
 * Enhanced Web3Button component
 * Provides direct access to Web3 profile and wallet features
 * Now uses Web3Context for state management
 */
const Web3Button: React.FC = () => {
  const navigate = useNavigate();
  const { isConnected, walletAddress, networkName } = useWeb3();

  const handleClick = () => {
    navigate('/profile');
  };

  const shortenAddress = (address: string) => {
    if (!address) return '';
    return `${address.substring(0, 4)}...${address.substring(address.length - 4)}`;
  };

  return (
    <button
      className={`control-btn-micro web3-button ${isConnected ? 'connected' : ''}`}
      onClick={handleClick}
      aria-label={isConnected ? 'Wallet Connected' : 'Connect Wallet'}
      title={isConnected ? `Connected: ${shortenAddress(walletAddress)} on ${networkName}` : 'User Profile'}
    >
      {isConnected ? '🔐' : '👤'}
      {isConnected && <span className="connected-indicator" data-network={networkName}></span>}
      {isConnected && <span className="wallet-preview">{shortenAddress(walletAddress)}</span>}
    </button>
  );
};

export default Web3Button;
