// src/components/marketplace/MarketplaceDashboard.tsx
import '../../assets/styles/components/marketplace-dashboard.css';

import React, { useEffect,useState } from 'react';

import { useWeb3 } from '../../contexts/Web3Context';
import { AccessLevel } from '../../contexts/Web3Context';

interface MarketplaceStats {
  totalReports: number;
  activeListings: number;
  totalVolume: string;
  topRarity: string;
  userStats: {
    ownedReports: number;
    reportsCreated: number;
    intelBalance: string;
    stakedAmount: string;
    accessLevel: string;
  };
}

interface TrendingReport {
  id: string;
  title: string;
  price: string;
  rarity: string;
  views: number;
  creator: string;
  thumbnail?: string;
}

const MarketplaceDashboard: React.FC = () => {
  const { isConnected, accessLevel } = useWeb3();
  const [activeTab, setActiveTab] = useState<'overview' | 'browse' | 'create' | 'portfolio'>('overview');
  const [marketplaceStats, setMarketplaceStats] = useState<MarketplaceStats | null>(null);
  const [trendingReports, setTrendingReports] = useState<TrendingReport[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Demo data
  const demoStats: MarketplaceStats = {
    totalReports: 247,
    activeListings: 89,
    totalVolume: '12,450.32',
    topRarity: 'Legendary',
    userStats: {
      ownedReports: accessLevel >= AccessLevel.FIELD_OPERATIVE ? 5 : 0,
      reportsCreated: accessLevel >= AccessLevel.COMMANDER ? 2 : 0,
      intelBalance: getIntelBalance(),
      stakedAmount: getStakedAmount(),
      accessLevel: getAccessLevelName()
    }
  };

  const demoTrendingReports: TrendingReport[] = [
    {
      id: 'INTEL-001',
      title: 'APT Group Phoenix Analysis',
      price: '0.25',
      rarity: 'Epic',
      views: 1547,
      creator: '0x742d...f44e'
    },
    {
      id: 'INTEL-002',
      title: 'Critical Infrastructure Vulnerabilities Q4 2024',
      price: '0.45',
      rarity: 'Legendary',
      views: 2341,
      creator: '0x1234...7890'
    },
    {
      id: 'INTEL-003',
      title: 'Emerging Social Engineering Tactics',
      price: '0.15',
      rarity: 'Rare',
      views: 892,
      creator: '0x8626...1199'
    }
  ];

  function getIntelBalance(): string {
    const balances = {
      [AccessLevel.PUBLIC]: '0.00',
      [AccessLevel.FIELD_OPERATIVE]: '250.00',
      [AccessLevel.ANALYST]: '1,500.00',
      [AccessLevel.COMMANDER]: '7,500.00',
      [AccessLevel.DIRECTOR]: '25,000.00'
    };
    return balances[accessLevel] || '0.00';
  }

  function getStakedAmount(): string {
    const stakedAmounts = {
      [AccessLevel.PUBLIC]: '0.00',
      [AccessLevel.FIELD_OPERATIVE]: '100.00',
      [AccessLevel.ANALYST]: '1,000.00',
      [AccessLevel.COMMANDER]: '5,000.00',
      [AccessLevel.DIRECTOR]: '15,000.00'
    };
    return stakedAmounts[accessLevel] || '0.00';
  }

  function getAccessLevelName(): string {
    const levelNames = {
      [AccessLevel.PUBLIC]: 'Public',
      [AccessLevel.FIELD_OPERATIVE]: 'Field Operative',
      [AccessLevel.ANALYST]: 'Analyst',
      [AccessLevel.COMMANDER]: 'Commander',
      [AccessLevel.DIRECTOR]: 'Director'
    };
    return levelNames[accessLevel] || 'Public';
  }

  function getRarityColor(rarity: string): string {
    const colors = {
      'Common': '#6b7280',
      'Rare': '#3b82f6',
      'Epic': '#8b5cf6',
      'Legendary': '#f59e0b'
    };
    return colors[rarity as keyof typeof colors] || '#6b7280';
  }

  useEffect(() => {
    if (isConnected) {
      setMarketplaceStats(demoStats);
      setTrendingReports(demoTrendingReports);
    }
  }, [isConnected, accessLevel]);

  const handleStakeTokens = async () => {
    setIsLoading(true);
    try {
      // Simulate staking transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert('Tokens staked successfully! Your access level may have increased.');
    } catch (error) {
      alert('Failed to stake tokens');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchaseTokens = () => {
    alert('Token purchase functionality would integrate with DEX or token sale contract');
  };

  if (!isConnected) {
    return (
      <div className="marketplace-dashboard">
        <div className="connect-prompt">
          <h2>🔐 Connect Your Wallet</h2>
          <p>Connect your Web3 wallet to access the Intelligence Exchange Marketplace</p>
          <div className="features-preview">
            <div className="feature-item">
              <span className="feature-icon">📊</span>
              <span>Trade Intel Reports (NFTs)</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🎯</span>
              <span>Token-Gated Premium Access</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">⚡</span>
              <span>Earn Staking Rewards</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="marketplace-dashboard">
      {/* Header */}
      <div className="marketplace-header">
        <h1>🌐 Intelligence Exchange Marketplace</h1>
        <p>Decentralized Intelligence-as-a-Service Platform</p>
        
        <div className="access-level-badge" data-level={accessLevel}>
          <span className="badge-icon">🎖️</span>
          <span className="badge-text">{marketplaceStats?.userStats.accessLevel}</span>
          <span className="badge-level">Level {accessLevel}</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="marketplace-nav">
        <button 
          className={`nav-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button 
          className={`nav-button ${activeTab === 'browse' ? 'active' : ''}`}
          onClick={() => setActiveTab('browse')}
        >
          🔍 Browse Reports
        </button>
        {accessLevel >= AccessLevel.COMMANDER && (
          <button 
            className={`nav-button ${activeTab === 'create' ? 'active' : ''}`}
            onClick={() => setActiveTab('create')}
          >
            ⚡ Create Report
          </button>
        )}
        <button 
          className={`nav-button ${activeTab === 'portfolio' ? 'active' : ''}`}
          onClick={() => setActiveTab('portfolio')}
        >
          💼 Portfolio
        </button>
      </div>

      {/* Content Area */}
      <div className="marketplace-content">
        {activeTab === 'overview' && (
          <div className="overview-section">
            {/* Marketplace Stats */}
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Intel Reports</h3>
                <div className="stat-value">{marketplaceStats?.totalReports}</div>
              </div>
              <div className="stat-card">
                <h3>Active Listings</h3>
                <div className="stat-value">{marketplaceStats?.activeListings}</div>
              </div>
              <div className="stat-card">
                <h3>Trading Volume</h3>
                <div className="stat-value">{marketplaceStats?.totalVolume} INTEL</div>
              </div>
              <div className="stat-card">
                <h3>Top Rarity</h3>
                <div className="stat-value" style={{ color: getRarityColor(marketplaceStats?.topRarity || 'Common') }}>
                  {marketplaceStats?.topRarity}
                </div>
              </div>
            </div>

            {/* User Stats */}
            <div className="user-stats-section">
              <h3>Your Intelligence Portfolio</h3>
              <div className="user-stats-grid">
                <div className="user-stat">
                  <span className="stat-label">INTEL Balance:</span>
                  <span className="stat-value">{marketplaceStats?.userStats.intelBalance}</span>
                  <button className="purchase-button" onClick={handlePurchaseTokens}>
                    Buy INTEL
                  </button>
                </div>
                <div className="user-stat">
                  <span className="stat-label">Staked Amount:</span>
                  <span className="stat-value">{marketplaceStats?.userStats.stakedAmount}</span>
                  <button 
                    className="stake-button" 
                    onClick={handleStakeTokens}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Staking...' : 'Stake More'}
                  </button>
                </div>
                <div className="user-stat">
                  <span className="stat-label">Reports Owned:</span>
                  <span className="stat-value">{marketplaceStats?.userStats.ownedReports}</span>
                </div>
                <div className="user-stat">
                  <span className="stat-label">Reports Created:</span>
                  <span className="stat-value">{marketplaceStats?.userStats.reportsCreated}</span>
                </div>
              </div>
            </div>

            {/* Trending Reports */}
            <div className="trending-section">
              <h3>🔥 Trending Intelligence Reports</h3>
              <div className="trending-grid">
                {trendingReports.map((report) => (
                  <div key={report.id} className="trending-card">
                    <div className="report-header">
                      <h4>{report.title}</h4>
                      <span 
                        className="rarity-badge" 
                        style={{ backgroundColor: getRarityColor(report.rarity) }}
                      >
                        {report.rarity}
                      </span>
                    </div>
                    <div className="report-stats">
                      <span className="price">{report.price} ETH</span>
                      <span className="views">{report.views} views</span>
                    </div>
                    <div className="report-creator">by {report.creator}</div>
                    <button className="view-report-button">View Report</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'browse' && (
          <div className="browse-section">
            <h3>📋 Browse Intelligence Reports</h3>
            <p>Discover and purchase verified intelligence reports from trusted sources.</p>
            
            {accessLevel < AccessLevel.FIELD_OPERATIVE && (
              <div className="access-notice">
                <p>⚠️ Purchase $INTEL tokens and achieve Field Operative level to access the marketplace.</p>
              </div>
            )}
            
            <div className="reports-grid">
              {/* <IntelReportNFT /> */}
              {/* Additional report components would be rendered here */}
            </div>
          </div>
        )}

        {activeTab === 'create' && (
          <div className="create-section">
            <h3>⚡ Create Intelligence Report</h3>
            {accessLevel >= AccessLevel.COMMANDER ? (
              <div> {/* <IntelReportNFT showMintInterface={true} /> */} </div>
            ) : (
              <div className="access-notice">
                <p>🔒 Commander level access required to mint Intelligence Reports.</p>
                <p>Stake more INTEL tokens to unlock this feature.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'portfolio' && (
          <div className="portfolio-section">
            <h3>💼 Your Intelligence Portfolio</h3>
            <div className="portfolio-summary">
              <div className="portfolio-stat">
                <h4>Portfolio Value</h4>
                <div className="value">2.47 ETH</div>
              </div>
              <div className="portfolio-stat">
                <h4>Total Reports</h4>
                <div className="value">{marketplaceStats?.userStats.ownedReports}</div>
              </div>
              <div className="portfolio-stat">
                <h4>Staking Rewards</h4>
                <div className="value">+124.5 INTEL</div>
              </div>
            </div>
            
            <div className="portfolio-actions">
              <button className="action-button primary">Claim Rewards</button>
              <button className="action-button secondary">View Analytics</button>
              <button className="action-button tertiary">Export Portfolio</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketplaceDashboard;
