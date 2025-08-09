/**
 * Modern API Service
 * Replaces RSS-based architecture with CORS-friendly JSON APIs
 * Provides unified interface for fetching intelligence data
 */

import { 
  APIEndpoint, 
  APIHealthMetrics,
  APIResponse, 
  DataFetchOptions,
  NormalizedDataItem} from '../types/ModernAPITypes';
import { log } from '../utils/LoggerService';
import { DataNormalizer } from './DataNormalizer';
import { normalizerRegistry } from './NormalizerRegistry';

// TDD Error Tracking for ModernAPIService
const TDD_API_ERRORS = {
  logError: (id: string, location: string, issue: string, data?: any) => {
    console.error(`TDD_ERROR_${id}`, {
      location: `ModernAPIService.${location}`,
      issue,
      data,
      timestamp: new Date().toISOString()
    });
  },
  logSuccess: (id: string, location: string, message: string, data?: any) => {
    console.log(`TDD_SUCCESS_${id}`, {
      location: `ModernAPIService.${location}`,
      message,
      data,
      timestamp: new Date().toISOString()
    });
  }
};

export class ModernAPIService {
  private healthMetrics: Map<string, APIHealthMetrics> = new Map();
  private cache: Map<string, { data: any; timestamp: number; maxAge: number }> = new Map();
  private rateLimitTrackers: Map<string, { requests: number; resetTime: number }> = new Map();

