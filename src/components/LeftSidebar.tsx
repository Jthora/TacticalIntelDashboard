import React from 'react';

import IntelSources from './IntelSources';

interface LeftSidebarProps {
  selectedFeedList: string | null;
  setSelectedFeedList: (feedListId: string | null) => void;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({ selectedFeedList, setSelectedFeedList }) => {
  return (
    <IntelSources
      selectedFeedList={selectedFeedList}
      setSelectedFeedList={setSelectedFeedList}
    />
  );
};

export default LeftSidebar;
