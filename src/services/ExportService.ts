import CryptoJS from 'crypto-js';
import { jsPDF } from 'jspdf';

import { Feed } from '../models/Feed';

export interface ExportOptions {
  format: 'json' | 'csv' | 'pdf' | 'xml';
  dateRange?: {
    start: Date;
    end: Date;
  };
  includeFields?: string[];
  encryption?: {
    enabled: boolean;
    password?: string;
  };
  compression?: boolean;
  metadata?: {
    title?: string;
    description?: string;
    author?: string;
    subject?: string;
  };
}

export interface ExportResult {
  content: string | Blob;
  filename: string;
  size: number;
  format: string;
  encrypted: boolean;
  compressed: boolean;
  timestamp: Date;
}

export class ExportService {
  static async exportFeeds(feeds: Feed[], options: ExportOptions): Promise<ExportResult> {
    const filteredFeeds = this.filterByDateRange(feeds, options.dateRange);
    const selectedFeeds = this.filterByFields(filteredFeeds, options.includeFields);
    
    let content: string | Blob;
    let filename: string;
    const timestamp = new Date();
    
    switch (options.format) {
      case 'json':
        content = await this.exportAsJSON(selectedFeeds, options);
        filename = `tactical-intel-export-${this.formatDate(timestamp)}.json`;
        break;
      case 'csv':
        content = await this.exportAsCSV(selectedFeeds, options);
        filename = `tactical-intel-export-${this.formatDate(timestamp)}.csv`;
        break;
      case 'pdf':
        content = await this.exportAsPDF(selectedFeeds, options);
        filename = `tactical-intel-export-${this.formatDate(timestamp)}.pdf`;
        break;
      case 'xml':
        content = await this.exportAsXML(selectedFeeds, options);
        filename = `tactical-intel-export-${this.formatDate(timestamp)}.xml`;
        break;
      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }
    
    // Apply encryption if requested
    if (options.encryption?.enabled && options.encryption?.password) {
      content = await this.encryptContent(content, options.encryption.password);
      filename = filename.replace(/\.[^/.]+$/, '.encrypted');
    }
    
    // Apply compression if requested
    if (options.compression) {
      content = await this.compressContent(content);
      filename = filename.replace(/\.[^/.]+$/, '.gz');
    }
    
    return {
      content,
      filename,
      size: this.getContentSize(content),
      format: options.format,
      encrypted: options.encryption?.enabled || false,
      compressed: options.compression || false,
      timestamp
    };
  }
  
  private static async exportAsJSON(feeds: Feed[], options: ExportOptions): Promise<string> {
    const exportData = {
      metadata: {
        title: options.metadata?.title || 'Tactical Intel Dashboard Export',
        description: options.metadata?.description || 'Intelligence feed export',
        author: options.metadata?.author || 'Tactical Intel Dashboard',
        subject: options.metadata?.subject || 'Intelligence Data',
        exportDate: new Date().toISOString(),
        totalFeeds: feeds.length,
        format: 'JSON',
        version: '1.0'
      },
      feeds: feeds.map(feed => ({
        id: feed.id,
        name: feed.name,
        url: feed.url,
        title: feed.title,
        link: feed.link,
        pubDate: feed.pubDate,
        description: feed.description,
        content: feed.content,
        feedListId: feed.feedListId,
        author: feed.author,
        categories: feed.categories,
        media: feed.media,
        priority: feed.priority,
        contentType: feed.contentType,
        region: feed.region,
        tags: feed.tags,
        classification: feed.classification,
        timestamp: feed.timestamp,
        source: feed.source
      }))
    };
    
    return JSON.stringify(exportData, null, 2);
  }
  
  private static async exportAsCSV(feeds: Feed[], _options: ExportOptions): Promise<string> {
    const headers = [
      'ID', 'Name', 'URL', 'Title', 'Link', 'Publication Date', 
      'Author', 'Description', 'Priority', 'Content Type', 'Region', 'Tags', 'Classification'
    ];
    
    const csvHeaders = headers.join(',');
    const csvRows = feeds.map(feed => {
      const row = [
        feed.id || '',
        feed.name || '',
        feed.url || '',
        feed.title || '',
        feed.link || '',
        feed.pubDate || '',
        feed.author || '',
        feed.description || '',
        feed.priority || '',
        feed.contentType || '',
        feed.region || '',
        (feed.tags || []).join(';'),
        feed.classification || ''
      ];
      
      return row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(',');
    });
    
    return [csvHeaders, ...csvRows].join('\n');
  }
  
