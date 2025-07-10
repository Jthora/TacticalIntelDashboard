import { Feed } from '../models/Feed';

export interface SearchOptions {
  query: string;
  sources?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  operators?: 'AND' | 'OR' | 'NOT';
  caseSensitive?: boolean;
}

export interface SearchResult {
  feed: Feed;
  relevanceScore: number;
  matchedFields: string[];
  snippet: string;
}

export interface SearchResponse {
  results: SearchResult[];
  totalCount: number;
  searchTime: number;
  suggestions: string[];
}

export class SearchService {
  private static allFeeds: Feed[] = [];

  /**
   * Initialize search service with current feed data
   */
  static initializeFeeds(feeds: Feed[]): void {
    this.allFeeds = feeds;
  }

  /**
   * Perform global search across all feeds
   */
  static async search(options: SearchOptions): Promise<SearchResponse> {
    const startTime = Date.now();
    
    if (!options.query.trim()) {
      return {
        results: [],
        totalCount: 0,
        searchTime: 0,
        suggestions: []
      };
    }

    // Filter feeds by date range if specified
    let searchFeeds = this.allFeeds;
    if (options.dateRange) {
      searchFeeds = this.filterByDateRange(searchFeeds, options.dateRange);
    }

    // Filter by sources if specified
    if (options.sources && options.sources.length > 0) {
      searchFeeds = searchFeeds.filter(feed => 
        options.sources!.includes(feed.name) || 
        options.sources!.includes(feed.url)
      );
    }

    // Perform text search
    const results = this.performTextSearch(searchFeeds, options);

    const searchTime = Date.now() - startTime;

    return {
      results,
      totalCount: results.length,
      searchTime,
      suggestions: this.generateSuggestions(options.query)
    };
  }

  /**
   * Get search suggestions based on current feeds
   */
  static getSearchSuggestions(query: string): string[] {
    if (!query || query.length < 2) return [];

    const suggestions = new Set<string>();
    const lowerQuery = query.toLowerCase();

    // Extract keywords from feed titles and descriptions
    this.allFeeds.forEach(feed => {
      const text = `${feed.title} ${feed.description || ''}`.toLowerCase();
      const words = text.split(/\s+/);
      
      words.forEach(word => {
        if (word.includes(lowerQuery) && word.length > 2) {
          suggestions.add(word);
        }
      });
    });

    return Array.from(suggestions).slice(0, 10);
  }

  private static filterByDateRange(feeds: Feed[], dateRange: { start: Date; end: Date }): Feed[] {
    return feeds.filter(feed => {
      const feedDate = new Date(feed.pubDate);
      return feedDate >= dateRange.start && feedDate <= dateRange.end;
    });
  }

  private static performTextSearch(feeds: Feed[], options: SearchOptions): SearchResult[] {
    const query = options.caseSensitive ? options.query : options.query.toLowerCase();
    const keywords = this.parseSearchQuery(query, options.operators);

    const results: SearchResult[] = [];

    feeds.forEach(feed => {
      const searchableText = this.getSearchableText(feed, options.caseSensitive);
      const match = this.matchKeywords(searchableText, keywords, options.operators);

      if (match.isMatch) {
        results.push({
          feed,
          relevanceScore: match.score,
          matchedFields: match.fields,
          snippet: this.generateSnippet(feed, keywords[0], 150)
        });
      }
    });

    // Sort by relevance score (highest first)
    return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  private static parseSearchQuery(query: string, _operator: SearchOptions['operators'] = 'AND'): string[] {
    // Simple keyword extraction - can be enhanced with proper query parsing
    return query.split(/\s+/).filter(word => word.length > 1);
  }

  private static getSearchableText(feed: Feed, caseSensitive = false): Record<string, string> {
    const transform = caseSensitive ? (text: string) => text : (text: string) => text.toLowerCase();
    
    return {
      title: transform(feed.title),
      description: transform(feed.description || ''),
      content: transform(feed.content || ''),
      author: transform(feed.author || ''),
      categories: transform((feed.categories || []).join(' ')),
      source: transform(feed.name)
    };
  }

  private static matchKeywords(
    searchableText: Record<string, string>, 
    keywords: string[], 
    operator: SearchOptions['operators'] = 'AND'
  ): { isMatch: boolean; score: number; fields: string[] } {
    const fieldWeights = {
      title: 3,
      description: 2,
      content: 1,
      author: 1,
      categories: 2,
      source: 1
    };

    let totalScore = 0;
    const matchedFields: string[] = [];
    const fieldMatches: Record<string, number> = {};

    // Check each field for keyword matches
    Object.entries(searchableText).forEach(([field, text]) => {
      let fieldScore = 0;
      const fieldKeywordMatches = keywords.filter(keyword => text.includes(keyword));
      
      if (fieldKeywordMatches.length > 0) {
        matchedFields.push(field);
        fieldScore = fieldKeywordMatches.length * fieldWeights[field as keyof typeof fieldWeights];
        fieldMatches[field] = fieldKeywordMatches.length;
      }
      
      totalScore += fieldScore;
    });

    // Determine if it's a match based on operator
    let isMatch = false;
    if (operator === 'AND') {
      isMatch = keywords.every(keyword => 
        Object.values(searchableText).some(text => text.includes(keyword))
      );
    } else if (operator === 'OR') {
      isMatch = keywords.some(keyword => 
        Object.values(searchableText).some(text => text.includes(keyword))
      );
    } else {
      // Default to AND
      isMatch = matchedFields.length > 0;
    }

    return {
      isMatch,
      score: totalScore,
      fields: matchedFields
    };
  }

  private static generateSnippet(feed: Feed, keyword: string, maxLength = 150): string {
    const text = feed.description || feed.content || feed.title;
    if (!text) return '';

    const lowerText = text.toLowerCase();
    const lowerKeyword = keyword.toLowerCase();
    const keywordIndex = lowerText.indexOf(lowerKeyword);

    if (keywordIndex === -1) {
      return text.substring(0, maxLength) + (text.length > maxLength ? '...' : '');
    }

    // Create snippet around the keyword
    const start = Math.max(0, keywordIndex - 50);
    const end = Math.min(text.length, keywordIndex + keyword.length + 50);
    
    let snippet = text.substring(start, end);
    
    if (start > 0) snippet = '...' + snippet;
    if (end < text.length) snippet = snippet + '...';

    return snippet;
  }

  private static generateSuggestions(query: string): string[] {
    // Simple suggestions based on common search terms
    const commonTerms = [
      'cybersecurity', 'breaking news', 'politics', 'technology', 
      'economy', 'health', 'climate', 'security', 'international',
      'business', 'science', 'market', 'government', 'crisis'
    ];

    return commonTerms
      .filter(term => term.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5);
  }

  /**
   * Clear all search data
   */
  static clearData(): void {
    this.allFeeds = [];
  }

  /**
   * Get total number of searchable feeds
   */
  static getFeedCount(): number {
    return this.allFeeds.length;
  }
}
