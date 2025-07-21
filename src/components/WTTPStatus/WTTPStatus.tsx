import React, { useState, useEffect } from 'react';
import './WTTPStatus.css';

interface WTTPConfig {
  enabled: boolean;
  siteAddress: string;
  network: string;
}

interface WTTPStatusProps {
  className?: string;
}

const WTTPStatus: React.FC<WTTPStatusProps> = ({ className = '' }) => {
  const [wttpConfig, setWTTPConfig] = useState<WTTPConfig>({
    enabled: false,
    siteAddress: '',
    network: 'sepolia'
  });
  
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const config: WTTPConfig = {
      enabled: process.env.VITE_WTTP_MODE === 'true',
      siteAddress: process.env.VITE_WTTP_SITE_ADDRESS || '',
      network: process.env.VITE_WTTP_NETWORK || 'sepolia'
    };
    
    setWTTPConfig(config);
  }, []);

  if (!wttpConfig.enabled || !wttpConfig.siteAddress) {
    return null;
  }

  const wttpUrl = `wttp://${wttpConfig.siteAddress}/`;
  const explorerUrl = wttpConfig.network === 'mainnet' 
    ? `https://etherscan.io/address/${wttpConfig.siteAddress}`
    : `https://sepolia.etherscan.io/address/${wttpConfig.siteAddress}`;

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(wttpConfig.siteAddress);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(wttpUrl);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  return (
    <div className={`wttp-status ${className}`}>
      <div 
        className="wttp-status-header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="wttp-indicator">
          <span className="wttp-dot"></span>
          <span className="wttp-label">WTTP</span>
        </div>
        <span className="wttp-network">{wttpConfig.network}</span>
        <span className={`wttp-expand ${isExpanded ? 'expanded' : ''}`}>
          ▼
        </span>
      </div>
      
      {isExpanded && (
        <div className="wttp-status-details">
          <div className="wttp-info-section">
            <h4>Decentralized Hosting</h4>
            <p>This site is hosted on WTTP (Web3 Transfer Protocol)</p>
          </div>
          
          <div className="wttp-info-section">
            <label>Contract Address:</label>
            <div className="wttp-address-row">
              <code className="wttp-address">
                {wttpConfig.siteAddress.slice(0, 6)}...{wttpConfig.siteAddress.slice(-4)}
              </code>
              <button 
                className="wttp-copy-btn"
                onClick={handleCopyAddress}
                title="Copy contract address"
              >
                📋
              </button>
            </div>
          </div>
          
          <div className="wttp-info-section">
            <label>WTTP URL:</label>
            <div className="wttp-address-row">
              <code className="wttp-url">
                wttp://{wttpConfig.siteAddress.slice(0, 8)}...
              </code>
              <button 
                className="wttp-copy-btn"
                onClick={handleCopyUrl}
                title="Copy WTTP URL"
              >
                📋
              </button>
            </div>
          </div>
          
          <div className="wttp-actions">
            <a 
              href={explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="wttp-link"
            >
              View on Explorer
            </a>
            <a 
              href="https://docs.wttp.tech"
              target="_blank"
              rel="noopener noreferrer"
              className="wttp-link"
            >
              Learn about WTTP
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default WTTPStatus;
