import React, { useState, useEffect } from 'react';
import { FeedVisualizer } from '../../feeds';

interface CentralViewProps {
  selectedFeedList: string | null;
}

const CentralView: React.FC<CentralViewProps> = ({ selectedFeedList }) => {
  const [dataStreamStatus, setDataStreamStatus] = useState('INITIALIZING');
  const [activeFeeds, setActiveFeeds] = useState(0);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    // Simulate data stream initialization
    const initStream = async () => {
      setDataStreamStatus('ESTABLISHING CONNECTION');
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setDataStreamStatus('SYNCING FEEDS');
      setActiveFeeds(5);
      await new Promise(resolve => setTimeout(resolve, 600));
      
      setDataStreamStatus('STREAMING LIVE DATA');
      setActiveFeeds(12);
      
      // Update last update time periodically
      const updateTimer = setInterval(() => {
        setLastUpdate(new Date());
      }, 30000);

      return () => clearInterval(updateTimer);
    };

    initStream();
  }, [selectedFeedList]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false,
      timeZone: 'UTC'
    });
  };

  return (
    <div className="intel-display-container">
      {/* Data Stream Status */}
      <div className="data-stream-header">
        <div className="stream-info">
          <span className="stream-label">DATA STREAM:</span>
          <span className={`stream-status ${dataStreamStatus.toLowerCase().replace(/\s+/g, '-')}`}>
            {dataStreamStatus}
          </span>
        </div>
        <div className="stream-stats">
          <span className="stat-item">
            <span className="stat-label">ACTIVE FEEDS:</span>
            <span className="stat-value">{activeFeeds}</span>
          </span>
          <span className="stat-item">
            <span className="stat-label">LAST UPDATE:</span>
            <span className="stat-value">{formatTime(lastUpdate)} UTC</span>
          </span>
        </div>
      </div>

      {/* Main Display Area */}
      <div className="intel-display-main">
        <FeedVisualizer selectedFeedList={selectedFeedList} />
        
        {/* Data Stream Indicators */}
        <div className="stream-indicators">
          <div className="indicator-line stream-1"></div>
          <div className="indicator-line stream-2"></div>
          <div className="indicator-line stream-3"></div>
        </div>
      </div>

      {/* Cyberpunk Effects */}
      <div className="display-effects">
        <div className="scan-overlay"></div>
        <div className="data-corruption"></div>
      </div>
    </div>
  );
};

export default CentralView;