import React from 'react';
import { useParams } from 'react-router-dom';
import FeedController from '../controllers/FeedController';
import FeedVisualizer from '../components/FeedVisualizer';

const FeedPage: React.FC = () => {
  const { feedId } = useParams<{ feedId: string }>();
  const feed = FeedController.getFeedById(feedId);

  return (
    <div className="FeedPage">
      <h2>{feed.title}</h2>
      <FeedVisualizer feed={feed} />
      <p>{feed.description}</p>
    </div>
  );
};

export default FeedPage;