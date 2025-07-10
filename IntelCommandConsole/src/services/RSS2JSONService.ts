import { Feed } from '../models/Feed';

export interface RSS2JSONResponse {
  status: string;
  feed: {
    url: string;
    title: string;
    link: string;
    author: string;
    description: string;
    image: string;
  };
  items: Array<{
    title: string;
    pubDate: string;
    link: string;
    guid: string;
    author: string;
    thumbnail: string;
    description: string;
    content: string;
    enclosure: {
      link: string;
      type: string;
    };
    categories: string[];
  }>;
}

export class RSS2JSONService {
  private static readonly APIS = [
    // Browser-compatible, CORS-enabled APIs - no server needed
    'https://rss2json.vercel.app/api',
    'https://api.rss2json.com/v1/api.json',
    'https://api.rss-to-json.com/v1/api.json', // Different service
    'https://api.allorigins.win/get?url=',      // CORS-enabled gateway
    'https://corsproxy.io/?',                  // Public CORS proxy API
    'https://api.cors.sh/cors/?url=',         // Another public CORS API
  ];

  static async fetchFeed(rssUrl: string): Promise<Feed[]> {
    console.log(`🔄 Fetching RSS via RSS2JSON: ${rssUrl}`);
    
    for (let i = 0; i < this.APIS.length; i++) {
      try {
        const apiUrl = this.buildApiUrl(this.APIS[i], rssUrl);
        console.log(`📡 Trying API ${i + 1}: ${this.APIS[i]}`);
        
        const response = await fetch(apiUrl, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (compatible; RSS-Reader/1.0)',
          },
          signal: AbortSignal.timeout(15000) // Increased timeout to 15 seconds
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${response.statusText}. Response: ${errorText.substring(0, 100)}`);
        }

        const data = await response.json();
        
        // Validate response based on API type
        if (!this.validateResponse(data, this.APIS[i])) {
          throw new Error(`Invalid response format from ${this.APIS[i]}`);
        }

        // Convert to our Feed format
        const feeds = this.convertToFeedFormat(data, rssUrl);
        
        if (feeds.length === 0) {
          throw new Error('No feed items found in response');
        }

        console.log(`✅ Successfully fetched ${feeds.length} items from ${this.APIS[i]}`);
        return feeds;

      } catch (error) {
        console.warn(`❌ API ${i + 1} failed:`, error);
        
        // If this was the last API, throw the error
        if (i === this.APIS.length - 1) {
          throw new Error(`All RSS2JSON APIs failed. Last error: ${error}`);
        }
        
        // Add a small delay before trying the next API
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    throw new Error('Unexpected error in RSS2JSON service');
  }

  private static validateResponse(data: any, apiUrl: string): boolean {
    if (!data) return false;
    
    // rss2json.vercel.app format (working API)
    if (apiUrl.includes('rss2json.vercel.app')) {
      return Array.isArray(data.items) || Array.isArray(data);
    }
    
    // RSS2JSON.com format (free tier)
    if (apiUrl.includes('rss2json.com')) {
      return data.status === 'ok' && Array.isArray(data.items);
    }
    
    // Feed2JSON format
    if (apiUrl.includes('feed2json.org')) {
      return Array.isArray(data.items) || Array.isArray(data);
    }
    
    // Generic validation
    return data.items && Array.isArray(data.items);
  }

  private static buildApiUrl(apiBase: string, rssUrl: string): string {
    const encodedUrl = encodeURIComponent(rssUrl);
    
    switch (apiBase) {
      case 'https://rss2json.vercel.app/api':
        return `${apiBase}?url=${encodedUrl}`;
      case 'https://api.rss2json.com/v1/api.json':
        // Remove count parameter for free tier
        return `${apiBase}?rss_url=${encodedUrl}`;
      case 'https://feed2json.org/convert':
        return `${apiBase}?url=${encodedUrl}`;
      default:
        return `${apiBase}?url=${encodedUrl}`;
    }
  }

  private static convertToFeedFormat(data: any, originalUrl: string): Feed[] {
    try {
      // Handle different API response formats
      const feedData = data.feed || data;
      const items = data.items || data.entries || [];

      if (!Array.isArray(items)) {
        throw new Error('No items array found in response');
      }

      return items.map((item: any, index: number) => {
        // Handle different date formats
        let pubDate = item.pubDate || item.published || item.date_published || new Date().toISOString();
        
        // Ensure date is in ISO format
        if (pubDate && !pubDate.includes('T')) {
          try {
            pubDate = new Date(pubDate).toISOString();
          } catch {
            pubDate = new Date().toISOString();
          }
        }

        return {
          id: `${originalUrl}-${index}`,
          name: feedData.title || 'Unknown Feed',
          url: originalUrl,
          title: item.title || 'No Title',
          link: item.link || item.url || originalUrl,
          pubDate: pubDate,
          description: this.cleanHtml(item.description || item.summary || ''),
          content: this.cleanHtml(item.content || item.description || item.summary || ''),
          feedListId: '1',
          author: item.author || feedData.author || 'Unknown Author',
          categories: Array.isArray(item.categories) ? item.categories : [],
          media: this.extractMedia(item),
        } as Feed;
      });
    } catch (error) {
      console.error('Error converting RSS2JSON data:', error);
      throw new Error('Failed to convert RSS data to feed format');
    }
  }

  private static extractMedia(item: any): { url: string, type: string }[] {
    const media: { url: string, type: string }[] = [];

    // Check for enclosure (podcast/media)
    if (item.enclosure && item.enclosure.link) {
      media.push({
        url: item.enclosure.link,
        type: item.enclosure.type || 'unknown'
      });
    }

    // Check for thumbnail
    if (item.thumbnail) {
      media.push({
        url: item.thumbnail,
        type: 'image'
      });
    }

    // Check for image in content
    if (item.image) {
      media.push({
        url: item.image,
        type: 'image'
      });
    }

    return media;
  }

  private static cleanHtml(html: string): string {
    if (!html) return '';
    
    // Remove HTML tags but preserve content
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .trim();
  }
}
