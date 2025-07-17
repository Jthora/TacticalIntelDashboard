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
  // Enhanced metadata for realistic sources
  trustRating?: number;
  verificationStatus?: 'VERIFIED' | 'UNVERIFIED' | 'OFFICIAL';
  lastValidated?: string;
  responseTime?: number;
  // Extended properties from modern API service
  tags?: string[];
  priority?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  contentType?: 'INTEL' | 'NEWS' | 'ALERT' | 'THREAT';
  source?: string;
  // Extended metadata for modern API sources
  metadata?: {
    numComments?: number;
    score?: number;
    subreddit?: string;
    author?: string;
    [key: string]: any;
  };
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