  /**
   * Fetch data from a modern API endpoint
   */
  async fetchFromAPI<T = any>(
    endpoint: APIEndpoint, 
    apiPath: string, 
    options: DataFetchOptions = {}
  ): Promise<APIResponse<T>> {
    const startTime = Date.now();
    const cacheKey = `${endpoint.id}-${apiPath}`;
    
    // TDD_ERROR_008: Validate inputs
    if (!endpoint) {
      TDD_API_ERRORS.logError('008', 'fetchFromAPI', 'Endpoint parameter is null/undefined', { apiPath, options });
      throw new Error('Endpoint parameter is required');
    }
    if (!endpoint.id) {
      TDD_API_ERRORS.logError('009', 'fetchFromAPI', 'Endpoint missing id', endpoint);
      throw new Error('Endpoint must have an id');
    }
    if (!endpoint.baseUrl) {
      TDD_API_ERRORS.logError('010', 'fetchFromAPI', 'Endpoint missing baseUrl', endpoint);
      throw new Error('Endpoint must have a baseUrl');
    }
    if (!apiPath) {
      TDD_API_ERRORS.logError('011', 'fetchFromAPI', 'apiPath parameter is null/undefined', { endpoint: endpoint.id, options });
      throw new Error('apiPath parameter is required');
    }
    
    TDD_API_ERRORS.logSuccess('012', 'fetchFromAPI', 'Starting API fetch', { 
      endpointId: endpoint.id, 
      apiPath, 
      corsEnabled: endpoint.corsEnabled,
      requiresAuth: endpoint.requiresAuth 
    });
    
    try {
      // Check cache first
      if (options.cache !== false) {
        const cached = this.getCachedData<T>(cacheKey, options.maxAge);
        if (cached) {
          log.info('ModernAPIService', `Cache hit for ${endpoint.name}: ${apiPath}`);
          TDD_API_ERRORS.logSuccess('013', 'fetchFromAPI', 'Cache hit', { endpointId: endpoint.id, apiPath });
          return cached;
        } else {
          TDD_API_ERRORS.logSuccess('014', 'fetchFromAPI', 'Cache miss', { endpointId: endpoint.id, apiPath });
        }
      }

      // Check rate limits
      if (!this.checkRateLimit(endpoint)) {
        TDD_API_ERRORS.logError('015', 'fetchFromAPI', 'Rate limit exceeded', { endpointId: endpoint.id, apiPath });
        throw new Error(`Rate limit exceeded for ${endpoint.name}`);
      }

      // Build URL
      const url = this.buildURL(endpoint, apiPath);
      TDD_API_ERRORS.logSuccess('016', 'fetchFromAPI', 'URL built successfully', { endpointId: endpoint.id, url });
      log.info('ModernAPIService', `Fetching from ${endpoint.name}: ${url}`);

      // Make request
      TDD_API_ERRORS.logSuccess('017', 'fetchFromAPI', 'About to make HTTP request', { endpointId: endpoint.id, url });
      const response = await this.makeRequest(url, endpoint, options);
      const responseTime = Date.now() - startTime;
      
      TDD_API_ERRORS.logSuccess('018', 'fetchFromAPI', 'HTTP request completed', { 
        endpointId: endpoint.id, 
        status: response.status, 
        ok: response.ok,
        responseTime 
      });

      if (!response.ok) {
        TDD_API_ERRORS.logError('019', 'fetchFromAPI', `HTTP error response`, { 
          endpointId: endpoint.id, 
          status: response.status, 
          statusText: response.statusText,
          url 
        });
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      TDD_API_ERRORS.logSuccess('020', 'fetchFromAPI', 'About to parse JSON', { endpointId: endpoint.id });
      const data = await response.json();
      TDD_API_ERRORS.logSuccess('021', 'fetchFromAPI', 'JSON parsed successfully', { 
        endpointId: endpoint.id, 
        dataType: typeof data,
        hasData: !!data,
        dataKeys: typeof data === 'object' ? Object.keys(data) : 'not-object'
      });
      
      // Update health metrics
      this.updateHealthMetrics(endpoint.id, true, responseTime);
      
      // Update rate limit tracker
      this.updateRateLimit(endpoint);

      const apiResponse: APIResponse<T> = {
        success: true,
        data,
        statusCode: response.status,
        responseTime,
        rateLimitRemaining: this.getRateLimitRemaining(endpoint)
      };

      // Cache the response
      if (options.cache !== false) {
        this.cacheData(cacheKey, apiResponse, options.maxAge);
      }

      return apiResponse;

    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      TDD_API_ERRORS.logError('022', 'fetchFromAPI', `Fetch failed`, { 
        endpointId: endpoint.id, 
        apiPath,
        error: errorMessage,
        responseTime,
        errorType: error instanceof Error ? error.constructor.name : typeof error
      });
      
      log.error('ModernAPIService', `Error fetching from ${endpoint.name}: ${errorMessage}`);
      
      // Update health metrics
      this.updateHealthMetrics(endpoint.id, false, responseTime, errorMessage);

      return {
        success: false,
        error: errorMessage,
        statusCode: 0,
        responseTime
      };
    }
  }

  /**
   * Fetch and normalize intelligence data
   */
  async fetchIntelligenceData(
    endpoint: APIEndpoint,
    apiPath: string,
    normalizerFunction: string,
    options: DataFetchOptions = {}
  ): Promise<NormalizedDataItem[]> {
    try {
      const response = await this.fetchFromAPI(endpoint, apiPath, options);
      
      if (!response.success || !response.data) {
        log.warn('ModernAPIService', `Failed to fetch data from ${endpoint.name}`);
        return [];
      }

      // Special handling: Hacker News returns an array of IDs for lists (top/new). Fetch item details.
      if (endpoint.id === 'hackernews' && Array.isArray(response.data) && normalizerFunction === 'normalizeHackerNewsItem') {
        const ids = (response.data as number[]).slice(0, 20);
        const itemPathTemplate = endpoint.endpoints.item || '/item/{id}.json';

        const itemPromises = ids.map(async (id) => {
          const itemPath = itemPathTemplate.replace('{id}', String(id));
          const itemResp = await this.fetchFromAPI<any>(endpoint, itemPath, { ...options, cache: true, maxAge: 300000 });
          return itemResp.success && itemResp.data ? itemResp.data : null;
        });

        const settled = await Promise.allSettled(itemPromises);
        const items: any[] = [];
        for (const r of settled) {
          if (r.status === 'fulfilled' && r.value) items.push(r.value);
        }

        const normalized = items.map(item => DataNormalizer.normalizeHackerNewsItem(item));
        log.info('ModernAPIService', `Normalized ${normalized.length} Hacker News items`);
        return normalized;
      }

      // Normalize the data using the specified function
      const normalizedData = this.normalizeData(response.data, normalizerFunction, endpoint.name);
      
      log.info('ModernAPIService', `Normalized ${normalizedData.length} items from ${endpoint.name}`);
      
      return normalizedData;

    } catch (error) {
      log.error('ModernAPIService', `Error in fetchIntelligenceData: ${error}`);
      return [];
    }
  }

  /**
   * Fetch data from multiple endpoints concurrently
   */
  async fetchMultipleEndpoints(
    requests: Array<{
      endpoint: APIEndpoint;
      apiPath: string;
      normalizer: string;
      options?: DataFetchOptions;
    }>
  ): Promise<NormalizedDataItem[]> {
    const promises = requests.map(request =>
      this.fetchIntelligenceData(
        request.endpoint,
        request.apiPath,
        request.normalizer,
        request.options
      )
    );

    try {
      const results = await Promise.allSettled(promises);
      const allData: NormalizedDataItem[] = [];

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          allData.push(...result.value);
        } else {
          log.warn('ModernAPIService', `Failed to fetch from ${requests[index].endpoint.name}: ${result.reason}`);
        }
      });

