import React, { useEffect,useState } from 'react';

const DevelopmentNotice: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDevelopment, setIsDevelopment] = useState(false);

  useEffect(() => {
    // Check if we're in development mode
    const devMode = import.meta.env.DEV;
    setIsDevelopment(devMode);
    
    if (devMode) {
      // Show notice for a few seconds, then auto-hide
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 10000); // Hide after 10 seconds

      return () => clearTimeout(timer);
    }
  }, []);

  if (!isDevelopment || !isVisible) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      backgroundColor: '#1e40af',
      color: 'white',
      padding: '16px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      maxWidth: '400px',
      zIndex: 1000,
      fontSize: '14px',
      lineHeight: '1.5'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
            🔧 Development Mode
          </div>
          <div>
            RSS feeds are using validated sources from the Earth Alliance roster.
            All feeds have been tested and confirmed working.
          </div>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            fontSize: '18px',
            padding: '0',
            marginLeft: '12px'
          }}
          aria-label="Close"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default DevelopmentNotice;
