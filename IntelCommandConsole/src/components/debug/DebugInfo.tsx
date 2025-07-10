import React from 'react';

interface DebugInfoProps {
  componentName: string;
}

/**
 * A simple debugging component that shows information about 
 * which settings component is currently being rendered
 */
const DebugInfo: React.FC<DebugInfoProps> = ({ componentName }) => {
  if (process.env.NODE_ENV === 'production') {
    return null; // Don't show in production
  }
  
  return (
    <div style={{ 
      position: 'fixed', 
      bottom: '10px', 
      right: '10px', 
      background: 'rgba(0,0,0,0.7)',
      color: '#0f0', 
      padding: '5px 10px',
      borderRadius: '4px',
      fontSize: '12px',
      fontFamily: 'monospace',
      zIndex: 9999,
      maxWidth: '300px',
      wordBreak: 'break-word'
    }}>
      Component: {componentName}<br />
      Path: {window.location.pathname}<br />
      Time: {new Date().toLocaleTimeString()}
    </div>
  );
};

export default DebugInfo;
