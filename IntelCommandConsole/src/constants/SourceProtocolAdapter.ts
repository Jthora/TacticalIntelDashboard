/**
 * Source Protocol Adapter
 * Generated on: 2025-07-08T10:44:20.940Z
 * This adapter handles different protocols for the Tactical Intelligence Dashboard
 */

import { SourceProtocol } from './EarthAllianceSources';

// Interface for protocol handlers
export interface ProtocolHandler {
  fetchData: (endpoint: string) => Promise<any>;
  parseData: (data: any) => any[];
  isSupported: (endpoint: string) => boolean;
}

// RSS Protocol Handler
class RssProtocolHandler implements ProtocolHandler {
  fetchData = async (endpoint: string): Promise<any> => {
    try {
      // Import the RSS2JSONService for better CORS handling
      const { RSS2JSONService } = await import('../services/RSS2JSONService');
      
      try {
        // Use the RSS2JSONService to fetch with CORS support
        const feeds = await RSS2JSONService.fetchFeed(endpoint);
        
        if (feeds && feeds.length > 0) {
          return feeds;
        }
      } catch (rssServiceError) {
        console.warn(`RSS2JSONService failed for ${endpoint}:`, rssServiceError);
        // Continue to fallback methods
      }
      
      // If RSS2JSONService fails, try with a CORS proxy
      console.log(`Trying to fetch ${endpoint} with CORS proxy...`);
      
      // Try with corsProxy.io (reliable CORS proxy)
      try {
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(endpoint)}`;
        const response = await fetch(proxyUrl);
        
        if (response.ok) {
          const text = await response.text();
          return text;
        }
      } catch (proxyError) {
        console.warn(`CORS proxy failed for ${endpoint}:`, proxyError);
      }
      
      // Last resort: direct fetch (might hit CORS issues)
      console.log(`All proxies failed, trying direct fetch for ${endpoint}...`);
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.text();
    } catch (error) {
      console.error('Error fetching RSS feed:', error);
      throw error;
    }
  };

  parseData = (data: any): any[] => {
    // If data is already an array of Feed objects from RSS2JSONService
    if (Array.isArray(data) && data.length > 0 && 
        (data[0].title || data[0].name || data[0].id)) {
      return data.map((item: any) => ({
        title: item.title || item.name || 'No title',
        link: item.link || item.url || '',
        description: item.description || 'No description',
        pubDate: item.pubDate || new Date().toISOString(),
        content: item.content || item.description || '',
        categories: item.categories || []
      }));
    }
    
    // If data is RSS2JSON format with feed.items structure
    if (data && data.feed && Array.isArray(data.items)) {
      return data.items.map((item: any) => ({
        title: item.title || 'No title',
        link: item.link || '',
        description: item.description || 'No description',
        pubDate: item.pubDate || new Date().toISOString(),
        content: item.content || item.description || '',
        categories: item.categories || []
      }));
    }
    
    // Otherwise parse as XML string
    try {
      // Use a DOM parser to extract RSS/XML data
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(data, 'text/xml');
      const items = xmlDoc.querySelectorAll('item');
      
      return Array.from(items).map(item => ({
        title: item.querySelector('title')?.textContent || 'No title',
        link: item.querySelector('link')?.textContent || '',
        description: item.querySelector('description')?.textContent || 'No description',
        pubDate: item.querySelector('pubDate')?.textContent || new Date().toISOString(),
        content: item.querySelector('content:encoded')?.textContent || 
                 item.querySelector('description')?.textContent || '',
        categories: Array.from(item.querySelectorAll('category'))
                     .map(cat => cat.textContent || '')
      }));
    } catch (error) {
      console.error('Error parsing XML data:', error);
      return [];
    }
  };

  isSupported = (endpoint: string): boolean => {
    return endpoint.toLowerCase().includes('rss') || 
           endpoint.toLowerCase().endsWith('.xml');
  };
}

// JSON Protocol Handler
class JsonProtocolHandler implements ProtocolHandler {
  fetchData = async (endpoint: string): Promise<any> => {
    try {
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching JSON feed:', error);
      throw error;
    }
  };

  parseData = (data: any): any[] => {
    // Handle JSON Feed format (https://jsonfeed.org/)
    if (data.items && Array.isArray(data.items)) {
      return data.items.map((item: any) => ({
        title: item.title || 'No title',
        link: item.url || item.external_url || '',
        description: item.summary || 'No description',
        pubDate: item.date_published || new Date().toISOString(),
        content: item.content_html || item.content_text || item.summary || '',
        categories: item.tags || []
      }));
    }
    
    // Handle API responses with articles array
    if (data.articles && Array.isArray(data.articles)) {
      return data.articles.map((article: any) => ({
        title: article.title || 'No title',
        link: article.url || '',
        description: article.description || 'No description',
        pubDate: article.publishedAt || new Date().toISOString(),
        content: article.content || article.description || '',
        categories: article.categories || []
      }));
    }
    
    // Handle array of items directly
    if (Array.isArray(data)) {
      return data.map(item => ({
        title: item.title || 'No title',
        link: item.url || item.link || '',
        description: item.description || item.summary || 'No description',
        pubDate: item.pubDate || item.date || item.published || new Date().toISOString(),
        content: item.content || item.body || item.description || '',
        categories: item.categories || item.tags || []
      }));
    }
    
    console.error('Unrecognized JSON structure', data);
    return [];
  };

  isSupported = (endpoint: string): boolean => {
    return endpoint.toLowerCase().endsWith('.json') || 
           endpoint.toLowerCase().includes('json') ||
           endpoint.toLowerCase().includes('api');
  };
}

// API Protocol Handler (extends JSON handler with authentication)
class ApiProtocolHandler extends JsonProtocolHandler {
  // Override fetchData to add authorization headers if needed
  fetchData = async (endpoint: string): Promise<any> => {
    try {
      // Check for API key in localStorage or environment
      const apiKey = localStorage.getItem('earth_alliance_api_key') || '';
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching API data:', error);
      throw error;
    }
  };

  isSupported = (endpoint: string): boolean => {
    return endpoint.toLowerCase().includes('api') && 
           !endpoint.toLowerCase().includes('rss') &&
           !endpoint.toLowerCase().includes('atom');
  };
}

// IPFS Protocol Handler
class IpfsProtocolHandler implements ProtocolHandler {
  ipfsGateway = 'https://ipfs.io/ipfs/';
  
  fetchData = async (endpoint: string): Promise<any> => {
    try {
      // Convert ipfs:// URL to HTTP gateway URL
      let url = endpoint;
      if (endpoint.startsWith('ipfs://')) {
        const cid = endpoint.replace('ipfs://', '');
        url = `${this.ipfsGateway}${cid}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Try to parse as JSON first
      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch {
        // Not JSON, return as text
        return text;
      }
    } catch (error) {
      console.error('Error fetching IPFS content:', error);
      throw error;
    }
  };

