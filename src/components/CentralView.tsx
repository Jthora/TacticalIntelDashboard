import React from 'react';

import FeedVisualizer from './FeedVisualizer';

interface CentralViewProps {
  selectedFeedList: string | null;
}

const CentralView: React.FC<CentralViewProps> = ({ selectedFeedList }) => {
  console.log('🔍 TDD_SUCCESS_070: CentralView rendered with selectedFeedList:', selectedFeedList);
  
  return (
    <div className="tactical-module module-intelligence animate-fade-in-up">
      <div className="tactical-header-enhanced">
        <div className="header-primary">
          <span className="module-icon">📡</span>
          <h3>INTELLIGENCE FEED</h3>
        </div>
        <div className="header-status">
          <span className={`status-dot ${selectedFeedList ? 'active' : 'idle'}`}></span>
          <span className="status-text">{selectedFeedList ? 'ACTIVE' : 'STANDBY'}</span>
        </div>
      </div>
      <div className="tactical-content" style={{ padding: 0 }}>
        <FeedVisualizer selectedFeedList={selectedFeedList} />
      </div>
    </div>
  );
};

export default CentralView;