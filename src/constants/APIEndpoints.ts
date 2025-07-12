/**
 * Modern API Endpoints Configuration
 * CORS-enabled, JSON-based intelligence sources
 */

import { APIEndpoint } from '../types/ModernAPITypes';

// Government & Public Sector APIs
export const NOAA_WEATHER_API: APIEndpoint = {
  id: 'noaa-weather',
  name: 'NOAA Weather Service',
  category: 'weather',
  baseUrl: 'https://api.weather.gov',
  endpoints: {
    alerts: '/alerts/active',
    forecast: '/points/{lat},{lon}/forecast',
    stations: '/stations',
    zones: '/zones'
  },
  corsEnabled: true,
  requiresAuth: false,
  rateLimit: { requests: 1000, period: 'hour' },
  documentation: 'https://www.weather.gov/documentation/services-web-api',
  status: 'active'
};

export const NASA_API: APIEndpoint = {
  id: 'nasa',
  name: 'NASA Open Data',
  category: 'space',
  baseUrl: 'https://api.nasa.gov',
  endpoints: {
    apod: '/planetary/apod',
    neows: '/neo/rest/v1/feed',
    mars: '/mars-photos/api/v1/rovers/curiosity/photos',
    asteroids: '/neo/rest/v1/feed/today'
  },
  corsEnabled: true,
  requiresAuth: true,
  apiKey: 'DEMO_KEY', // Should be replaced with actual key
  rateLimit: { requests: 1000, period: 'hour' },
  documentation: 'https://api.nasa.gov/',
  status: 'active'
};

export const USGS_EARTHQUAKE_API: APIEndpoint = {
  id: 'usgs-earthquake',
  name: 'USGS Earthquake Hazards',
  category: 'government',
  baseUrl: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0',
  endpoints: {
    significant: '/summary/significant_month.geojson',
    major: '/summary/4.5_week.geojson',
    recent: '/summary/all_day.geojson'
  },
  corsEnabled: true,
  requiresAuth: false,
  rateLimit: { requests: 1000, period: 'hour' },
  documentation: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php',
  status: 'active'
};

export const FDA_ENFORCEMENT_API: APIEndpoint = {
  id: 'fda-enforcement',
  name: 'FDA Enforcement Reports',
  category: 'government',
  baseUrl: 'https://api.fda.gov',
  endpoints: {
    food: '/food/enforcement.json',
    drug: '/drug/enforcement.json',
    device: '/device/enforcement.json'
  },
  corsEnabled: true,
  requiresAuth: false,
  rateLimit: { requests: 240, period: 'minute' },
  documentation: 'https://open.fda.gov/apis/',
  status: 'active'
};

// Financial & Economic APIs
export const ALPHA_VANTAGE_API: APIEndpoint = {
  id: 'alpha-vantage',
  name: 'Alpha Vantage Financial',
  category: 'financial',
  baseUrl: 'https://www.alphavantage.co/query',
  endpoints: {
    news: '?function=NEWS_SENTIMENT',
    stocks: '?function=TIME_SERIES_DAILY',
    crypto: '?function=DIGITAL_CURRENCY_DAILY',
    forex: '?function=FX_DAILY'
  },
  corsEnabled: true,
  requiresAuth: true,
  apiKey: 'demo', // Should be replaced with actual key
  rateLimit: { requests: 5, period: 'minute' },
  documentation: 'https://www.alphavantage.co/documentation/',
  status: 'active'
};

export const FEDERAL_RESERVE_API: APIEndpoint = {
  id: 'federal-reserve',
  name: 'Federal Reserve Economic Data',
  category: 'financial',
  baseUrl: 'https://api.stlouisfed.org/fred',
  endpoints: {
    series: '/series/observations',
    releases: '/releases',
    sources: '/sources'
  },
  corsEnabled: true,
  requiresAuth: true,
  apiKey: 'YOUR_API_KEY', // Requires registration
  rateLimit: { requests: 120, period: 'minute' },
  documentation: 'https://fred.stlouisfed.org/docs/api/fred/',
  status: 'active'
};

export const COINGECKO_API: APIEndpoint = {
  id: 'coingecko',
  name: 'CoinGecko Cryptocurrency',
  category: 'financial',
  baseUrl: 'https://api.coingecko.com/api/v3',
  endpoints: {
    trending: '/search/trending',
    global: '/global',
    coins: '/coins/markets',
    news: '/news'
  },
  corsEnabled: true,
  requiresAuth: false,
  rateLimit: { requests: 50, period: 'minute' },
  documentation: 'https://www.coingecko.com/en/api/documentation',
  status: 'active'
};

