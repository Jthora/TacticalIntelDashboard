/**
 * Data Normalization Service
 * Converts various API responses to unified NormalizedDataItem format
 */

import { 
  AlphaVantageNewsResponse,
  NASAAPODResponse, 
  NOAAAlertResponse, 
  NormalizedDataItem, 
  RedditPostResponse
} from '../types/ModernAPITypes';

export class DataNormalizer {
  /**
   * NOAA Weather Alert Normalization
   */
  static normalizeNOAAAlert(response: NOAAAlertResponse): NormalizedDataItem[] {
    // Guard against unexpected shapes
    const features = Array.isArray((response as any)?.features) ? (response as any).features : [];
    if (features.length === 0) return [];

    const stripHTML = (html?: string): string => {
      if (!html) return '';
      return String(html).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    };

    return features.map((alert: any) => {
      const p = alert?.properties || {};
      const parameters = p.parameters || {};
      const nwsHeadline = Array.isArray(parameters.NWSheadline) ? parameters.NWSheadline[0] : parameters.NWSheadline;
      const title = p.headline || p.event || nwsHeadline || 'NOAA Alert';
      const desc = stripHTML(p.description) || stripHTML(p.instruction) || title;
      const url = p.web || p['@id'] || '';
      const publishedStr = p.sent || p.effective || p.onset || p.expires;
      let publishedAt = new Date();
      try {
        if (publishedStr) {
          const d = new Date(publishedStr);
          if (!isNaN(d.getTime())) publishedAt = d;
        }
      } catch {}

      return {
        id: alert.id || p.id || `${title}-${Date.now()}`,
        title,
        summary: (desc || title).substring(0, 500) + '...',
        url,
        publishedAt,
        source: 'NOAA Weather Service',
        category: 'weather-alert',
        tags: [p.event, p.severity, 'weather'].filter(Boolean) as string[],
        priority: this.mapSeverityToPriority(p.severity),
        trustRating: 95,
        verificationStatus: 'OFFICIAL',
        dataQuality: 98,
        metadata: {
          severity: p.severity,
          urgency: p.urgency,
          areas: p.areaDesc,
          event: p.event,
          parameters
        }
      };
    });
  }

  /**
   * NASA APOD Normalization
   */
  static normalizeNASAAPOD(response: NASAAPODResponse): NormalizedDataItem {
    return {
      id: `nasa-apod-${response.date}`,
      title: response.title,
      summary: response.explanation.substring(0, 500) + '...',
      url: response.url,
      publishedAt: new Date(response.date),
      source: 'NASA APOD',
      category: 'space',
      tags: ['astronomy', 'space', 'nasa', 'image'],
      priority: 'medium',
      trustRating: 100, // Official NASA source
      verificationStatus: 'OFFICIAL',
      dataQuality: 100,
      metadata: {
        mediaType: response.media_type,
        hdUrl: response.hdurl,
        copyright: response.copyright,
        fullExplanation: response.explanation
      }
    };
  }

