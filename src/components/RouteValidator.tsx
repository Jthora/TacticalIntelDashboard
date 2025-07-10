import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * RouteValidator - A simple component that logs routing information
 * This helps diagnose routing issues by tracking navigation changes
 */
const RouteValidator: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Log navigation changes
  useEffect(() => {
    console.log('Route changed:', {
      pathname: location.pathname,
      search: location.search,
      hash: location.hash,
      state: location.state,
      key: location.key
    });
    
    // Check for known problematic routes
    if (location.pathname.includes('/settings') && !location.pathname.includes('/settings/')) {
      console.warn('Incomplete settings route detected, redirecting to general');
      navigate('/settings/general', { replace: true });
    }
  }, [location, navigate]);
  
  // This component doesn't render anything
  return null;
};

export default RouteValidator;
