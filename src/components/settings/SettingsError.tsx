import React from 'react';
import { useLocation } from 'react-router-dom';

interface SettingsErrorProps {
  message?: string;
  details?: string;
  code?: string;
}

/**
 * SettingsError - Displays a helpful error message when settings content cannot be loaded
 * Shows technical details about the route and provides troubleshooting guidance
 */
const SettingsError: React.FC<SettingsErrorProps> = ({ 
  message = "Settings content could not be loaded", 
  details,
  code 
}) => {
  const location = useLocation();
  
  return (
    <div className="settings-error">
      <div className="error-header">
        <span className="error-icon">⚠️</span>
        <h2>{message}</h2>
      </div>
      
      <div className="error-details">
        <p>{details || "There was a problem loading the requested settings screen."}</p>
        
        <div className="technical-details">
          <h3>Technical Information</h3>
          <ul>
            <li><strong>Current Path:</strong> {location.pathname}</li>
            <li><strong>Route Parameters:</strong> {JSON.stringify(location.state || {})}</li>
            {code && (
              <li>
                <strong>Error Code:</strong> <code>{code}</code>
              </li>
            )}
          </ul>
        </div>
        
        <div className="troubleshooting">
          <h3>Troubleshooting</h3>
          <ol>
            <li>Check that the tab component for this route exists and is properly exported</li>
            <li>Verify route configuration in AppRoutes.tsx matches the SettingsTab enum values</li>
            <li>Ensure all required context providers are available</li>
            <li>Check browser console for JavaScript errors</li>
          </ol>
        </div>
      </div>
      
      <div className="error-actions">
        <button className="btn-secondary" onClick={() => window.location.href = '/settings/general'}>
          Go to General Settings
        </button>
        <button className="btn-primary" onClick={() => window.location.reload()}>
          Reload Page
        </button>
      </div>
    </div>
  );
};

export default SettingsError;