  parseData = (data: any): any[] => {
    // If already parsed as JSON, use JSON handler
    if (typeof data === 'object') {
      return new JsonProtocolHandler().parseData(data);
    }
    
    // If text, try to parse as XML/RSS
    try {
      return new RssProtocolHandler().parseData(data);
    } catch {
      // If cannot parse as RSS, create a single item with the content
      return [{
        title: 'IPFS Content',
        link: '',
        description: 'Content retrieved from IPFS',
        pubDate: new Date().toISOString(),
        content: data,
        categories: ['ipfs']
      }];
    }
  };

  isSupported = (endpoint: string): boolean => {
    return endpoint.startsWith('ipfs://') || 
           endpoint.includes('ipfs.io') ||
           endpoint.includes('/ipfs/');
  };
}

// Mastodon Protocol Handler
class MastodonProtocolHandler implements ProtocolHandler {
  fetchData = async (endpoint: string): Promise<any> => {
    try {
      // Convert Mastodon instance URL to public timeline API
      let url = endpoint;
      if (!url.includes('/api/')) {
        // Assume it's an instance URL, get public timeline
        url = url.endsWith('/') ? url : `${url}/`;
        url = `${url}api/v1/timelines/public`;
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching Mastodon data:', error);
      throw error;
    }
  };

  parseData = (data: any): any[] => {
    // Handle Mastodon toots
    if (Array.isArray(data)) {
      return data.map(toot => ({
        title: `${toot.account.display_name || toot.account.username}`,
        link: toot.url,
        description: this.stripHtml(toot.content),
        pubDate: toot.created_at,
        content: toot.content,
        categories: toot.tags ? toot.tags.map((t: any) => t.name) : [],
        author: toot.account.display_name || toot.account.username
      }));
    }
    
    return [];
  };

  stripHtml = (html: string): string => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  };

