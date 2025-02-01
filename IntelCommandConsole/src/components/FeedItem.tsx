import React from 'react';

interface FeedItemProps {
  title: string;
  link: string;
  pubDate: string;
}

const FeedItem: React.FC<FeedItemProps> = ({ title, link, pubDate }) => (
  <div className="feed-item">
    <h3><a href={link} target="_blank" rel="noopener noreferrer">{title}</a></h3>
    <p>{pubDate}</p>
  </div>
);

export default FeedItem;