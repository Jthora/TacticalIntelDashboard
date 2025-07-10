export interface FeedItem {
  id: string;
  title: string;
  link: string;
  pubDate: string;
  description: string;
  content: string;
  feedListId: string;
  author?: string;
  categories?: string[];
  media?: { url: string, type: string }[];
}

export interface FeedList {
  id: string;
  name: string;
}

export interface FeedSource {
  id: string;
  name: string;
  url: string;
}

export interface FeedResults {
  feeds: FeedItem[];
  fetchedAt: string; // Timestamp of when the feeds were fetched
}