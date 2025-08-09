import React from 'react';

import IntelSources from './IntelSources';

interface LeftSidebarProps {
  setSelectedFeedList: (feedListId: string | null) => void;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({ setSelectedFeedList }) => {
  return (
    <IntelSources setSelectedFeedList={setSelectedFeedList} />
  );
};

export default LeftSidebar;