// Technology & Security APIs
export const GITHUB_API: APIEndpoint = {
  id: 'github',
  name: 'GitHub Security Advisories',
  category: 'security',
  baseUrl: 'https://api.github.com',
  endpoints: {
    advisories: '/advisories',
    repos: '/repos/{owner}/{repo}',
    releases: '/repos/{owner}/{repo}/releases'
  },
  corsEnabled: true,
  requiresAuth: false, // Public endpoints
  rateLimit: { requests: 60, period: 'hour' }, // Higher with auth
  documentation: 'https://docs.github.com/en/rest',
  status: 'active'
};

export const HACKERNEWS_API: APIEndpoint = {
  id: 'hackernews',
  name: 'Hacker News',
  category: 'technology',
  baseUrl: 'https://hacker-news.firebaseio.com/v0',
  endpoints: {
    topstories: '/topstories.json',
    newstories: '/newstories.json',
    item: '/item/{id}.json',
    user: '/user/{id}.json'
  },
  corsEnabled: true,
  requiresAuth: false,
  rateLimit: { requests: 1000, period: 'hour' },
  documentation: 'https://github.com/HackerNews/API',
  status: 'active'
};

export const NVD_CVE_API: APIEndpoint = {
  id: 'nvd-cve',
  name: 'National Vulnerability Database',
  category: 'security',
  baseUrl: 'https://services.nvd.nist.gov/rest/json',
  endpoints: {
    cves: '/cves/2.0',
    cpe: '/cpe/2.0'
  },
  corsEnabled: true,
  requiresAuth: false,
  rateLimit: { requests: 50, period: 'minute' },
  documentation: 'https://nvd.nist.gov/developers/vulnerabilities',
  status: 'active'
};

// Social & Discussion APIs
export const REDDIT_API: APIEndpoint = {
  id: 'reddit',
  name: 'Reddit',
  category: 'social',
  baseUrl: 'https://www.reddit.com',
  endpoints: {
    hot: '/r/{subreddit}/hot.json',
    new: '/r/{subreddit}/new.json',
    top: '/r/{subreddit}/top.json',
    search: '/search.json'
  },
  corsEnabled: true,
  requiresAuth: false, // For public endpoints
  rateLimit: { requests: 60, period: 'minute' },
  documentation: 'https://www.reddit.com/dev/api/',
  status: 'active'
};

// News Aggregation APIs (CORS-friendly alternatives to RSS)
export const NEWSAPI_API: APIEndpoint = {
  id: 'newsapi',
  name: 'NewsAPI',
  category: 'social',
  baseUrl: 'https://newsapi.org/v2',
  endpoints: {
    everything: '/everything',
    headlines: '/top-headlines',
    sources: '/sources'
  },
  corsEnabled: false, // Requires server-side for free tier
  requiresAuth: true,
  apiKey: 'YOUR_API_KEY',
  rateLimit: { requests: 1000, period: 'day' },
  documentation: 'https://newsapi.org/docs',
  status: 'active'
};

// Specialized Intelligence APIs
export const SHODAN_API: APIEndpoint = {
  id: 'shodan',
  name: 'Shodan Internet Scanning',
  category: 'security',
  baseUrl: 'https://api.shodan.io',
  endpoints: {
    search: '/shodan/host/search',
    host: '/shodan/host/{ip}',
    services: '/shodan/services'
  },
  corsEnabled: true,
  requiresAuth: true,
  apiKey: 'YOUR_API_KEY',
  rateLimit: { requests: 100, period: 'day' }, // Free tier (monthly quota)
  documentation: 'https://developer.shodan.io/',
  status: 'active'
};

// Compile all endpoints
export const ALL_API_ENDPOINTS: APIEndpoint[] = [
  NOAA_WEATHER_API,
  NASA_API,
  USGS_EARTHQUAKE_API,
  FDA_ENFORCEMENT_API,
  ALPHA_VANTAGE_API,
  FEDERAL_RESERVE_API,
  COINGECKO_API,
  GITHUB_API,
  HACKERNEWS_API,
  NVD_CVE_API,
  REDDIT_API,
  NEWSAPI_API,
  SHODAN_API
];

// Filter by category
export const getEndpointsByCategory = (category: string): APIEndpoint[] => {
  return ALL_API_ENDPOINTS.filter(endpoint => endpoint.category === category);
};

// Get CORS-enabled endpoints only
export const getCorsEnabledEndpoints = (): APIEndpoint[] => {
  return ALL_API_ENDPOINTS.filter(endpoint => endpoint.corsEnabled);
};

// Get endpoints that don't require authentication
export const getPublicEndpoints = (): APIEndpoint[] => {
  return ALL_API_ENDPOINTS.filter(endpoint => !endpoint.requiresAuth);
};

// Get immediate deployment ready endpoints (CORS + No Auth)
export const getImmediateReadyEndpoints = (): APIEndpoint[] => {
  return ALL_API_ENDPOINTS.filter(endpoint => 
    endpoint.corsEnabled && !endpoint.requiresAuth && endpoint.status === 'active'
  );
};
