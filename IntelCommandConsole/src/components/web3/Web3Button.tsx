import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../../contexts/Web3Context';

/**
 * Enhanced Web3Button component
 * Provides direct access to Web3 profile and wallet features
 * Now uses Web3Context for state management with real wallet connection
 * Displays ENS names when available
 */
const Web3Button: React.FC = () => {
  const navigate = useNavigate();
  const { isConnected, walletAddress, networkName, ensName } = useWeb3();

  const handleClick = () => {
    navigate('/profile');
  };

  const shortenAddress = (address: string) => {
    if (!address) return '';
    return `${address.substring(0, 4)}...${address.substring(address.length - 4)}`;
  };

  // Get display name - ENS if available, otherwise shortened address
  const displayName = ensName || shortenAddress(walletAddress);

  return (
    <button
      className={`control-btn-micro web3-button ${isConnected ? 'connected' : ''}`}
      onClick={handleClick}
      aria-label={isConnected ? 'Wallet Connected' : 'Connect Wallet'}
      title={isConnected ? `Connected: ${displayName} on ${networkName}` : 'User Profile'}
    >
      {isConnected ? '🔐' : '👤'}
      {isConnected && <span className="connected-indicator" data-network={networkName.toLowerCase().split(' ')[0]}></span>}
      {isConnected && <span className="wallet-preview">{displayName}</span>}
    </button>
  );
};

export default Web3Button;
