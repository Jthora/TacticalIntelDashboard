import React, { useState } from 'react';
import Header from '../components/Header';
import LeftSidebar from '../components/LeftSidebar';
import RightSidebar from '../components/RightSidebar';
import CentralView from '../components/CentralView';

const HomePage: React.FC = () => {
  const [selectedFeedList, setSelectedFeedList] = useState<string | null>(null);

  return (
    <div className="home-page">
      <Header />
      <div className="content">
        <LeftSidebar setSelectedFeedList={setSelectedFeedList} />
        <CentralView selectedFeedList={selectedFeedList} />
        <RightSidebar />
      </div>
    </div>
  );
};

export default HomePage;