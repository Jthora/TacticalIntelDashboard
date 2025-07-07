import React from 'react';
import FeedVisualizer from './FeedVisualizer';

interface CentralViewProps {
  selectedFeedList: string | null;
}

const CentralView: React.FC<CentralViewProps> = ({ selectedFeedList }) => {
  return (
    <div className="tactical-main">
      <div className="tactical-module module-intelligence animate-fade-in-up">
        <div className="tactical-header">
          <h3>📡 INTELLIGENCE FEED</h3>
          <div className="header-status">
            {selectedFeedList ? (
              <span className="status-indicator status-online">ACTIVE</span>
            ) : (
              <span className="status-indicator status-offline">STANDBY</span>
            )}
          </div>
        </div>
        <div className="tactical-content" style={{ padding: 0 }}>
          <FeedVisualizer selectedFeedList={selectedFeedList} />
        </div>
      </div>
    </div>
  );
};

export default CentralView;