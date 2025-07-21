// src/components/settings/tabs/IntegrationSettings.tsx

import React from 'react';
import CrossPlatformIntelPanel from '../../intelligence/CrossPlatformIntelPanel';
import '../../../assets/styles/components/general-settings.css';

/**
 * IntegrationSettings component
 * Handles cross-platform intelligence sharing and Web3 integrations
 */
const IntegrationSettings: React.FC = () => {
  return (
    <div className="general-settings">
      <div className="settings-header">
        <h1>🌐 Integration Settings</h1>
        <p>Cross-platform intelligence sharing and Web3 integrations</p>
      </div>

      <div className="settings-grid">
        {/* Integration Overview */}
        <section className="settings-section">
          <div className="section-header">
            <h2>🔗 Cross-Platform Integration</h2>
            <p>Seamlessly share intelligence between Tactical Intel Dashboard and Intelligence Market Exchange</p>
          </div>

          <div className="integration-info">
            <div className="info-card">
              <h3>🎯 Current Capabilities</h3>
              <ul>
                <li>✅ <strong>IPFS Storage</strong> - Decentralized intelligence storage</li>
                <li>✅ <strong>Wallet Authentication</strong> - Cryptographic identity</li>
                <li>✅ <strong>Smart Contracts</strong> - On-chain verification</li>
                <li>✅ <strong>NFT Marketplace</strong> - Intelligence trading</li>
                <li>✅ <strong>DAO Governance</strong> - Community decisions</li>
              </ul>
            </div>

            <div className="info-card">
              <h3>🚀 Integration Benefits</h3>
              <ul>
                <li><strong>Format Flexibility</strong> - Store in both TID and IME formats</li>
                <li><strong>Cryptographic Integrity</strong> - Wallet-signed intelligence</li>
                <li><strong>Decentralized Storage</strong> - No central authority</li>
                <li><strong>Cross-Platform Access</strong> - Share intelligence between apps</li>
                <li><strong>Blockchain Verification</strong> - Tamper-proof intelligence</li>
              </ul>
            </div>

            <div className="info-card">
              <h3>⚙️ Technical Architecture</h3>
              <ul>
                <li><strong>IPFS Bridge</strong> - Unified storage layer</li>
                <li><strong>Dual Format Support</strong> - TID and IME compatibility</li>
                <li><strong>Smart Contract Integration</strong> - On-chain intelligence assets</li>
                <li><strong>Encrypted Storage</strong> - Optional content encryption</li>
                <li><strong>Governance Integration</strong> - DAO-driven standards</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Web3 Status */}
        <section className="settings-section">
          <div className="section-header">
            <h2>🔐 Web3 Infrastructure Status</h2>
            <p>Current status of decentralized services</p>
          </div>

          <div className="web3-status">
            <div className="status-grid">
              <div className="status-item">
                <span className="status-icon">🌐</span>
                <div className="status-info">
                  <h4>IPFS Storage</h4>
                  <p>Decentralized file storage</p>
                </div>
                <div className="status-indicator connected">Ready</div>
              </div>

              <div className="status-item">
                <span className="status-icon">🔑</span>
                <div className="status-info">
                  <h4>Wallet Auth</h4>
                  <p>MetaMask integration</p>
                </div>
                <div className="status-indicator connected">Active</div>
              </div>

              <div className="status-item">
                <span className="status-icon">📜</span>
                <div className="status-info">
                  <h4>Smart Contracts</h4>
                  <p>IntelToken, NFTs, DAO</p>
                </div>
                <div className="status-indicator connected">Deployed</div>
              </div>

              <div className="status-item">
                <span className="status-icon">🗳️</span>
                <div className="status-info">
                  <h4>DAO Governance</h4>
                  <p>Starcom DAO</p>
                </div>
                <div className="status-indicator connected">Live</div>
              </div>

              <div className="status-item">
                <span className="status-icon">🔗</span>
                <div className="status-info">
                  <h4>ENS Integration</h4>
                  <p>Ethereum Name Service</p>
                </div>
                <div className="status-indicator connected">Enabled</div>
              </div>

              <div className="status-item">
                <span className="status-icon">🏪</span>
                <div className="status-info">
                  <h4>NFT Marketplace</h4>
                  <p>Intelligence trading</p>
                </div>
                <div className="status-indicator connected">Ready</div>
              </div>
            </div>
          </div>
        </section>

        {/* Intelligence Bridge */}
        <section className="settings-section full-width">
          <CrossPlatformIntelPanel 
            onIntelligencePublished={(hash) => {
              console.log('Intelligence published with hash:', hash);
              // Could add notification here
            }}
          />
        </section>

        {/* Integration Documentation */}
        <section className="settings-section">
          <div className="section-header">
            <h2>📚 Integration Guide</h2>
            <p>How to use cross-platform intelligence sharing</p>
          </div>

          <div className="documentation">
            <div className="doc-section">
              <h3>🚀 Quick Start</h3>
              <ol>
                <li>Connect your Web3 wallet (MetaMask)</li>
                <li>Ensure IPFS connection is active</li>
                <li>Create or import intelligence content</li>
                <li>Publish to IPFS in both TID and IME formats</li>
                <li>Share IPFS hash with other platforms</li>
              </ol>
            </div>

            <div className="doc-section">
              <h3>🔄 Data Flow</h3>
              <p>
                Intelligence published here is automatically converted to both TID and IME formats 
                and stored on IPFS. The metadata hash can be used by any compatible platform to 
                retrieve intelligence in their preferred format.
              </p>
            </div>

            <div className="doc-section">
              <h3>🔒 Security</h3>
              <p>
                All intelligence is cryptographically signed by your wallet. Optional encryption 
                ensures only authorized users can access sensitive content. Smart contract 
                verification provides additional trust layers.
              </p>
            </div>

            <div className="doc-section">
              <h3>💰 Economics</h3>
              <p>
                Intelligence can be tokenized as NFTs for trading on the Intelligence Market Exchange. 
                High-quality intelligence earns reputation and rewards through the Starcom DAO system.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default IntegrationSettings;
