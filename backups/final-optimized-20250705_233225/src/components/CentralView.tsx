import React from 'react';
import FeedVisualizer from './FeedVisualizer';

interface CentralViewProps {
  selectedFeedList: string | null;
}

const CentralView: React.FC<CentralViewProps> = ({ selectedFeedList }) => {
  return (
    <div className="central-view">
      <FeedVisualizer selectedFeedList={selectedFeedList} />
    </div>
  );
};

export default CentralView;