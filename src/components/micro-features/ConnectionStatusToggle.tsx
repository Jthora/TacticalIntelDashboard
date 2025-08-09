import React, { useState } from 'react';

import { log } from '../../utils/LoggerService';

export interface ConnectionStatusToggleProps {
  initialStatus?: 'secure' | 'encrypted' | 'scanning';
  onStatusChange?: (status: 'secure' | 'encrypted' | 'scanning') => void;
  className?: string;
}

/**
 * Feature 01: Connection Status Toggle
 * 
 * A critical security indicator that provides real-time visualization 
 * and control of the system's connection security state.
 */
export const ConnectionStatusToggle: React.FC<ConnectionStatusToggleProps> = ({
  initialStatus = 'secure',
  onStatusChange,
  className = ''
}) => {
  const [connectionStatus, setConnectionStatus] = useState<'secure' | 'encrypted' | 'scanning'>(initialStatus);
  const [isChanging, setIsChanging] = useState(false);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'secure': return '#00ff41';
      case 'encrypted': return '#00d4ff';
      case 'scanning': return '#ff9500';
      default: return '#ffffff';
    }
  };

  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'secure': return 'SECURE CONNECTION';
      case 'encrypted': return 'ENCRYPTED TUNNEL';
      case 'scanning': return 'SCANNING FOR THREATS';
      default: return 'UNKNOWN STATUS';
    }
  };

  const toggleConnectionStatus = () => {
    setIsChanging(true);
    
    const statuses = ['secure', 'encrypted', 'scanning'] as const;
    const currentIndex = statuses.indexOf(connectionStatus);
    const newStatus = statuses[(currentIndex + 1) % statuses.length];
    
    // Add visual feedback delay
    setTimeout(() => {
      setConnectionStatus(newStatus);
      setIsChanging(false);
      
      // Callback for parent component
      onStatusChange?.(newStatus);
      
      // Log security event for audit trail
      log.debug("Component", `🔒 Security Status Changed: ${connectionStatus.toUpperCase()} → ${newStatus.toUpperCase()}`);
    }, 150);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleConnectionStatus();
    }
  };

  return (
    <div 
      className={`status-micro connection-status ${isChanging ? 'changing' : ''} ${className}`}
      data-status={connectionStatus}
      onClick={toggleConnectionStatus}
      onKeyDown={handleKeyDown}
      style={{ color: getStatusColor(connectionStatus) }}
      title={`${getStatusLabel(connectionStatus)} - Click to cycle security levels`}
      role="button"
      tabIndex={0}
      aria-label={`Connection status: ${getStatusLabel(connectionStatus)}`}
      aria-pressed={connectionStatus === 'secure'}
    >
      ●
    </div>
  );
};

export default ConnectionStatusToggle;
