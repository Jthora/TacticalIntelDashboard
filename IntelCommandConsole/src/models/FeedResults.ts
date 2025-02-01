import { Feed } from '../types/FeedTypes';
export interface FeedResults {
  feeds: Feed[];
  fetchedAt: string; // Timestamp of when the feeds were fetched
}