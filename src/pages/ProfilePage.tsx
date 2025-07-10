import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWeb3, AccessLevel } from '../contexts/Web3Context';
import { createVerificationMessage } from '../utils/signatureUtils';
import IPFSStoragePanel from '../components/ipfs/IPFSStoragePanel';
import ContentVerificationPanel from '../components/ipfs/ContentVerificationPanel';
import BatchVerificationPanel from '../components/ipfs/BatchVerificationPanel';
import ContractDeploymentPanel from '../components/admin/ContractDeploymentPanel';
import FeedSourceValidator from '../components/feed/FeedSourceValidator';
import '../assets/styles/components/profile-page.css';
import '../assets/styles/components/web3-verification.css';
import '../assets/styles/components/content-verification-panel.css';
import '../assets/styles/components/feed-source-validator.css';
import '../assets/styles/components/batch-verification-panel.css';
import '../assets/styles/components/contract-deployment-panel.css';

/**
 * ProfilePage component for user profile management
 * Enhanced with real Web3 wallet connection functionality
 * Supports ENS name resolution and transaction history
 * Implements source verification features
 */
const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    isConnected, 
    walletAddress, 
    networkName,
    networkId,
    balance,
    ensName,
    accessLevel,
    connectWallet, 
    disconnectWallet,
    switchNetwork,
    signMessage
  } = useWeb3();
  
  const [activeSection, setActiveSection] = useState('wallet');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState('');
  const [signature, setSignature] = useState('');
  const [isSigning, setIsSigning] = useState(false);

  // Initialize with a default verification message
  useEffect(() => {
    setVerificationMessage(createVerificationMessage("I am an authorized Earth Alliance operative with access to tactical intelligence systems."));
  }, []);

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

  const handleNetworkChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newNetworkId = parseInt(e.target.value, 10);
    try {
      await switchNetwork(newNetworkId);
    } catch (error) {
      console.error('Error switching networks:', error);
    }
  };

  const handleSignMessage = async () => {
    if (!verificationMessage) {
      alert('Please enter a message to sign');
      return;
    }
    
    setIsSigning(true);
    try {
      const sig = await signMessage(verificationMessage);
      setSignature(sig);
    } catch (error) {
      console.error('Error signing message:', error);
      alert('Failed to sign message. Please try again.');
    } finally {
      setIsSigning(false);
    }
  };

  const getAccessLevelName = (level: AccessLevel): string => {
    switch (level) {
      case AccessLevel.DIRECTOR:
        return 'Director';
      case AccessLevel.COMMANDER:
        return 'Commander';
      case AccessLevel.ANALYST:
        return 'Analyst';
      case AccessLevel.FIELD_OPERATIVE:
        return 'Field Operative';
      case AccessLevel.PUBLIC:
      default:
        return 'Public User';
    }
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
            <h3>{ensName || 'Tactical Operator'}</h3>
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
              className={`profile-nav-item ${activeSection === 'verification' ? 'active' : ''}`}
              onClick={() => handleSectionChange('verification')}
            >
              ✓ Source Verification
            </button>
            <button 
              className={`profile-nav-item ${activeSection === 'storage' ? 'active' : ''}`}
              onClick={() => handleSectionChange('storage')}
            >
              🗄️ Decentralized Storage
            </button>
            <button 
              className={`profile-nav-item ${activeSection === 'verification-content' ? 'active' : ''}`}
              onClick={() => handleSectionChange('verification-content')}
            >
              🔏 Content Verification
            </button>
            <button 
              className={`profile-nav-item ${activeSection === 'feed-validation' ? 'active' : ''}`}
              onClick={() => handleSectionChange('feed-validation')}
            >
              📰 Feed Source Validation
            </button>
            <button 
              className={`profile-nav-item ${activeSection === 'batch-verification' ? 'active' : ''}`}
              onClick={() => handleSectionChange('batch-verification')}
            >
              �� Batch Verification
            </button>
            {accessLevel <= AccessLevel.COMMANDER && (
              <button 
                className={`profile-nav-item ${activeSection === 'contract-deployment' ? 'active' : ''}`}
                onClick={() => handleSectionChange('contract-deployment')}
              >
                🔧 Contract Deployment
              </button>
            )}
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
                      {ensName && (
                        <div className="ens-name">
                          <span className="ens-label">ENS Name:</span>
                          <span className="ens-value">{ensName}</span>
                        </div>
                      )}
                    </div>

                    <div className="access-level">
                      <span className="access-label">Access Level:</span>
                      <span className={`access-value level-${accessLevel}`}>
                        {getAccessLevelName(accessLevel)}
                      </span>
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

            {/* Verification Section */}
            {activeSection === 'verification' && (
              <div className="profile-section">
                <h2>Source Verification</h2>
                
                {!isConnected ? (
                  <div className="verification-notice">
                    <p>Connect your wallet to access source verification features</p>
                    <button 
                      className="connect-wallet-button" 
                      onClick={handleConnectWallet}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Connecting...' : 'Connect Secure Wallet'}
                    </button>
                  </div>
                ) : (
                  <div className="verification-panel">
                    <p>Sign messages to verify your identity and intelligence reports</p>
                    
                    <div className="verification-form">
                      <div className="form-group">
                        <label htmlFor="verificationMessage">Message to sign:</label>
                        <textarea 
                          id="verificationMessage" 
                          className="form-control" 
                          value={verificationMessage}
                          onChange={(e) => setVerificationMessage(e.target.value)}
                          placeholder="Enter message to cryptographically sign..."
                          rows={3}
                        />
                      </div>
                      
                      <button 
                        className="sign-button"
                        onClick={handleSignMessage}
                        disabled={isSigning || !verificationMessage}
                      >
                        {isSigning ? 'Signing...' : 'Sign Message'}
                      </button>
                      
                      {signature && (
                        <div className="signature-result">
                          <h4>Signature:</h4>
                          <div className="signature-box">
                            <p className="signature-text">{signature}</p>
                            <button 
                              className="copy-signature-button"
                              onClick={() => {
                                navigator.clipboard.writeText(signature);
                                alert('Signature copied to clipboard');
                              }}
                            >
                              Copy Signature
                            </button>
                          </div>
                          <p className="verification-instructions">
                            Share this signature along with the original message to prove your identity.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* IPFS Storage Section */}
            {activeSection === 'storage' && (
              <div className="profile-section">
                <h2>Decentralized Storage</h2>
                <IPFSStoragePanel />
              </div>
            )}

            {/* Content Verification Section */}
            {activeSection === 'verification-content' && (
              <div className="profile-section">
                <h2>Content Verification</h2>
                <ContentVerificationPanel />
              </div>
            )}

            {/* Feed Source Validation Section */}
            {activeSection === 'feed-validation' && (
              <div className="profile-section">
                <h2>Feed Source Validation</h2>
                <FeedSourceValidator />
              </div>
            )}

            {/* Batch Verification Section */}
            {activeSection === 'batch-verification' && (
              <div className="profile-section">
                <h2>Batch Content Verification</h2>
                <BatchVerificationPanel />
              </div>
            )}

            {/* Contract Deployment Section */}
            {activeSection === 'contract-deployment' && (
              <div className="profile-section">
                <h2>Smart Contract Deployment</h2>
                {accessLevel <= AccessLevel.COMMANDER ? (
                  <ContractDeploymentPanel />
                ) : (
                  <div className="access-restricted">
                    <p>Access to contract deployment is restricted to Commander level and above.</p>
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
                    <input 
                      type="text" 
                      id="displayName" 
                      className="form-control" 
                      defaultValue={ensName || "Tactical Operator"} 
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Secure Contact</label>
                    <input type="email" id="email" className="form-control" defaultValue="operator@tactical-intel.com" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="role">Operational Role</label>
                    <input 
                      type="text" 
                      id="role" 
                      className="form-control" 
                      defaultValue={getAccessLevelName(accessLevel)} 
                      readOnly 
                    />
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
