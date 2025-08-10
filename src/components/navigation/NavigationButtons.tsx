import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * NavigationButtons (pruned)
 * Reduced to core routes: Dashboard + Settings after audit.
 * Marketplace & Governance removed (deferred features).
 */
const NavigationButtons: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (path: string) => (path === '/' ? location.pathname === '/' : location.pathname.startsWith(path));

  return (
    <div className="navigation-buttons">
      <button
        className={`control-btn-micro ${isActive('/') ? 'active' : ''}`}
        onClick={() => navigate('/')}
        title="Tactical Dashboard"
        aria-label="Dashboard"
      >
        📡
      </button>
      <button
        className={`control-btn-micro ${isActive('/settings') ? 'active' : ''}`}
        onClick={() => navigate('/settings')}
        title="Settings"
        aria-label="Settings"
      >
        ⚙️
      </button>
    </div>
  );
};

export default NavigationButtons;