  isSupported = (endpoint: string): boolean => {
    return endpoint.includes('mastodon') || 
           endpoint.includes('.social/') ||
           endpoint.includes('/api/v1/timelines');
  };
}

// SSB Protocol Handler (Secure Scuttlebutt)
class SsbProtocolHandler implements ProtocolHandler {
  // Note: SSB requires special client-side handling
  // This is a simplified implementation
  fetchData = async (endpoint: string): Promise<any> => {
    // For browser environments, this would use a proxy or gateway
    console.warn('SSB protocol handler is a placeholder - requires server-side or extension support');
    
    // In a real implementation, this would connect to an SSB peer
    // For now, return mock data
    return [
      {
        title: 'SSB Message',
        content: 'This is a placeholder for SSB content. SSB requires special handling.',
        author: endpoint.replace('ssb://', '').split('/')[0]
      }
    ];
  };

  parseData = (data: any): any[] => {
    // Already formatted in fetchData for this example
    return data.map((msg: any) => ({
      title: msg.title || `Message from ${msg.author || 'Unknown'}`,
      link: `ssb://${msg.author || 'unknown'}`,
      description: msg.content,
      pubDate: msg.timestamp || new Date().toISOString(),
      content: msg.content,
      categories: ['ssb']
    }));
  };

  isSupported = (endpoint: string): boolean => {
    return endpoint.startsWith('ssb://');
  };
}

// Protocol Adapter Factory
export class SourceProtocolAdapter {
  private handlers: ProtocolHandler[] = [
    new RssProtocolHandler(),
    new JsonProtocolHandler(), 
    new ApiProtocolHandler(),
    new IpfsProtocolHandler(),
    new MastodonProtocolHandler(),
    new SsbProtocolHandler()
  ];

  // Get appropriate handler for endpoint
  getHandler(endpoint: string): ProtocolHandler {
    const handler = this.handlers.find(h => h.isSupported(endpoint));
    if (!handler) {
      console.warn(`No handler found for endpoint: ${endpoint}, using default`);
      return new RssProtocolHandler(); // Default to RSS
    }
    return handler;
  }

  // Get handler by protocol type
  getHandlerByProtocol(protocol: SourceProtocol): ProtocolHandler {
    switch (protocol) {
      case SourceProtocol.RSS:
        return new RssProtocolHandler();
      case SourceProtocol.JSON:
        return new JsonProtocolHandler();
      case SourceProtocol.API:
        return new ApiProtocolHandler();
      case SourceProtocol.IPFS:
        return new IpfsProtocolHandler();
      case SourceProtocol.MASTODON:
        return new MastodonProtocolHandler();
      case SourceProtocol.SSB:
        return new SsbProtocolHandler();
      default:
        console.warn(`Unknown protocol: ${protocol}, using default`);
        return new RssProtocolHandler();
    }
  }

  // Fetch and parse data from any supported endpoint
  async fetchAndParse(endpoint: string): Promise<any[]> {
    const handler = this.getHandler(endpoint);
    const data = await handler.fetchData(endpoint);
    return handler.parseData(data);
  }
}

// Create a singleton instance
export const protocolAdapter = new SourceProtocolAdapter();
