import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../contexts/Web3Context';
import '../assets/styles/components/profile-page.css';

/**
 * ProfilePage component for user profile management
 * Includes enhanced Web3 wallet connection functionality
 * Optimized for wide desktop screens with sidebar layout
 * Uses Web3Context for wallet state management
 */
const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    isConnected, 
    walletAddress, 
    networkName,
    networkId,
    balance,
    connectWallet, 
    disconnectWallet,
    switchNetwork
  } = useWeb3();
  
  const [activeSection, setActiveSection] = useState('wallet');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Simulate transaction history based on connected state
  useEffect(() => {
    if (isConnected) {
      // Mock transaction history
      setTransactions([
        { hash: '0x3a8e...7f2d', type: 'Send', amount: `0.1 ${networkName.split(' ')[0]}`, time: '2 hours ago', status: 'Confirmed' },
        { hash: '0xc72d...9e4c', type: 'Receive', amount: `0.5 ${networkName.split(' ')[0]}`, time: '1 day ago', status: 'Confirmed' },
        { hash: '0x8f1e...2a3b', type: 'Contract', amount: `0.05 ${networkName.split(' ')[0]}`, time: '3 days ago', status: 'Confirmed' }
      ]);
    } else {
      setTransactions([]);
    }
  }, [isConnected, networkName]);

  const handleConnectWallet = async () => {
    // Call the connectWallet function from Web3Context with loading state
    setIsLoading(true);
    try {
      await connectWallet();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnectWallet = () => {
    setIsLoading(true);
    try {
      disconnectWallet();
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/');
  };
  
  const handleSectionChange = (section: string) => {
    setActiveSection(section);
  };

  const handleNetworkChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newNetworkId = parseInt(e.target.value, 10);
    switchNetwork(newNetworkId);
  };

  // Available networks for dropdown
  const networks = [
    { id: 1, name: 'Ethereum', fullName: 'Ethereum Mainnet' },
    { id: 137, name: 'Polygon', fullName: 'Polygon Mainnet' },
    { id: 56, name: 'BSC', fullName: 'Binance Smart Chain' },
    { id: 42161, name: 'Arbitrum', fullName: 'Arbitrum One' }
  ];

  return (
    <div className="profile-page">
      <div className="profile-page-header">
        <button className="back-button" onClick={handleBack}>← Back to Dashboard</button>
        <h1>Tactical Operator Profile</h1>
        <p>Manage your identification and access to secure tactical intelligence networks</p>
      </div>

      <div className="profile-content">
        {/* Profile Sidebar */}
        <div className="profile-sidebar">
          <div className="profile-avatar-container">
            <div className="profile-avatar">
              {isConnected ? walletAddress.substring(0, 2) : "OP"}
            </div>
            <h3>Tactical Operator</h3>
            <p className="profile-status">
              {isConnected ? (
                <>
                  <span className="status-indicator connected"></span>
                  Connected to {networkName}
                </>
              ) : (
                <>
                  <span className="status-indicator disconnected"></span>
                  Offline
                </>
              )}
            </p>
            
            <div className="profile-stats">
              <div className="stat-item">
                <div className="stat-value">42</div>
                <div className="stat-label">Feeds</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">128</div>
                <div className="stat-label">Reports</div>
              </div>
            </div>
          </div>
          
          <div className="profile-nav">
            <button 
              className={`profile-nav-item ${activeSection === 'wallet' ? 'active' : ''}`} 
              onClick={() => handleSectionChange('wallet')}
            >
              🔐 Secure Connection
            </button>
            <button 
              className={`profile-nav-item ${activeSection === 'info' ? 'active' : ''}`}
              onClick={() => handleSectionChange('info')}
            >
              👤 Operator Info
            </button>
            <button 
              className={`profile-nav-item ${activeSection === 'security' ? 'active' : ''}`}
              onClick={() => handleSectionChange('security')}
            >
              🛡️ Security Settings
            </button>
            <button 
              className={`profile-nav-item ${activeSection === 'preferences' ? 'active' : ''}`}
              onClick={() => handleSectionChange('preferences')}
            >
              ⚙️ Interface Preferences
            </button>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="profile-main">
          <div className="profile-sections-grid">
            {/* Web3 Connection Section */}
            {activeSection === 'wallet' && (
              <div className="profile-section">
                <h2>Secure Web3 Authentication</h2>
                
                {!isConnected ? (
                  <div className="connect-options">
                    <p>Connect your wallet to access decentralized tactical assets and intelligence networks</p>
                    <button 
                      className="connect-wallet-button" 
                      onClick={handleConnectWallet}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Connecting...' : 'Connect Secure Wallet'}
                    </button>
                    <div className="supported-wallets">
                      <small>Supported wallets: MetaMask, WalletConnect, Trust Wallet</small>
                    </div>
                  </div>
                ) : (
                  <div className="connected-wallet">
                    <div className="wallet-header">
                      <div className="wallet-network">
                        <span className="network-indicator" data-network={networkName.split(' ')[0].toLowerCase()}></span>
                        <select 
                          className="network-selector" 
                          value={networkId}
                          onChange={handleNetworkChange}
                        >
                          {networks.map(network => (
                            <option key={network.id} value={network.id}>
                              {network.fullName}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="wallet-balance">
                        <span className="balance-value">{balance}</span>
                        <span className="balance-currency">{networkName.split(' ')[0]}</span>
                      </div>
                    </div>
                    
                    <div className="wallet-address-container">
                      <p>Connected Tactical Wallet:</p>
                      <div className="wallet-address">
                        <span className="address-text">{walletAddress}</span>
                        <button 
                          className="copy-address-button" 
                          onClick={() => {
                            navigator.clipboard.writeText(walletAddress);
                            alert('Address copied to clipboard');
                          }}
                          title="Copy address"
                        >
                          📋
                        </button>
                      </div>
                    </div>
                    
                    {transactions.length > 0 && (
                      <div className="transaction-history">
                        <h3>Recent Transactions</h3>
                        <div className="transaction-list">
                          {transactions.map((tx, index) => (
                            <div key={index} className="transaction-item">
                              <div className="transaction-type">{tx.type}</div>
                              <div className="transaction-amount">{tx.amount}</div>
                              <div className="transaction-time">{tx.time}</div>
                              <div className="transaction-status">{tx.status}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="wallet-actions">
                      <button 
                        className="disconnect-wallet-button" 
                        onClick={handleDisconnectWallet}
                        disabled={isLoading}
                      >
                        {isLoading ? 'Disconnecting...' : 'Disconnect Secure Wallet'}
                      </button>
                      
                      <button 
                        className="wallet-action-button"
                        onClick={() => {
                          const baseUrl = networkId === 1 ? 'https://etherscan.io/address/' :
                                          networkId === 137 ? 'https://polygonscan.com/address/' :
                                          networkId === 56 ? 'https://bscscan.com/address/' :
                                          'https://arbiscan.io/address/';
                          window.open(baseUrl + walletAddress, '_blank');
                        }}
                      >
                        View on Explorer
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Operator Information Section */}
            {activeSection === 'info' && (
              <div className="profile-section">
                <h2>Operator Information</h2>
                <div className="profile-form">
                  <div className="form-group">
                    <label htmlFor="displayName">Tactical Callsign</label>
                    <input type="text" id="displayName" className="form-control" defaultValue="Tactical Operator" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Secure Contact</label>
                    <input type="email" id="email" className="form-control" defaultValue="operator@tactical-intel.com" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="role">Operational Role</label>
                    <input type="text" id="role" className="form-control" defaultValue="Intelligence Analyst" readOnly />
                  </div>
                  <button className="btn-primary">Update Profile</button>
                </div>
              </div>
            )}

            {/* Security Section */}
            {activeSection === 'security' && (
              <div className="profile-section">
                <h2>Security Parameters</h2>
                <div className="profile-form">
                  <div className="form-group">
                    <label htmlFor="currentPassword">Current Access Code</label>
                    <input type="password" id="currentPassword" className="form-control" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="newPassword">New Access Code</label>
                    <input type="password" id="newPassword" className="form-control" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm New Access Code</label>
                    <input type="password" id="confirmPassword" className="form-control" />
                  </div>
                  <button className="btn-primary">Update Security</button>
                </div>
              </div>
            )}

            {/* Preferences Section */}
            {activeSection === 'preferences' && (
              <div className="profile-section">
                <h2>Interface Preferences</h2>
                <div className="profile-form">
                  <div className="form-group">
                    <label htmlFor="theme">Tactical Interface Theme</label>
                    <select id="theme" className="form-control">
                      <option value="dark">Dark Ops (Default)</option>
                      <option value="light">Daylight Operations</option>
                      <option value="contrast">High Contrast Tactical</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="timezone">Operational Timezone</label>
                    <select id="timezone" className="form-control">
                      <option value="UTC">UTC (Universal)</option>
                      <option value="EST">Eastern Standard (UTC-5)</option>
                      <option value="CST">Central Standard (UTC-6)</option>
                      <option value="PST">Pacific Standard (UTC-8)</option>
                    </select>
                  </div>
                  <div className="form-check">
                    <input type="checkbox" id="notifications" className="form-check-input" defaultChecked />
                    <label htmlFor="notifications" className="form-check-label">Enable Tactical Alerts</label>
                  </div>
                  <button className="btn-primary">Save Preferences</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
