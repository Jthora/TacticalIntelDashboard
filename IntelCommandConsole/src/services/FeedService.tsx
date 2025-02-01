// filepath: /Users/jono/Documents/GitHub/TacticalIntelDashboard/IntelCommandConsole/src/services/FeedService.tsx
import axios from 'axios';

interface Feed {
  title: string;
  link: string;
  pubDate: string;
}

export const fetchRSSFeeds = async (): Promise<Feed[]> => {
  const CORS_PROXY = "http://localhost:8081/";
  const RSS_URL = "https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml"; // Example RSS feed

  const response = await axios.get(CORS_PROXY + RSS_URL);
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(response.data, "text/xml");

  const items = Array.from(xmlDoc.querySelectorAll("item"));
  return items.map(item => ({
    title: item.querySelector("title")?.textContent || 'No title',
    link: item.querySelector("link")?.textContent || '#',
    pubDate: item.querySelector("pubDate")?.textContent || 'No date'
  }));
};