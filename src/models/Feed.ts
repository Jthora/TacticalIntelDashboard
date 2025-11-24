export interface Feed {
  id: string;
  name: string;
  url: string;
  title: string;
  link: string;
  pubDate: string;
  description?: string;
  content?: string;
  feedListId: string;
  author?: string;
  categories?: string[];
  media?: { url: string, type: string }[];
  
  // Filter-related metadata
  priority?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  contentType?: 'INTEL' | 'NEWS' | 'ALERT' | 'THREAT';
  region?: 'GLOBAL' | 'AMERICAS' | 'EUROPE' | 'ASIA_PACIFIC';
  tags?: string[];
  classification?: string;
  timestamp?: string | Date;
  source?: string;
  category?: string;
  trustRating?: number;
  verificationStatus?: 'VERIFIED' | 'UNVERIFIED' | 'OFFICIAL';
  dataQuality?: number;
  missionMode?: string;
  
  // Extended metadata for modern API sources
  metadata?: {
    numComments?: number;
    score?: number;
    subreddit?: string;
    author?: string;
    [key: string]: any;
  };
}