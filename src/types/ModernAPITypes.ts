/**
 * Modern API Types for Tactical Intelligence Dashboard
 * Replaces RSS-based architecture with CORS-friendly JSON APIs
 */

export interface APIEndpoint {
  id: string;
  name: string;
  category: 'government' | 'financial' | 'technology' | 'social' | 'security' | 'weather' | 'space';
  baseUrl: string;
  endpoints: Record<string, string>;
  corsEnabled: boolean;
  apiKey?: string;
  requiresAuth: boolean;
  rateLimit: {
    requests: number;
    period: 'minute' | 'hour' | 'day';
  };
  documentation?: string;
  status: 'active' | 'deprecated' | 'maintenance';
}

export interface NormalizedDataItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  publishedAt: Date;
  source: string;
  category: string;
  tags: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  metadata?: Record<string, any>;
  // Enhanced intelligence metadata
  trustRating: number; // 1-100
  verificationStatus: 'VERIFIED' | 'UNVERIFIED' | 'OFFICIAL';
  responseTime?: number;
  dataQuality: number; // 1-100
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode: number;
  responseTime: number;
  cachedAt?: Date;
  rateLimitRemaining?: number;
}

export interface DataFetchOptions {
  cache?: boolean;
  maxAge?: number; // Cache duration in milliseconds
  retries?: number;
  timeout?: number;
  priority?: 'low' | 'normal' | 'high';
}

export interface IntelligenceSource {
  id: string;
  name: string;
  description: string;
  endpoint: APIEndpoint;
  normalizer: string; // Function name for data normalization
  refreshInterval: number; // Milliseconds
  enabled: boolean;
  tags: string[];
  lastFetched?: Date;
  healthScore: number; // 1-100
}

export interface RealTimeDataConfig {
  enableWebSocket?: boolean;
  enableSSE?: boolean;
  pollInterval?: number;
  maxConnections?: number;
  reconnectAttempts?: number;
}

export interface APIHealthMetrics {
  endpointId: string;
  successRate: number; // Percentage
  averageResponseTime: number; // Milliseconds
  lastSuccessfulFetch: Date;
  lastFailure?: {
    timestamp: Date;
    error: string;
    statusCode?: number;
  };
  uptime: number; // Percentage over last 24h
}

// API-specific response types
export interface NOAAAlertResponse {
  features: Array<{
    id: string;
    properties: {
      headline: string;
      description: string;
      web?: string;
      sent: string;
      event: string;
      severity: string;
      urgency: string;
      areaDesc: string;
    };
  }>;
}

export interface NASAAPODResponse {
  date: string;
  title: string;
  explanation: string;
  url: string;
  hdurl?: string;
  media_type: 'image' | 'video';
  copyright?: string;
}

export interface GitHubSecurityAdvisoryResponse {
  total_count: number;
  security_advisories: Array<{
    id: string;
    summary: string;
    description: string;
    html_url: string;
    published_at: string;
    updated_at: string;
    severity: string;
    cve_id?: string;
    references: Array<{
      url: string;
    }>;
  }>;
}

export interface AlphaVantageNewsResponse {
  feed: Array<{
    title: string;
    url: string;
    time_published: string;
    summary: string;
    banner_image?: string;
    source: string;
    category_within_source: string;
    overall_sentiment_score: number;
    overall_sentiment_label: string;
    ticker_sentiment: Array<{
      ticker: string;
      relevance_score: number;
      ticker_sentiment_score: number;
      ticker_sentiment_label: string;
    }>;
  }>;
}

export interface RedditPostResponse {
  data: {
    children: Array<{
      data: {
        id: string;
        title: string;
        selftext: string;
        url: string;
        created_utc: number;
        score: number;
        subreddit: string;
        author: string;
        num_comments: number;
        ups: number;
        downs: number;
      };
    }>;
  };
}

// Legacy RSS types for gradual migration
export interface LegacyFeedItem {
  id: string;
  title: string;
  link: string;
  pubDate: string;
  description: string;
  content: string;
  feedListId: string;
  author?: string;
  categories?: string[];
  media?: { url: string; type: string }[];
  trustRating?: number;
  verificationStatus?: 'VERIFIED' | 'UNVERIFIED';
  lastValidated?: string;
  responseTime?: number;
}

// Migration interface for RSS -> API transition
export interface MigrationMapping {
  rssUrl: string;
  apiEquivalent: IntelligenceSource;
  migrationStrategy: 'direct' | 'enhanced' | 'aggregate';
  priority: number;
}
