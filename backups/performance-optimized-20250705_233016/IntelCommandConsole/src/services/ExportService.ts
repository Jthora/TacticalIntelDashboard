import { Feed } from '../models/Feed';

export interface ExportOptions {
  format: 'json' | 'csv' | 'pdf';
  dateRange?: {
    start: Date;
    end: Date;
  };
  includeFields?: string[];
}

export class ExportService {
  static exportFeeds(feeds: Feed[], options: ExportOptions): string | Blob {
    switch (options.format) {
      case 'json':
        return this.exportAsJSON(feeds, options);
      case 'csv':
        return this.exportAsCSV(feeds, options);
      case 'pdf':
        return this.exportAsPDF(feeds, options);
      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }
  }

  private static exportAsJSON(feeds: Feed[], options: ExportOptions): string {
    const filteredFeeds = this.filterByDateRange(feeds, options.dateRange);
    return JSON.stringify(filteredFeeds, null, 2);
  }

  private static exportAsCSV(feeds: Feed[], options: ExportOptions): string {
    const filteredFeeds = this.filterByDateRange(feeds, options.dateRange);
    
    const headers = ['title', 'description', 'link', 'pubDate', 'author', 'source'];
    const csvHeaders = headers.join(',');
    
    const csvRows = filteredFeeds.map(feed => {
      return headers.map(header => {
        const value = feed[header as keyof Feed] || '';
        // Escape commas and quotes in CSV
        return `"${String(value).replace(/"/g, '""')}"`;
      }).join(',');
    });
    
    return [csvHeaders, ...csvRows].join('\n');
  }

  private static exportAsPDF(feeds: Feed[], options: ExportOptions): Blob {
    // For now, return a simple text blob
    // In the future, integrate with a PDF library like jsPDF
    const filteredFeeds = this.filterByDateRange(feeds, options.dateRange);
    
    const pdfContent = `
TACTICAL INTEL DASHBOARD REPORT
Generated: ${new Date().toISOString()}
Total Feeds: ${filteredFeeds.length}

${filteredFeeds.map(feed => `
TITLE: ${feed.title}
SOURCE: ${feed.name}
DATE: ${feed.pubDate}
LINK: ${feed.link}
DESCRIPTION: ${feed.description || 'No description'}
---
`).join('\n')}
    `;
    
    return new Blob([pdfContent], { type: 'text/plain' });
  }

  private static filterByDateRange(feeds: Feed[], dateRange?: { start: Date; end: Date }): Feed[] {
    if (!dateRange) return feeds;
    
    return feeds.filter(feed => {
      const feedDate = new Date(feed.pubDate);
      return feedDate >= dateRange.start && feedDate <= dateRange.end;
    });
  }

  static downloadFile(content: string | Blob, filename: string): void {
    const blob = typeof content === 'string' 
      ? new Blob([content], { type: 'text/plain' })
      : content;
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
