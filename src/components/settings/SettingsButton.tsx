import React from 'react';
import { SettingsIcon } from '../icons/SettingsIcon';

interface SettingsButtonProps {
  onClick: () => void;
  hasNotification?: boolean;
}

export const SettingsButton: React.FC<SettingsButtonProps> = ({ 
  onClick, 
  hasNotification = false 
}) => {
  return (
    <button
      className="settings-button"
      onClick={onClick}
      aria-label="Open Settings"
      data-has-notification={hasNotification}
    >
      <SettingsIcon className="settings-icon" />
    </button>
  );
};
