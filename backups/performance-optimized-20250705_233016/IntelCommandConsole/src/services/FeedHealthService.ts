export interface FeedHealthStatus {
  feedId: string;
  feedUrl: string;
  status: 'healthy' | 'warning' | 'error' | 'unknown';
  lastSuccessfulFetch: Date | null;
  lastError: string | null;
  responseTime: number | null;
  uptime: number; // percentage
  errorCount: number;
  lastChecked: Date;
}

export interface FeedHealthMetrics {
  totalFeeds: number;
  healthyFeeds: number;
  warningFeeds: number;
  errorFeeds: number;
  averageResponseTime: number;
  overallUptime: number;
}

export class FeedHealthService {
  private static readonly STORAGE_KEY = 'feed_health_data';
  private static readonly WARNING_THRESHOLD = 5000; // 5 seconds response time
  private static readonly ERROR_THRESHOLD = 3; // 3 consecutive errors

  static getFeedHealth(feedId: string): FeedHealthStatus | null {
    const healthData = this.getAllFeedHealth();
    return healthData[feedId] || null;
  }

  static getAllFeedHealth(): Record<string, FeedHealthStatus> {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  }

  static updateFeedHealth(
    feedId: string, 
    feedUrl: string, 
    success: boolean, 
    responseTime?: number, 
    error?: string
  ): void {
    const healthData = this.getAllFeedHealth();
    const existing = healthData[feedId];
    
    const now = new Date();
    
    if (success) {
      healthData[feedId] = {
        feedId,
        feedUrl,
        status: responseTime && responseTime > this.WARNING_THRESHOLD ? 'warning' : 'healthy',
        lastSuccessfulFetch: now,
        lastError: null,
        responseTime: responseTime || null,
        uptime: this.calculateUptime(existing, true),
        errorCount: 0,
        lastChecked: now
      };
    } else {
      const errorCount = (existing?.errorCount || 0) + 1;
      healthData[feedId] = {
        feedId,
        feedUrl,
        status: errorCount >= this.ERROR_THRESHOLD ? 'error' : 'warning',
        lastSuccessfulFetch: existing?.lastSuccessfulFetch || null,
        lastError: error || 'Unknown error',
        responseTime: existing?.responseTime || null,
        uptime: this.calculateUptime(existing, false),
        errorCount,
        lastChecked: now
      };
    }
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(healthData));
  }

  static getFeedHealthMetrics(): FeedHealthMetrics {
    const healthData = this.getAllFeedHealth();
    const statuses = Object.values(healthData);
    
    const totalFeeds = statuses.length;
    const healthyFeeds = statuses.filter(s => s.status === 'healthy').length;
    const warningFeeds = statuses.filter(s => s.status === 'warning').length;
    const errorFeeds = statuses.filter(s => s.status === 'error').length;
    
    const responseTimes = statuses
      .map(s => s.responseTime)
      .filter((rt): rt is number => rt !== null);
    
    const averageResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((sum, rt) => sum + rt, 0) / responseTimes.length
      : 0;
    
    const overallUptime = statuses.length > 0
      ? statuses.reduce((sum, s) => sum + s.uptime, 0) / statuses.length
      : 100;
    
    return {
      totalFeeds,
      healthyFeeds,
      warningFeeds,
      errorFeeds,
      averageResponseTime,
      overallUptime
    };
  }

  private static calculateUptime(existing: FeedHealthStatus | undefined, currentSuccess: boolean): number {
    if (!existing) {
      return currentSuccess ? 100 : 0;
    }
    
    // Simple uptime calculation based on error count
    // In a real implementation, you'd track historical data
    const maxErrorsForUptime = 10;
    const currentErrorCount = currentSuccess ? 0 : existing.errorCount;
    return Math.max(0, 100 - (currentErrorCount / maxErrorsForUptime) * 100);
  }

  static getFeedHealthIcon(status: FeedHealthStatus['status']): string {
    switch (status) {
      case 'healthy': return '🟢';
      case 'warning': return '🟡';
      case 'error': return '🔴';
      default: return '⚪';
    }
  }

  static clearHealthData(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}
