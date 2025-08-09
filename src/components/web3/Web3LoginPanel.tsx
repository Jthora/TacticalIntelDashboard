import './Web3LoginPanel.css';

import React, { useState } from 'react';

import { AccessLevel,useWeb3 } from '../../contexts/Web3Context';

/**
 * MVP Web3 Login Panel
 * Clean, functional authentication interface
 * Focuses on core login/logout functionality without bloat
 */
const Web3LoginPanel: React.FC = () => {
  const { 
    isConnected, 
    walletAddress, 
    networkName,
    balance,
    ensName,
    accessLevel,
    connectWallet, 
    disconnectWallet
  } = useWeb3();
  
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      await connectWallet();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
  };

  const getAccessLevelName = (level: AccessLevel): string => {
    switch (level) {
      case AccessLevel.DIRECTOR: return 'Director';
      case AccessLevel.COMMANDER: return 'Commander';
      case AccessLevel.ANALYST: return 'Analyst';
      case AccessLevel.FIELD_OPERATIVE: return 'Field Operative';
      case AccessLevel.PUBLIC:
      default: return 'Public User';
    }
  };

  const getAccessLevelColor = (level: AccessLevel): string => {
    switch (level) {
      case AccessLevel.DIRECTOR: return '#ff3333';
      case AccessLevel.COMMANDER: return '#ff6600';
      case AccessLevel.ANALYST: return '#0099ff';
      case AccessLevel.FIELD_OPERATIVE: return '#00ff41';
      case AccessLevel.PUBLIC:
      default: return '#666666';
    }
  };

  if (!isConnected) {
    return (
      <div className="web3-login-panel">
        <div className="login-card tactical-module">
          <div className="login-header tactical-header">
            <h2>
              <span className="tactical-icon">🔐</span>
              Tactical Authentication
            </h2>
            <p>Connect your wallet to access secure intelligence networks</p>
          </div>
          
          <div className="login-content tactical-content">
            <button 
              className="connect-button btn-primary"
              onClick={handleConnect}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="loading-spinner"></span>
                  Connecting...
                </>
              ) : (
                <>
                  <span className="wallet-icon">🚀</span>
                  Connect Wallet
                </>
              )}
            </button>
            
            <div className="supported-wallets">
              <p>Supported:</p>
              <div className="wallet-icons">
                <span title="MetaMask">🦊</span>
                <span title="WalletConnect">🔗</span>
                <span title="Trust Wallet">🛡️</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="web3-login-panel">
      <div className="connected-card tactical-module">
        <div className="tactical-header">
          <h3>
            <span className="tactical-icon">🔐</span>
            Tactical Authentication
          </h3>
        </div>
        
        <div className="tactical-content">
          <div className="connection-status">
            <div className="status-indicator"></div>
            <span>Authenticated</span>
          </div>
          
          <div className="wallet-info">
            <div className="wallet-avatar">
              {ensName ? ensName.charAt(0).toUpperCase() : walletAddress.substring(2, 4).toUpperCase()}
            </div>
            
            <div className="wallet-details">
              <div className="wallet-name">
                {ensName || 'Tactical Operator'}
              </div>
              <div className="wallet-address">
                {walletAddress.substring(0, 6)}...{walletAddress.substring(-4)}
              </div>
              <div className="wallet-network">
                <span className="network-dot" data-network={networkName.toLowerCase()}></span>
                {networkName}
              </div>
            </div>
            
            <div className="wallet-balance">
              <div className="balance-value">{balance}</div>
              <div className="balance-currency">{networkName.split(' ')[0]}</div>
            </div>
          </div>
          
          <div className="access-level-indicator">
            <div 
              className="access-badge"
              style={{ color: getAccessLevelColor(accessLevel) }}
            >
              <span className="access-icon">⭐</span>
              {getAccessLevelName(accessLevel)}
            </div>
          </div>
          
          <div className="wallet-actions">
            <button 
              className="action-button secondary"
              onClick={() => {
                navigator.clipboard.writeText(walletAddress);
                // Could add a toast notification here
              }}
            >
              📋 Copy Address
            </button>
            
            <button 
              className="action-button secondary"
              onClick={() => {
                const explorerUrl = networkName.includes('Ethereum') ? 
                  `https://etherscan.io/address/${walletAddress}` :
                  `https://polygonscan.com/address/${walletAddress}`;
                window.open(explorerUrl, '_blank');
              }}
            >
              🔍 View Explorer
            </button>
            
            <button 
              className="action-button danger"
              onClick={handleDisconnect}
            >
              🚪 Disconnect
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Web3LoginPanel;
