/**
 * Data Normalization Service
 * Converts various API responses to unified NormalizedDataItem format
 */

import { 
  NormalizedDataItem, 
  NOAAAlertResponse, 
  NASAAPODResponse, 
  GitHubSecurityAdvisoryResponse,
  AlphaVantageNewsResponse,
  RedditPostResponse
} from '../types/ModernAPITypes';

export class DataNormalizer {
  /**
   * NOAA Weather Alert Normalization
   */
  static normalizeNOAAAlert(response: NOAAAlertResponse): NormalizedDataItem[] {
    return response.features.map(alert => ({
      id: alert.id,
      title: alert.properties.headline,
      summary: alert.properties.description.substring(0, 500) + '...',
      url: alert.properties.web || '',
      publishedAt: new Date(alert.properties.sent),
      source: 'NOAA Weather Service',
      category: 'weather-alert',
      tags: [alert.properties.event, alert.properties.severity, 'weather'],
      priority: this.mapSeverityToPriority(alert.properties.severity),
      trustRating: 95, // Official government source
      verificationStatus: 'OFFICIAL',
      dataQuality: 98,
      metadata: {
        severity: alert.properties.severity,
        urgency: alert.properties.urgency,
        areas: alert.properties.areaDesc,
        event: alert.properties.event
      }
    }));
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
   * GitHub Security Advisory Normalization
   */
  static normalizeGitHubSecurityAdvisories(response: GitHubSecurityAdvisoryResponse): NormalizedDataItem[] {
    return response.security_advisories.map(advisory => ({
      id: advisory.id,
      title: advisory.summary,
      summary: advisory.description.substring(0, 500) + '...',
      url: advisory.html_url,
      publishedAt: new Date(advisory.published_at),
      source: 'GitHub Security',
      category: 'security',
      tags: ['security', 'vulnerability', advisory.severity, 'github'],
      priority: this.mapSeverityToPriority(advisory.severity),
      trustRating: 90, // Official GitHub security
      verificationStatus: 'OFFICIAL',
      dataQuality: 95,
      metadata: {
        severity: advisory.severity,
        cveId: advisory.cve_id,
        updatedAt: advisory.updated_at,
        references: advisory.references,
        fullDescription: advisory.description
      }
    }));
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
   * Reddit Post Normalization
   */
  static normalizeRedditPosts(response: RedditPostResponse, subreddit: string): NormalizedDataItem[] {
    return response.data.children.map(post => {
      // Validate timestamp for Reddit post
      const createdUtc = post.data.created_utc;
      let publishedDate: Date;
      
      try {
        if (typeof createdUtc === 'number' && !isNaN(createdUtc)) {
          publishedDate = new Date(createdUtc * 1000);
          // Check if the date is valid
          if (isNaN(publishedDate.getTime())) {
            console.warn(`TDD_WARNING: Invalid timestamp for Reddit post ${post.data.id}, using current time`);
            publishedDate = new Date();
          }
        } else {
          console.warn(`TDD_WARNING: Missing or invalid created_utc for Reddit post ${post.data.id}:`, createdUtc);
          publishedDate = new Date();
        }
      } catch (error) {
        console.warn(`TDD_WARNING: Error creating date for Reddit post ${post.data.id}:`, error);
        publishedDate = new Date();
      }

      return {
        id: `reddit-${post.data.id}`,
        title: post.data.title,
        summary: post.data.selftext ? 
          post.data.selftext.substring(0, 500) + '...' : 
          'Click to view discussion',
        url: post.data.url.startsWith('http') ? post.data.url : `https://reddit.com${post.data.url}`,
        publishedAt: publishedDate,
        source: `Reddit r/${subreddit}`,
        category: 'social',
        tags: ['reddit', 'discussion', subreddit],
        priority: this.mapScoreToPriority(post.data.score),
        trustRating: 60, // Social media content
        verificationStatus: 'UNVERIFIED',
        dataQuality: 70,
        metadata: {
          author: post.data.author,
          score: post.data.score,
          numComments: post.data.num_comments,
          ups: post.data.ups,
          downs: post.data.downs,
          subreddit: post.data.subreddit,
          // Add Reddit-specific URLs for better deep linking
          redditPostId: post.data.id,
          commentsUrl: `https://reddit.com/r/${subreddit}/comments/${post.data.id}/`,
          originalUrl: post.data.url
        }
      };
    });
  }

  /**
   * USGS Earthquake Data Normalization
   */
  static normalizeUSGSEarthquakes(geoJsonResponse: any): NormalizedDataItem[] {
    return geoJsonResponse.features.map((earthquake: any) => ({
      id: earthquake.id,
      title: `${earthquake.properties.title}`,
      summary: `Magnitude ${earthquake.properties.mag} earthquake ${earthquake.properties.place}`,
      url: earthquake.properties.url,
      publishedAt: new Date(earthquake.properties.time),
      source: 'USGS Earthquake Hazards',
      category: 'seismic',
      tags: ['earthquake', 'geology', 'hazard'],
      priority: this.mapMagnitudeToPriority(earthquake.properties.mag),
      trustRating: 98, // Official USGS data
      verificationStatus: 'OFFICIAL',
      dataQuality: 100,
      metadata: {
        magnitude: earthquake.properties.mag,
        location: earthquake.properties.place,
        depth: earthquake.geometry.coordinates[2],
        latitude: earthquake.geometry.coordinates[1],
        longitude: earthquake.geometry.coordinates[0],
        magType: earthquake.properties.magType,
        significance: earthquake.properties.sig,
        felt: earthquake.properties.felt
      }
    }));
  }

  /**
   * Hacker News Normalization
   */
  static normalizeHackerNewsItem(item: any): NormalizedDataItem {
    // Validate required fields and provide fallbacks
    const itemId = item.id || 'unknown';
    const itemTime = item.time && typeof item.time === 'number' ? item.time : Math.floor(Date.now() / 1000);
    
    // Create a valid date, with fallback to current time if invalid
    let publishedDate: Date;
    try {
      publishedDate = new Date(itemTime * 1000);
      // Check if the date is valid
      if (isNaN(publishedDate.getTime())) {
        console.warn(`TDD_WARNING: Invalid timestamp for Hacker News item ${itemId}, using current time`);
        publishedDate = new Date();
      }
    } catch (error) {
      console.warn(`TDD_WARNING: Error creating date for Hacker News item ${itemId}:`, error);
      publishedDate = new Date();
    }

    return {
      id: `hn-${itemId}`,
      title: item.title || 'Hacker News Discussion',
      summary: item.text ? item.text.substring(0, 500) + '...' : 'Click to view discussion',
      url: item.url || `https://news.ycombinator.com/item?id=${itemId}`,
      publishedAt: publishedDate,
      source: 'Hacker News',
      category: 'technology',
      tags: ['hackernews', 'technology', 'discussion'],
      priority: this.mapScoreToPriority(item.score || 0),
      trustRating: 75, // Tech community content
      verificationStatus: 'UNVERIFIED',
      dataQuality: 80,
      metadata: {
        by: item.by,
        score: item.score,
        descendants: item.descendants,
        type: item.type,
        kids: item.kids
      }
    };
  }

  /**
   * Priority Mapping Utilities
   */
  private static mapSeverityToPriority(severity: string): 'low' | 'medium' | 'high' | 'critical' {
    const severityLower = severity.toLowerCase();
    if (severityLower.includes('extreme') || severityLower.includes('critical')) return 'critical';
    if (severityLower.includes('severe') || severityLower.includes('major')) return 'high';
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

  private static mapMagnitudeToPriority(magnitude: number): 'low' | 'medium' | 'high' | 'critical' {
    if (magnitude >= 7.0) return 'critical';
    if (magnitude >= 6.0) return 'high';
    if (magnitude >= 4.0) return 'medium';
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
      trustRating: 50, // Unknown source
      verificationStatus: 'UNVERIFIED',
      dataQuality: 60,
      metadata: data
    };
  }
}
