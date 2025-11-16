import React from 'react';

import WingCommanderLogo from '../assets/images/WingCommanderLogo-288x162.gif';
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
          <h3 className="intelligence-feed-title">
            INTELLIGENCE FEED
            <img
              src={WingCommanderLogo}
              alt="Wing Commander"
              style={{
                height: 20,
                width: 'auto',
                display: 'inline-block',
                marginLeft: 8,
                mixBlendMode: 'screen'
              }}
            />
          </h3>
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