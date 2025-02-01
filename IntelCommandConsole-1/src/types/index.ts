export type Feed = {
  id: string;
  title: string;
  url: string;
};

export type FeedList = Feed[];

export interface PersistentStorage {
  getFeeds: () => FeedList;
  saveFeeds: (feeds: FeedList) => void;
}