  /**
   * GitHub Security Advisory Normalization (handles both array and object forms)
   */
  static normalizeGitHubSecurityAdvisories(response: any): NormalizedDataItem[] {
    const advisories: any[] = Array.isArray(response)
      ? response
      : Array.isArray(response?.security_advisories)
      ? response.security_advisories
      : [];

    const mapCvssToPriority = (score?: number): 'low' | 'medium' | 'high' | 'critical' => {
      if (typeof score !== 'number') return 'medium';
      if (score >= 9.0) return 'critical';
      if (score >= 7.0) return 'high';
      if (score >= 4.0) return 'medium';
      return 'low';
    };

    return advisories.map((advisory: any) => {
      const id = advisory.id || advisory.ghsa_id || advisory.cve_id || `ghsa-${Date.now()}`;
      const cve = advisory.cve_id || advisory.identifiers?.find?.((i: any) => i.type === 'CVE')?.value;
      const summary = advisory.summary || advisory.description || 'Security advisory';
      const htmlUrl = advisory.html_url || advisory.url || advisory.repository_advisory_url || '';
      const published = advisory.published_at || advisory.github_reviewed_at || advisory.updated_at;
      const cvssScore = advisory.cvss?.score || advisory.cvss_severities?.cvss_v3?.score || advisory.cvss_severities?.cvss_v4?.score;
      const severity = String(advisory.severity || '').toLowerCase();

      // Priority from CVSS if present, else from severity label
      const priority = typeof cvssScore === 'number'
        ? mapCvssToPriority(cvssScore)
        : (severity === 'critical' ? 'critical' : severity === 'high' ? 'high' : severity === 'low' ? 'low' : 'medium');

      return {
        id,
        title: summary,
        summary: String(advisory.description || summary).substring(0, 500) + '...',
        url: htmlUrl,
        publishedAt: published ? new Date(published) : new Date(),
        source: 'GitHub Security',
        category: 'security',
        tags: ['security', 'vulnerability', advisory.severity || 'unknown', cve].filter(Boolean) as string[],
        priority,
        trustRating: 90,
        verificationStatus: 'OFFICIAL',
        dataQuality: 95,
        metadata: {
          cveId: cve,
          identifiers: advisory.identifiers,
          references: advisory.references,
          cvss: advisory.cvss || advisory.cvss_severities,
          vulnerabilities: advisory.vulnerabilities,
          cwes: advisory.cwes,
          withdrawnAt: advisory.withdrawn_at
        }
      } as NormalizedDataItem;
    });
  }

  /**
   * Alpha Vantage Financial News Normalization
   */
  static normalizeAlphaVantageNews(response: AlphaVantageNewsResponse): NormalizedDataItem[] {
    return response.feed.map(article => ({
      id: `av-${article.url.split('/').pop()}`,
      title: article.title,
      summary: article.summary.substring(0, 500) + '...',
      url: article.url,
      publishedAt: new Date(article.time_published),
      source: `${article.source} (Alpha Vantage)`,
      category: 'financial',
      tags: ['finance', 'news', article.category_within_source],
      priority: this.mapSentimentToPriority(article.overall_sentiment_score),
      trustRating: 80, // Third-party aggregator
      verificationStatus: 'VERIFIED',
      dataQuality: 85,
      metadata: {
        bannerImage: article.banner_image,
        sentimentScore: article.overall_sentiment_score,
        sentimentLabel: article.overall_sentiment_label,
        tickerSentiment: article.ticker_sentiment,
        sourceCategory: article.category_within_source
      }
    }));
  }

  /**
   * Reddit Post Normalization (subreddit derived per item when not provided)
   */
  static normalizeRedditPosts(response: RedditPostResponse, subreddit: string): NormalizedDataItem[] {
    return response.data.children.map(post => {
      const createdUtc = post.data.created_utc;
      let publishedDate: Date;
      try {
        if (typeof createdUtc === 'number' && !isNaN(createdUtc)) {
          publishedDate = new Date(createdUtc * 1000);
          if (isNaN(publishedDate.getTime())) publishedDate = new Date();
        } else {
          publishedDate = new Date();
        }
      } catch {
        publishedDate = new Date();
      }

      const sub = post.data.subreddit || subreddit || 'reddit';

      return {
        id: `reddit-${post.data.id}`,
        title: post.data.title,
        summary: post.data.selftext ? String(post.data.selftext).substring(0, 500) + '...' : 'Click to view discussion',
        url: post.data.url?.startsWith('http') ? post.data.url : `https://reddit.com${post.data.url || ''}`,
        publishedAt: publishedDate,
        source: `Reddit r/${sub}`,
        category: 'social',
        tags: ['reddit', 'discussion', sub],
        priority: this.mapScoreToPriority(post.data.score),
        trustRating: 60,
        verificationStatus: 'UNVERIFIED',
        dataQuality: 75,
        metadata: {
          author: post.data.author,
          score: post.data.score,
          numComments: post.data.num_comments,
          ups: post.data.ups,
          downs: post.data.downs,
          subreddit: sub,
          redditPostId: post.data.id,
          commentsUrl: `https://reddit.com/r/${sub}/comments/${post.data.id}/`,
          originalUrl: post.data.url
        }
      };
    });
  }