  private static async exportAsPDF(feeds: Feed[], _options: ExportOptions): Promise<Blob> {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    let yPosition = margin;
    
    // Header
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('TACTICAL INTEL DASHBOARD', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;
    
    doc.setFontSize(12);
    doc.text('INTELLIGENCE FEED EXPORT', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 20;
    
    // Metadata
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${new Date().toISOString()}`, margin, yPosition);
    yPosition += 5;
    doc.text(`Total Feeds: ${feeds.length}`, margin, yPosition);
    yPosition += 5;
    doc.text(`Format: PDF`, margin, yPosition);
    yPosition += 15;
    
    // Feeds
    feeds.forEach((feed, index) => {
      // Check if we need a new page
      if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = margin;
      }
      
      // Feed header
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      const title = feed.title || 'Untitled Feed';
      doc.text(`${index + 1}. ${title}`, margin, yPosition);
      yPosition += 7;
      
      // Feed details
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      
      if (feed.name) {
        doc.text(`Source: ${feed.name}`, margin + 5, yPosition);
        yPosition += 5;
      }
      
      if (feed.pubDate) {
        doc.text(`Date: ${feed.pubDate}`, margin + 5, yPosition);
        yPosition += 5;
      }
      
      if (feed.author) {
        doc.text(`Author: ${feed.author}`, margin + 5, yPosition);
        yPosition += 5;
      }
      
      if (feed.contentType) {
        doc.text(`Content Type: ${feed.contentType}`, margin + 5, yPosition);
        yPosition += 5;
      }
      
      if (feed.priority) {
        doc.text(`Priority: ${feed.priority}`, margin + 5, yPosition);
        yPosition += 5;
      }
      
      if (feed.region) {
        doc.text(`Region: ${feed.region}`, margin + 5, yPosition);
        yPosition += 5;
      }
      
      if (feed.link) {
        doc.text(`Link: ${feed.link}`, margin + 5, yPosition);
        yPosition += 5;
      }
      
      if (feed.description) {
        const description = feed.description.substring(0, 200) + (feed.description.length > 200 ? '...' : '');
        const splitDescription = doc.splitTextToSize(description, contentWidth - 10);
        doc.text(splitDescription, margin + 5, yPosition);
        yPosition += splitDescription.length * 5;
      }
      
      yPosition += 10; // Space between feeds
    });
    
    // Footer
    const pageCount = doc.internal.pages.length - 1;
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    }
    
    return doc.output('blob');
  }
  
  private static async exportAsXML(feeds: Feed[], options: ExportOptions): Promise<string> {
    const metadata = options.metadata || {};
    
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<TacticalIntelExport>\n';
    xml += '  <Metadata>\n';
    xml += `    <Title>${this.escapeXml(metadata.title || 'Tactical Intel Dashboard Export')}</Title>\n`;
    xml += `    <Description>${this.escapeXml(metadata.description || 'Intelligence feed export')}</Description>\n`;
    xml += `    <Author>${this.escapeXml(metadata.author || 'Tactical Intel Dashboard')}</Author>\n`;
    xml += `    <Subject>${this.escapeXml(metadata.subject || 'Intelligence Data')}</Subject>\n`;
    xml += `    <ExportDate>${new Date().toISOString()}</ExportDate>\n`;
    xml += `    <TotalFeeds>${feeds.length}</TotalFeeds>\n`;
    xml += `    <Format>XML</Format>\n`;
    xml += `    <Version>1.0</Version>\n`;
    xml += '  </Metadata>\n';
    xml += '  <Feeds>\n';
    
    feeds.forEach(feed => {
      xml += '    <Feed>\n';
      xml += `      <ID>${this.escapeXml(feed.id || '')}</ID>\n`;
      xml += `      <Title>${this.escapeXml(feed.title || '')}</Title>\n`;
      xml += `      <Description>${this.escapeXml(feed.description || '')}</Description>\n`;
      xml += `      <Link>${this.escapeXml(feed.link || '')}</Link>\n`;
      xml += `      <PubDate>${this.escapeXml(feed.pubDate || '')}</PubDate>\n`;
      xml += `      <Author>${this.escapeXml(feed.author || '')}</Author>\n`;
      xml += `      <Source>${this.escapeXml(feed.name || '')}</Source>\n`;
      xml += `      <ContentType>${this.escapeXml(feed.contentType || '')}</ContentType>\n`;
      xml += `      <Priority>${this.escapeXml(feed.priority || '')}</Priority>\n`;
      xml += `      <Region>${this.escapeXml(feed.region || '')}</Region>\n`;
      xml += `      <Classification>${this.escapeXml(feed.classification || '')}</Classification>\n`;
      
      if (feed.tags && feed.tags.length > 0) {
        xml += '      <Tags>\n';
        feed.tags.forEach(tag => {
          xml += `        <Tag>${this.escapeXml(tag)}</Tag>\n`;
        });
        xml += '      </Tags>\n';
      }
      
      xml += '    </Feed>\n';
    });
    
    xml += '  </Feeds>\n';
    xml += '</TacticalIntelExport>\n';
    
    return xml;
  }
  
  private static escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
  
  private static async encryptContent(content: string | Blob, password: string): Promise<string> {
    const textContent = typeof content === 'string' ? content : await content.text();
    const encrypted = CryptoJS.AES.encrypt(textContent, password).toString();
    return encrypted;
  }
  
  private static async compressContent(content: string | Blob): Promise<Blob> {
    // Simple compression simulation - in production, use a proper compression library
    const textContent = typeof content === 'string' ? content : await content.text();
    let uint8: Uint8Array;
    if (typeof TextEncoder !== 'undefined') {
      uint8 = new TextEncoder().encode(textContent);
    } else {
      // Fallback for environments (like Jest/node) where TextEncoder may not be defined
      // Use Buffer to create a Uint8Array view
      const buf = Buffer.from(textContent, 'utf-8');
      uint8 = new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
    }
    return new Blob([uint8], { type: 'application/gzip' });
  }
  
  private static filterByDateRange(feeds: Feed[], dateRange?: { start: Date; end: Date }): Feed[] {
    if (!dateRange) return feeds;
    
    return feeds.filter(feed => {
      const feedDate = new Date(feed.pubDate);
      return feedDate >= dateRange.start && feedDate <= dateRange.end;
    });
  }
  
  private static filterByFields(feeds: Feed[], fields?: string[]): Feed[] {
    if (!fields || fields.length === 0) return feeds;
    
    return feeds.map(feed => {
      const filtered: Partial<Feed> = {};
      fields.forEach(field => {
        if (field in feed) {
          (filtered as any)[field] = (feed as any)[field];
        }
      });
      return filtered as Feed;
    });
  }
  
  private static formatDate(date: Date): string {
    return date.toISOString().split('T')[0].replace(/-/g, '');
  }
  
  private static getContentSize(content: string | Blob): number {
    if (typeof content === 'string') {
      return new Blob([content]).size;
    }
    return content.size;
  }
  
  static async downloadFile(result: ExportResult): Promise<void> {
    const blob = typeof result.content === 'string' 
      ? new Blob([result.content], { type: 'text/plain' })
      : result.content;
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = result.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
  
  static async decryptContent(encryptedContent: string, password: string): Promise<string> {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedContent, password);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      throw new Error('Failed to decrypt content. Invalid password or corrupted data.');
    }
  }
  
  static validateExportOptions(options: ExportOptions): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!options.format) {
      errors.push('Export format is required');
    }
    
    if (!['json', 'csv', 'pdf', 'xml'].includes(options.format)) {
      errors.push('Invalid export format');
    }
    
    if (options.dateRange) {
      if (!options.dateRange.start || !options.dateRange.end) {
        errors.push('Date range requires both start and end dates');
      } else if (options.dateRange.start > options.dateRange.end) {
        errors.push('Start date must be before end date');
      }
    }
    
    if (options.encryption?.enabled && !options.encryption?.password) {
      errors.push('Encryption requires a password');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  static getSupportedFormats(): string[] {
    return ['json', 'csv', 'pdf', 'xml'];
  }
  
  static getFormatDescription(format: string): string {
    const descriptions = {
      json: 'JavaScript Object Notation - Structured data format',
      csv: 'Comma-Separated Values - Spreadsheet compatible format',
      pdf: 'Portable Document Format - Formatted document',
      xml: 'eXtensible Markup Language - Structured markup format'
    };
    
    return descriptions[format as keyof typeof descriptions] || 'Unknown format';
  }
}
