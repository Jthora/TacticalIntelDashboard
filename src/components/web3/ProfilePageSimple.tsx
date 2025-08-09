import '../../assets/styles/components/profile-page.css';
import './ProfilePageSimple.css';

import React from 'react';
import { useNavigate } from 'react-router-dom';

import { useWeb3 } from '../../contexts/Web3Context';
import Web3LoginPanel from './Web3LoginPanel';

/**
 * Simplified ProfilePage - MVP Web3 Authentication
 * Focused on core login/logout functionality without bloat
 * Clean, functional interface for tactical authentication
 */
const ProfilePageSimple: React.FC = () => {
  const navigate = useNavigate();
  const { isConnected, walletAddress, ensName, accessLevel } = useWeb3();

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="profile-page">
      <div className="profile-page-header">
        <button className="back-button" onClick={handleBack}>
          ← Back to Dashboard
        </button>
        <h1>Tactical Authentication</h1>
        <p>Secure access to tactical intelligence networks</p>
      </div>

      <div className="profile-content-simple">
        <Web3LoginPanel />
        
        {isConnected && (
          <div className="authenticated-info">
            <div className="info-card tactical-module">
              <h3>🎯 Authentication Status</h3>
              <div className="info-card-content tactical-content">
                <div className="status-grid">
                  <div className="status-item">
                    <span className="status-label">Operator ID:</span>
                    <span className="status-value">{ensName || 'Tactical Operator'}</span>
                  </div>
                  <div className="status-item">
                    <span className="status-label">Wallet Address:</span>
                    <span className="status-value monospace">
                      {walletAddress.substring(0, 8)}...{walletAddress.substring(-6)}
                    </span>
                  </div>
                  <div className="status-item">
                    <span className="status-label">Security Clearance:</span>
                    <span className={`status-value clearance-${accessLevel}`}>
                      Level {accessLevel}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="capabilities-card tactical-module">
              <h3>🚀 Enabled Capabilities</h3>
              <div className="capabilities-card-content tactical-content">
                <ul className="capabilities-list">
                  <li className="capability-enabled">✅ Secure Feed Access</li>
                  <li className="capability-enabled">✅ Cryptographic Verification</li>
                  <li className="capability-enabled">✅ Decentralized Authentication</li>
                  {accessLevel >= 2 && (
                    <li className="capability-enabled">✅ Advanced Analytics</li>
                  )}
                  {accessLevel >= 3 && (
                    <li className="capability-enabled">✅ Command Authority</li>
                  )}
                  {accessLevel >= 4 && (
                    <li className="capability-enabled">✅ Director-Level Access</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePageSimple;
