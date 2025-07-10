// src/pages/Web3TestPage.tsx
import React from 'react';
import { Web3Provider } from '../contexts/Web3Context';
import Web3LoginPanel from '../components/web3/Web3LoginPanel';
import ProfilePageSimple from '../components/web3/ProfilePageSimple';
import './Web3TestPage.css';

const Web3TestPageContent: React.FC = () => {
  return (
    <div className="web3-test-page">
      <div className="test-header">
        <h1>🚀 Web3 TDD Integration Test</h1>
        <p>Testing complete Web3 authentication flow with local smart contract</p>
        <div className="contract-info">
          <div>📋 Contract: <code>0x5FbDB2315678afecb367f032d93F642f64180aa3</code></div>
          <div>🌐 Network: Localhost (Chain ID: 1337)</div>
          <div>⚡ Status: Live & Ready</div>
        </div>
      </div>
      
      <div className="test-sections">
        <section className="login-section">
          <h2>🔐 Web3 Authentication</h2>
          <Web3LoginPanel />
        </section>
        
        <section className="profile-section">
          <h2>👤 User Profile</h2>
          <ProfilePageSimple />
        </section>
      </div>
      
      <div className="test-instructions">
        <h3>🧪 Test Instructions</h3>
        <ol>
          <li><strong>Connect MetaMask:</strong> Add localhost:8545 network if needed</li>
          <li><strong>Import Test Account:</strong> Use one of the Hardhat private keys</li>
          <li><strong>Connect Wallet:</strong> Click the connect button above</li>
          <li><strong>Verify Integration:</strong> Check address, balance, and access level display</li>
          <li><strong>Test Contract Interaction:</strong> Access level should be detected automatically</li>
        </ol>
        
        <div className="test-accounts">
          <h4>📱 Test Accounts Available</h4>
          <div className="account-grid">
            <div className="account-card">
              <div className="account-label">Account #0 (Owner)</div>
              <div className="account-address">0xf39F...2266</div>
              <div className="account-key">0xac097...f80</div>
              <div className="account-balance">10,000 ETH</div>
              <div className="account-level">🎖️ DIRECTOR Level</div>
            </div>
            <div className="account-card">
              <div className="account-label">Account #1</div>
              <div className="account-address">0x7099...79C8</div>
              <div className="account-key">0x59c69...690d</div>
              <div className="account-balance">10,000 ETH</div>
              <div className="account-level">👤 PUBLIC Level</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Web3TestPage: React.FC = () => {
  return (
    <Web3Provider>
      <Web3TestPageContent />
    </Web3Provider>
  );
};

export default Web3TestPage;