  /**
   * USGS Earthquake Data Normalization
   */
  static normalizeUSGSEarthquakes(geoJsonResponse: any): NormalizedDataItem[] {
    const features = Array.isArray(geoJsonResponse?.features) ? geoJsonResponse.features : [];
    if (features.length === 0) return [];

    return features.map((earthquake: any) => {
      const p = earthquake?.properties || {};
      const g = earthquake?.geometry || {};
      const coords = Array.isArray(g.coordinates) ? g.coordinates : [];
      const mag = typeof p.mag === 'number' ? p.mag : 0;
      const place = p.place || 'Unknown location';
      const title = p.title || (mag ? `M${mag} Earthquake - ${place}` : `Earthquake - ${place}`);
      const url = p.url || `https://earthquake.usgs.gov/earthquakes/eventpage/${earthquake?.id || ''}`;
      const time = typeof p.time === 'number' ? p.time : Date.now();

      return {
        id: earthquake?.id || `${time}-${place}`,
        title,
        summary: `Magnitude ${mag} earthquake ${place}`,
        url,
        publishedAt: new Date(time),
        source: 'USGS Earthquake Hazards',
        category: 'seismic',
        tags: ['earthquake', 'geology', 'hazard'],
        priority: this.mapMagnitudeToPriority(mag),
        trustRating: 98,
        verificationStatus: 'OFFICIAL',
        dataQuality: 100,
        metadata: {
          magnitude: mag,
          location: place,
          depth: typeof coords[2] === 'number' ? coords[2] : undefined,
          latitude: typeof coords[1] === 'number' ? coords[1] : undefined,
          longitude: typeof coords[0] === 'number' ? coords[0] : undefined,
          magType: p.magType,
          significance: p.sig,
          felt: p.felt
        }
      };
    });
  }

  /**
   * CoinGecko Data Normalization
   */
  static normalizeCoinGeckoData(response: any): NormalizedDataItem[] {
    const items: NormalizedDataItem[] = [];

    // /search/trending response
    if (response && Array.isArray(response.coins)) {
      for (const c of response.coins) {
        const coin = c.item || c;
        items.push({
          id: `cg-${coin.id}`,
          title: coin.name || coin.symbol || 'Crypto Asset',
          summary: `Trending: ${coin.name || coin.symbol}`,
          url: coin.id ? `https://www.coingecko.com/en/coins/${coin.id}` : 'https://www.coingecko.com',
          publishedAt: new Date(),
          source: 'CoinGecko',
          category: 'financial',
          tags: ['crypto', 'trending'],
          priority: 'medium',
          trustRating: 80,
          verificationStatus: 'VERIFIED',
          dataQuality: 85,
          metadata: coin
        });
      }
    }

    // /coins/markets response
    else if (Array.isArray(response)) {
      for (const coin of response) {
        items.push({
          id: `cg-${coin.id}`,
          title: coin.name || coin.symbol || 'Crypto Asset',
          summary: `${coin.name || coin.symbol} price: $${coin.current_price}`,
          url: `https://www.coingecko.com/en/coins/${coin.id}`,
          publishedAt: new Date(),
          source: 'CoinGecko',
          category: 'financial',
          tags: ['crypto', 'markets'],
          priority: 'medium',
          trustRating: 80,
          verificationStatus: 'VERIFIED',
          dataQuality: 85,
          metadata: coin
        });
      }
    }

    // /global response
    else if (response && response.data) {
      items.push({
        id: `cg-global-${Date.now()}`,
        title: 'Crypto Market Overview',
        summary: `Active Cryptocurrencies: ${response.data.active_cryptocurrencies}`,
        url: 'https://www.coingecko.com',
        publishedAt: new Date(),
        source: 'CoinGecko',
        category: 'financial',
        tags: ['crypto', 'global'],
        priority: 'medium',
        trustRating: 80,
        verificationStatus: 'VERIFIED',
        dataQuality: 85,
        metadata: response.data
      });
    }

    return items;
  }