      // Sort by priority and publication date
      return allData.sort((a, b) => {
        const priorityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        if (priorityDiff !== 0) return priorityDiff;
        
        return b.publishedAt.getTime() - a.publishedAt.getTime();
      });

    } catch (error) {
      log.error('ModernAPIService', `Error in fetchMultipleEndpoints: ${error}`);
      return [];
    }
  }

  /**
   * Get health metrics for all endpoints
   */
  getHealthMetrics(): APIHealthMetrics[] {
    return Array.from(this.healthMetrics.values());
  }

  /**
   * Get health metrics for a specific endpoint
   */
  getEndpointHealth(endpointId: string): APIHealthMetrics | undefined {
    return this.healthMetrics.get(endpointId);
  }

  /**
   * Clear all cached data
   */
  clearCache(): void {
    this.cache.clear();
    log.info('ModernAPIService', 'Cache cleared');
  }

  /**
   * Clear cached data for specific endpoint
   */
  clearEndpointCache(endpointId: string): void {
    const keysToDelete = Array.from(this.cache.keys()).filter(key => key.startsWith(endpointId));
    keysToDelete.forEach(key => this.cache.delete(key));
    log.info('ModernAPIService', `Cache cleared for ${endpointId}`);
  }

  // Private helper methods

  private buildURL(endpoint: APIEndpoint, apiPath: string): string {
    let url = endpoint.baseUrl + apiPath;
    
    // Add API key if required
    if (endpoint.requiresAuth && endpoint.apiKey) {
      const separator = url.includes('?') ? '&' : '?';
      url += `${separator}api_key=${endpoint.apiKey}`;
    }
    
    return url;
  }

  private async makeRequest(
    url: string, 
    _endpoint: APIEndpoint, 
    options: DataFetchOptions
  ): Promise<Response> {
    const fetchOptions: RequestInit = {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'TacticalIntelDashboard/1.0'
      }
    };

    // Add timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options.timeout || 10000);
    fetchOptions.signal = controller.signal;

    try {
      const response = await fetch(url, fetchOptions);
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  private getCachedData<T>(cacheKey: string, maxAge?: number): APIResponse<T> | null {
    const cached = this.cache.get(cacheKey);
    if (!cached) return null;

    const age = Date.now() - cached.timestamp;
    const effectiveMaxAge = maxAge || cached.maxAge || 300000; // 5 minutes default

    if (age > effectiveMaxAge) {
      this.cache.delete(cacheKey);
      return null;
    }

    return {
      ...cached.data,
      cachedAt: new Date(cached.timestamp)
    };
  }

  private cacheData(cacheKey: string, data: APIResponse<any>, maxAge?: number): void {
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      maxAge: maxAge || 300000 // 5 minutes default
    });
  }

  private checkRateLimit(endpoint: APIEndpoint): boolean {
    const tracker = this.rateLimitTrackers.get(endpoint.id);
    if (!tracker) return true;

    const now = Date.now();
    if (now > tracker.resetTime) {
      // Reset the tracker
      this.rateLimitTrackers.set(endpoint.id, {
        requests: 0,
        resetTime: this.calculateResetTime(endpoint.rateLimit.period)
      });
      return true;
    }

    return tracker.requests < endpoint.rateLimit.requests;
  }

  private updateRateLimit(endpoint: APIEndpoint): void {
    const tracker = this.rateLimitTrackers.get(endpoint.id) || {
      requests: 0,
      resetTime: this.calculateResetTime(endpoint.rateLimit.period)
    };

    tracker.requests += 1;
    this.rateLimitTrackers.set(endpoint.id, tracker);
  }

  private getRateLimitRemaining(endpoint: APIEndpoint): number {
    const tracker = this.rateLimitTrackers.get(endpoint.id);
    if (!tracker) return endpoint.rateLimit.requests;
    
    return Math.max(0, endpoint.rateLimit.requests - tracker.requests);
  }

  private calculateResetTime(period: 'minute' | 'hour' | 'day'): number {
    const now = Date.now();
    switch (period) {
      case 'minute': return now + 60 * 1000;
      case 'hour': return now + 60 * 60 * 1000;
      case 'day': return now + 24 * 60 * 60 * 1000;
      default: return now + 60 * 1000;
    }
  }

  private updateHealthMetrics(
    endpointId: string, 
    success: boolean, 
    responseTime: number, 
    error?: string
  ): void {
    let metrics = this.healthMetrics.get(endpointId);
    
    if (!metrics) {
      metrics = {
        endpointId,
        successRate: 0,
        averageResponseTime: 0,
        lastSuccessfulFetch: new Date(0),
        uptime: 0
      };
    }

    // Update success rate (simple moving average)
    const alpha = 0.1; // Weighting factor
    metrics.successRate = success ? 
      metrics.successRate + alpha * (100 - metrics.successRate) :
      metrics.successRate + alpha * (0 - metrics.successRate);

    // Update average response time
    metrics.averageResponseTime = metrics.averageResponseTime === 0 ?
      responseTime :
      metrics.averageResponseTime * 0.9 + responseTime * 0.1;

    if (success) {
      metrics.lastSuccessfulFetch = new Date();
    } else if (error) {
      metrics.lastFailure = {
        timestamp: new Date(),
        error,
        statusCode: 0
      };
    }

    // Calculate uptime (simplified)
    metrics.uptime = metrics.successRate;

    this.healthMetrics.set(endpointId, metrics);
  }

  private normalizeData(
    data: any, 
    normalizerFunction: string, 
    sourceName: string
  ): NormalizedDataItem[] {
    try {
      // Try plugin first (schema validation + normalize + enrich/classify)
      const plugin = normalizerRegistry.get(normalizerFunction);
      if (plugin) {
        const validation = plugin.validate ? plugin.validate(data) : { ok: true };
        if (!validation.ok) {
          log.warn('ModernAPIService', `Validation failed for ${normalizerFunction}: ${validation.errors?.slice(0, 3).join('; ')}`);
          // fall through to generic normalizer as safe fallback
        }
        let items = plugin.normalize(data);
        if (plugin.enrich) items = plugin.enrich(items);
        if (plugin.classify) items = plugin.classify(items);
        return items;
      }

      // Map normalizer function names to actual functions
      const normalizers: Record<string, Function> = {
        'normalizeNOAAAlert': DataNormalizer.normalizeNOAAAlert,
        'normalizeNASAAPOD': (data: any) => [DataNormalizer.normalizeNASAAPOD(data)],
        'normalizeGitHubSecurityAdvisories': DataNormalizer.normalizeGitHubSecurityAdvisories,
        'normalizeAlphaVantageNews': DataNormalizer.normalizeAlphaVantageNews,
        'normalizeRedditPosts': (data: any) => DataNormalizer.normalizeRedditPosts(data, 'unknown'),
        'normalizeUSGSEarthquakes': DataNormalizer.normalizeUSGSEarthquakes,
        'normalizeHackerNewsItem': (data: any) => [DataNormalizer.normalizeHackerNewsItem(data)],
        'normalizeCoinGeckoData': DataNormalizer.normalizeCoinGeckoData
      };

      const normalizer = normalizers[normalizerFunction];
      if (!normalizer) {
        log.warn('ModernAPIService', `Unknown normalizer function: ${normalizerFunction}`);
        return [DataNormalizer.normalizeGeneric(data, sourceName, 'unknown')];
      }

      return normalizer(data);

    } catch (error) {
      log.error('ModernAPIService', `Error in data normalization: ${error}`);
      return [DataNormalizer.normalizeGeneric(data, sourceName, 'error')];
    }
  }
}

// Export singleton instance
export const modernAPIService = new ModernAPIService();
