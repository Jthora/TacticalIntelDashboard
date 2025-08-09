import './VerificationIndicator.css';

import React from 'react';

import { SettingsIntegrationService } from '../../services/SettingsIntegrationService';

interface VerificationIndicatorProps {
  trustRating?: number;
  source?: string;
  compact?: boolean;
  showLabel?: boolean;
}

/**
 * Component that shows a visual indicator of content verification status
 * based on user's verification settings
 */
const VerificationIndicator: React.FC<VerificationIndicatorProps> = ({
  trustRating = 0,
  source,
  compact = false,
  showLabel = true
}) => {
  // Get trust status based on user settings
  const { trusted, warning, status } = SettingsIntegrationService.getTrustStatus(trustRating);
  
  // Get verification methods from settings
  const methods = SettingsIntegrationService.getVerificationSettings().preferredMethods;
  
  // Create label text
  const getStatusLabel = () => {
    if (trusted) {
      return 'Verified';
    } else if (warning) {
      return 'Low Trust';
    } else {
      return 'Unverified';
    }
  };
  
  // Determine badge title with more details
  const getTitle = () => {
    let details = `Trust rating: ${trustRating}%`;
    
    if (source) {
      details += ` | Source: ${source}`;
    }
    
    if (methods.length > 0) {
      details += ` | Verification: ${methods.join(', ')}`;
    }
    
    return details;
  };
  
  // Render component
  return (
    <div 
      className={`verification-indicator ${status} ${compact ? 'compact' : ''}`}
      title={getTitle()}
    >
      <span className="indicator-icon">
        {status === 'trusted' ? '✓' : status === 'warning' ? '!' : '?'}
      </span>
      
      {showLabel && (
        <span className="indicator-label">{getStatusLabel()}</span>
      )}
    </div>
  );
};

export default VerificationIndicator;