  /**
   * Priority Mapping Utilities
   */
  private static mapSeverityToPriority(severity?: string): 'low' | 'medium' | 'high' | 'critical' {
    if (!severity) return 'low';
    const severityLower = String(severity).toLowerCase();
    if (severityLower.includes('extreme') || severityLower.includes('critical')) return 'critical';
    if (severityLower.includes('severe') || severityLower.includes('major') || severityLower.includes('significant')) return 'high';
    if (severityLower.includes('moderate') || severityLower.includes('minor')) return 'medium';
    return 'low';
  }

  private static mapSentimentToPriority(sentimentScore: number): 'low' | 'medium' | 'high' | 'critical' {
    const absScore = Math.abs(sentimentScore);
    if (absScore > 0.8) return 'critical';
    if (absScore > 0.5) return 'high';
    if (absScore > 0.2) return 'medium';
    return 'low';
  }

  private static mapScoreToPriority(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score > 1000) return 'critical';
    if (score > 500) return 'high';
    if (score > 100) return 'medium';
    return 'low';
  }

  private static mapMagnitudeToPriority(magnitude?: number | null): 'low' | 'medium' | 'high' | 'critical' {
    const mag = typeof magnitude === 'number' ? magnitude : 0;
    if (mag >= 7.0) return 'critical';
    if (mag >= 6.0) return 'high';
    if (mag >= 4.0) return 'medium';
    return 'low';
  }

  /**
   * Generic normalization for unknown data formats
   */
  static normalizeGeneric(data: any, source: string, category: string): NormalizedDataItem {
    return {
      id: data.id || `${source}-${Date.now()}`,
      title: data.title || data.name || data.headline || 'Untitled',
      summary: data.summary || data.description || data.content || 'No description available',
      url: data.url || data.link || data.href || '',
      publishedAt: new Date(data.publishedAt || data.created || data.timestamp || Date.now()),
      source,
      category,
      tags: data.tags || [category],
      priority: 'medium',
      trustRating: 50,
      verificationStatus: 'UNVERIFIED',
      dataQuality: 60,
      metadata: data
    };
  }

  /**
   * Hacker News Normalization (single item) — enriched
   */
  static normalizeHackerNewsItem(item: any): NormalizedDataItem {
    const itemId = item?.id || 'unknown';
    const itemTime = item?.time && typeof item.time === 'number' ? item.time : Math.floor(Date.now() / 1000);

    const stripHTML = (html?: string) => (html ? String(html).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : '');

    let publishedDate: Date;
    try {
      publishedDate = new Date(itemTime * 1000);
      if (isNaN(publishedDate.getTime())) publishedDate = new Date();
    } catch {
      publishedDate = new Date();
    }

    const title = item?.title || (item?.type === 'ask' ? 'Ask HN' : 'Hacker News Discussion');
    const text = stripHTML(item?.text);
    const type = String(item?.type || 'story');

    const tags = ['hackernews'];
    if (/^Ask HN/i.test(title)) tags.push('ask-hn');
    if (/^Show HN/i.test(title)) tags.push('show-hn');

    return {
      id: `hn-${itemId}`,
      title,
      summary: text ? text.substring(0, 500) + '...' : 'Click to view discussion',
      url: item?.url || `https://news.ycombinator.com/item?id=${itemId}`,
      publishedAt: publishedDate,
      source: 'Hacker News',
      category: type === 'job' ? 'jobs' : 'technology',
      tags,
      priority: this.mapScoreToPriority(item?.score || 0),
      trustRating: 75,
      verificationStatus: 'UNVERIFIED',
      dataQuality: 85,
      metadata: {
        by: item?.by,
        score: item?.score,
        descendants: item?.descendants,
        type: item?.type,
        kids: item?.kids
      }
    };
  }
}
