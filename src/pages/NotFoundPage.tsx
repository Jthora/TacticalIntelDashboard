import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * NotFoundPage is displayed when a user navigates to a route that doesn't exist.
 * It provides navigation back to the home page.
 */
const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  
  const handleReturnHome = () => {
    navigate('/');
  };
  
  return (
    <div className="not-found-page">
      <div className="not-found-content">
        <h1>404 - Page Not Found</h1>
        <p>The page you're looking for doesn't exist or has been moved.</p>
        <button 
          className="tactical-button primary-button"
          onClick={handleReturnHome}
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
};

export default NotFoundPage;
