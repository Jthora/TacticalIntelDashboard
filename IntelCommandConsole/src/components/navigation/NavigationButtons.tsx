import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * NavigationButtons component for main page navigation
 * Displays two main buttons for Dashboard and Settings
 */
const NavigationButtons: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Determine which button is active based on current route
  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="navigation-buttons">
      <button 
        className={`control-btn-micro ${isActive('/') ? 'active' : ''}`}
        onClick={() => navigate('/')}
        title="Tactical Dashboard"
      >
        📡
      </button>
      <button 
        className={`control-btn-micro ${isActive('/settings') ? 'active' : ''}`}
        onClick={() => navigate('/settings')}
        title="Settings"
      >
        ⚙️
      </button>
    </div>
  );
};

export default NavigationButtons;
