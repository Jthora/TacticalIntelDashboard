import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { SettingsTab } from '../../contexts/SettingsContext';
import SettingsError from './SettingsError';

interface RouteValidatorProps {
  children: React.ReactNode;
  expectedTab?: SettingsTab;
}

/**
 * SettingsRouteValidator - Validates that the current route path matches expected tab parameters
 * and displays an error screen if validation fails
 */
const SettingsRouteValidator: React.FC<RouteValidatorProps> = ({ 
  children,
  expectedTab
}) => {
  const { tab } = useParams<{ tab?: string }>();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // If no tab param but we're on a settings route, that's a routing error
    if (!tab && location.pathname.includes('/settings/')) {
      console.error('Missing tab parameter in route');
      setError('Missing tab parameter in route');
      return;
    }
    
    // If tab isn't a valid enum value, that's a route error
    if (tab && !Object.values(SettingsTab).includes(tab as SettingsTab)) {
      console.error(`Invalid tab parameter: "${tab}"`);
      setError(`Invalid tab parameter: "${tab}"`);
      return;
    }
    
    // If an expected tab was provided and it doesn't match the route, that's a route error
    if (expectedTab && tab !== expectedTab) {
      console.warn(`Route mismatch: Expected "${expectedTab}" but got "${tab}" - this should not happen with proper routing`);
      // Don't set error here, just log a warning
      // This allows the component to render even if there's a mismatch
      return;
    }
    
    // Clear any previous error
    setError(null);
  }, [tab, location.pathname, expectedTab]);
  
  if (error) {
    return (
      <SettingsError 
        message="Settings Route Error"
        details={error}
        code={`Expected route pattern: /settings/:tab where :tab is one of [${Object.values(SettingsTab).join(', ')}]`}
      />
    );
  }
  
  return <>{children}</>;
};

export default SettingsRouteValidator;
