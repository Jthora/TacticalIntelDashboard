export type Feed = {
  id: string;
  name: string;
  url: string;
  title: string;
  link: string;
  pubDate: string;
  description?: string;
  content?: string;
  feedListId: string;
};

export type FeedList = {
  id: string;
  name: string;
};

export type FeedResults = {
  feeds: Feed[];
  fetchedAt: string; // Timestamp of when the feeds were fetched
};