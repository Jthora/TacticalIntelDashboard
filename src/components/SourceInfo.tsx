import React from 'react';
import { EarthAllianceFeedSource } from '../constants/EarthAllianceSources';

interface SourceInfoProps {
  source: EarthAllianceFeedSource;
}

const SourceInfo: React.FC<SourceInfoProps> = ({ source }) => {
  // Calculate trust level class
  const getTrustLevelClass = (trustRating: number) => {
    if (trustRating >= 80) return 'high-trust';
    if (trustRating >= 60) return 'medium-trust';
    return 'low-trust';
  };

  // Calculate alignment class
  const getAlignmentClass = (alignment: number) => {
    if (alignment >= 80) return 'high-alignment';
    if (alignment >= 50) return 'medium-alignment';
    if (alignment >= 0) return 'low-alignment';
    return 'compromised';
  };

  // Get protocol badge class
  const getProtocolClass = (protocol: string) => {
    return `protocol-${protocol.toLowerCase()}`;
  };

  return (
    <div className="source-info">
      <div className="source-metrics">
        <div className={`trust-indicator ${getTrustLevelClass(source.trustRating)}`}>
          <span className="metric-label">Trust:</span>
          <span className="metric-value">{source.trustRating}</span>
        </div>
        
        <div className={`alignment-indicator ${getAlignmentClass(source.allianceAlignment)}`}>
          <span className="metric-label">Alliance:</span>
          <span className="metric-value">{source.allianceAlignment}</span>
        </div>
        
        <div className={`protocol-badge ${getProtocolClass(source.protocol)}`}>
          <span className="protocol-icon">{getProtocolIcon(source.protocol)}</span>
          <span className="protocol-name">{source.protocol.toUpperCase()}</span>
        </div>
      </div>
      
      <div className="source-details">
        <div className="source-category">
          <span className="category-label">Category:</span>
          <span className="category-value">{formatCategory(source.category)}</span>
        </div>
        
        <div className="source-access">
          <span className="access-label">Access:</span>
          <span className="access-value">{formatAccessMethod(source.accessMethod)}</span>
        </div>
      </div>
    </div>
  );
};

// Helper function to format category for display
const formatCategory = (category: string): string => {
  return category
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, c => c.toUpperCase());
};

// Helper function to format access method for display
const formatAccessMethod = (method: string): string => {
  return method
    .replace(/-/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, c => c.toUpperCase());
};

// Helper function to get protocol icon
const getProtocolIcon = (protocol: string): string => {
  switch (protocol.toLowerCase()) {
    case 'rss':
      return '📶';
    case 'json':
      return '📊';
    case 'api':
      return '🔌';
    case 'ipfs':
      return '🌐';
    case 'mastodon':
      return '🐘';
    case 'ssb':
      return '🔐';
    default:
      return '📡';
  }
};

export default SourceInfo;
