import './SettingsChangeIndicator.css';

import React, { useCallback } from 'react';

interface SettingsChangeIndicatorProps {
  hasChanges: boolean;
  isApplying?: boolean;
  onApply?: () => void;
  onDiscard?: () => void;
  className?: string;
}

/**
 * Visual indicator component showing when settings have unsaved changes
 * and providing options to apply or discard changes
 */
const SettingsChangeIndicator: React.FC<SettingsChangeIndicatorProps> = React.memo(({
  hasChanges,
  isApplying = false,
  onApply,
  onDiscard,
  className = ''
}) => {
  const handleApply = useCallback(() => {
    if (onApply) onApply();
  }, [onApply]);
  
  const handleDiscard = useCallback(() => {
    if (onDiscard) onDiscard();
  }, [onDiscard]);

  if (!hasChanges && !isApplying) {
    return null;
  }

  return (
    <div className={`settings-change-indicator ${className}`}>
      <div className="change-status">
        {isApplying ? (
          <div className="applying-indicator">
            <span className="spinner"></span>
            <span className="status-text">Applying changes...</span>
          </div>
        ) : (
          <div className="unsaved-indicator">
            <span className="status-icon">●</span>
            <span className="status-text">You have unsaved changes</span>
          </div>
        )}
      </div>
      
      {hasChanges && !isApplying && (
        <div className="change-actions">
          {onApply && (
            <button 
              className="apply-button"
              onClick={handleApply}
              title="Apply changes"
            >
              Apply
            </button>
          )}
          {onDiscard && (
            <button 
              className="discard-button"
              onClick={handleDiscard}
              title="Discard changes"
            >
              Discard
            </button>
          )}
        </div>
      )}
    </div>
  );
});

export default SettingsChangeIndicator;
