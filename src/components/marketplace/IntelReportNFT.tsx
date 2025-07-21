// src/components/marketplace/IntelReportNFT.tsx
import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../../contexts/Web3Context';
import { AccessLevel } from '../../contexts/Web3Context';
import '../../assets/styles/components/intel-report-nft.css';

interface IntelReportData {
  id: string;
  title: string;
  description: string;
  source: string;
  timestamp: string;
  price: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  author: string;
  verified: boolean;
  tags: string[];
  ipfsHash: string;
}

interface IntelReportNFTProps {
  reportData?: IntelReportData;
  showMintInterface?: boolean;
}

const IntelReportNFT: React.FC<IntelReportNFTProps> = ({ 
  reportData, 
  showMintInterface = false 
}) => {
  const { isConnected, accessLevel, walletAddress } = useWeb3();
  const [isLoading, setIsLoading] = useState(false);
  const [mintingData, setMintingData] = useState({
    title: '',
    description: '',
    source: '',
    tags: '',
    price: '0.1'
  });

  // Demo Intel Report data
  const demoReport: IntelReportData = reportData || {
    id: 'INTEL-001',
    title: 'Emerging Cyber Threat Analysis - APT Group Phoenix',
    description: 'Comprehensive analysis of new advanced persistent threat group targeting financial institutions across North America. Includes IOCs, TTPs, and mitigation strategies.',
    source: 'SecuriCorp Intelligence Division',
    timestamp: new Date().toISOString(),
    price: '0.25',
    rarity: 'Epic',
    author: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    verified: true,
    tags: ['cybersecurity', 'apt', 'financial', 'threat-intel'],
    ipfsHash: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG'
  };

  const canMintReports = accessLevel >= AccessLevel.COMMANDER;
  const canPurchaseReports = accessLevel >= AccessLevel.FIELD_OPERATIVE;

  const handleMintReport = async () => {
    if (!isConnected || !canMintReports) {
      alert('You need COMMANDER level access to mint Intel Reports');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate minting process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Minting Intel Report:', mintingData);
      alert('Intel Report minted successfully! (Demo)');
      
      // Reset form
      setMintingData({
        title: '',
        description: '',
        source: '',
        tags: '',
        price: '0.1'
      });
    } catch (error) {
      console.error('Error minting report:', error);
      alert('Failed to mint Intel Report');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchaseReport = async () => {
    if (!isConnected || !canPurchaseReports) {
      alert('You need at least FIELD_OPERATIVE level access to purchase Intel Reports');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate purchase process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Purchasing Intel Report:', demoReport.id);
      alert(`Successfully purchased ${demoReport.title} for ${demoReport.price} ETH! (Demo)`);
    } catch (error) {
      console.error('Error purchasing report:', error);
      alert('Failed to purchase Intel Report');
    } finally {
      setIsLoading(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Common': return '#8e8e93';
      case 'Rare': return '#007aff';
      case 'Epic': return '#af52de';
      case 'Legendary': return '#ff9500';
      default: return '#8e8e93';
    }
  };

  if (showMintInterface) {
    return (
      <div className="intel-report-mint">
        <div className="mint-header">
          <h2>🎯 Mint Intel Report NFT</h2>
          <div className="access-requirement">
            {canMintReports ? (
              <span className="access-granted">✅ COMMANDER Access Verified</span>
            ) : (
              <span className="access-denied">❌ Requires COMMANDER Level Access</span>
            )}
          </div>
        </div>

        <div className="mint-form">
          <div className="form-group">
            <label>Report Title</label>
            <input
              type="text"
              value={mintingData.title}
              onChange={(e) => setMintingData({...mintingData, title: e.target.value})}
              placeholder="Enter intelligence report title..."
              disabled={!canMintReports}
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={mintingData.description}
              onChange={(e) => setMintingData({...mintingData, description: e.target.value})}
              placeholder="Detailed description of intelligence findings..."
              rows={4}
              disabled={!canMintReports}
            />
          </div>

          <div className="form-group">
            <label>Source</label>
            <input
              type="text"
              value={mintingData.source}
              onChange={(e) => setMintingData({...mintingData, source: e.target.value})}
              placeholder="Intelligence source or organization..."
              disabled={!canMintReports}
            />
          </div>

          <div className="form-group">
            <label>Tags (comma-separated)</label>
            <input
              type="text"
              value={mintingData.tags}
              onChange={(e) => setMintingData({...mintingData, tags: e.target.value})}
              placeholder="cybersecurity, threat-intel, analysis..."
              disabled={!canMintReports}
            />
          </div>

          <div className="form-group">
            <label>Price (ETH)</label>
            <input
              type="number"
              step="0.01"
              value={mintingData.price}
              onChange={(e) => setMintingData({...mintingData, price: e.target.value})}
              placeholder="0.1"
              disabled={!canMintReports}
            />
          </div>

          <button 
            className="mint-button"
            onClick={handleMintReport}
            disabled={!canMintReports || isLoading || !mintingData.title || !mintingData.description}
          >
            {isLoading ? 'Minting...' : '🎯 Mint Intel Report NFT'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="intel-report-nft">
      <div className="nft-header">
        <div className="nft-id">#{demoReport.id}</div>
        <div 
          className="nft-rarity"
          style={{ color: getRarityColor(demoReport.rarity) }}
        >
          {demoReport.rarity}
        </div>
      </div>

      <div className="nft-content">
        <div className="nft-title">{demoReport.title}</div>
        <div className="nft-description">{demoReport.description}</div>
        
        <div className="nft-metadata">
          <div className="metadata-item">
            <span className="label">Source:</span>
            <span className="value">{demoReport.source}</span>
          </div>
          
          <div className="metadata-item">
            <span className="label">Author:</span>
            <span className="value">
              {demoReport.author.substring(0, 6)}...{demoReport.author.substring(38)}
            </span>
          </div>
          
          <div className="metadata-item">
            <span className="label">Timestamp:</span>
            <span className="value">{new Date(demoReport.timestamp).toLocaleString()}</span>
          </div>
          
          <div className="metadata-item">
            <span className="label">IPFS:</span>
            <span className="value">{demoReport.ipfsHash.substring(0, 10)}...</span>
          </div>
        </div>

        <div className="nft-tags">
          {demoReport.tags.map((tag, index) => (
            <span key={index} className="tag">#{tag}</span>
          ))}
        </div>

        <div className="nft-verification">
          {demoReport.verified && (
            <div className="verified-badge">
              ✅ Blockchain Verified
            </div>
          )}
        </div>
      </div>

      <div className="nft-footer">
        <div className="nft-price">
          <span className="price-label">Price:</span>
          <span className="price-value">{demoReport.price} ETH</span>
        </div>

        <div className="nft-actions">
          {canPurchaseReports ? (
            <button 
              className="purchase-button"
              onClick={handlePurchaseReport}
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : '💰 Purchase Report'}
            </button>
          ) : (
            <button className="locked-button" disabled>
              🔒 Requires Marketplace Access
            </button>
          )}
        </div>
      </div>

      {!isConnected && (
        <div className="connection-overlay">
          <div className="overlay-content">
            <p>Connect your wallet to access Intel Reports</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntelReportNFT;
