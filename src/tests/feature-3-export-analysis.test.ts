/**
 * Feature 3: Intelligence Data Export & Analysis
 * End-to-End Functional Testing Implementation
 */

import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Export } from '../components/Export';
import { ExportService, ExportOptions, ExportResult } from '../services/ExportService';
import { Feed } from '../models/Feed';
import { logger } from '../utils/LoggerService';

// Mock file download
global.URL.createObjectURL = jest.fn(() => 'mock-url');
global.URL.revokeObjectURL = jest.fn();

// Mock document methods
Object.defineProperty(document, 'createElement', {
  value: jest.fn(() => ({
    href: '',
    download: '',
    click: jest.fn(),
    remove: jest.fn()
  }))
});

Object.defineProperty(document.body, 'appendChild', {
  value: jest.fn()
});

Object.defineProperty(document.body, 'removeChild', {
  value: jest.fn()
});

describe('💾 FEATURE 3: Intelligence Data Export & Analysis', () => {
  
  let mockFeeds: Feed[];
  let mockExportService: jest.Mocked<typeof ExportService>;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Create mock feeds dataset
    mockFeeds = [
      {
        id: '1',
        title: 'Breaking: Security Breach Detected',
        description: 'Major cybersecurity incident affecting global infrastructure',
        source: 'BBC',
        timestamp: new Date('2025-01-07T10:00:00Z'),
        url: 'https://bbc.com/news/security-breach',
        author: 'John Smith',
        tags: ['security', 'cybersecurity', 'breaking'],
        priority: 'high',
        classification: 'public'
      },
      {
        id: '2',
        title: 'Market Analysis: Tech Stocks Rise',
        description: 'Technology sector shows strong performance in Q1',
        source: 'Reuters',
        timestamp: new Date('2025-01-07T09:30:00Z'),
        url: 'https://reuters.com/markets/tech-stocks',
        author: 'Jane Doe',
        tags: ['market', 'technology', 'finance'],
        priority: 'medium',
        classification: 'public'
      },
      {
        id: '3',
        title: 'Global Climate Summit Update',
        description: 'World leaders discuss new environmental policies',
        source: 'CNN',
        timestamp: new Date('2025-01-07T08:15:00Z'),
        url: 'https://cnn.com/climate-summit',
        author: 'Mike Johnson',
        tags: ['climate', 'politics', 'global'],
        priority: 'medium',
        classification: 'public'
      }
    ];

    // Mock ExportService
    mockExportService = ExportService as jest.Mocked<typeof ExportService>;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('📤 Phase 1: Export Initiation', () => {
    
    test('✅ Should open export dialog', async () => {
      // Arrange
      const user = userEvent.setup();

      // Act
      render(<Export feeds={mockFeeds} />);
      
      const exportButton = screen.getByText('Export Data');
      await user.click(exportButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Export Intelligence Data')).toBeInTheDocument();
        expect(screen.getByText('Export Format')).toBeInTheDocument();
        expect(screen.getByText('Export Options')).toBeInTheDocument();
      });

      logger.info('Test', '✅ Export dialog opens correctly');
    });

    test('✅ Should display format options', async () => {
      // Arrange
      const user = userEvent.setup();

      // Act
      render(<Export feeds={mockFeeds} />);
      
      const exportButton = screen.getByText('Export Data');
      await user.click(exportButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('JSON')).toBeInTheDocument();
        expect(screen.getByText('CSV')).toBeInTheDocument();
        expect(screen.getByText('PDF')).toBeInTheDocument();
        expect(screen.getByText('XML')).toBeInTheDocument();
      });

      // Check format descriptions
      expect(screen.getByText('JavaScript Object Notation - Structured data format')).toBeInTheDocument();
      expect(screen.getByText('Comma-Separated Values - Spreadsheet compatible format')).toBeInTheDocument();

      logger.info('Test', '✅ Export format options display correctly');
    });

    test('✅ Should handle export cancellation', async () => {
      // Arrange
      const user = userEvent.setup();

      // Act
      render(<Export feeds={mockFeeds} />);
      
      const exportButton = screen.getByText('Export Data');
      await user.click(exportButton);

      await waitFor(() => {
        expect(screen.getByText('Export Intelligence Data')).toBeInTheDocument();
      });

      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);

      // Assert
      await waitFor(() => {
        expect(screen.queryByText('Export Intelligence Data')).not.toBeInTheDocument();
      });

      logger.info('Test', '✅ Export cancellation works correctly');
    });

    test('✅ Should validate export options', async () => {
      // Arrange
      const user = userEvent.setup();

      // Act
      render(<Export feeds={mockFeeds} />);
      
      const exportButton = screen.getByText('Export Data');
      await user.click(exportButton);

      // Try to export without selecting format
      const confirmButton = screen.getByText('Export');
      await user.click(confirmButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Please select an export format')).toBeInTheDocument();
      });

      logger.info('Test', '✅ Export validation works correctly');
    });
  });

  describe('🔄 Phase 2: Data Processing', () => {
    
    test('✅ Should export current view data', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockExportResult: ExportResult = {
        content: JSON.stringify({ feeds: mockFeeds }),
        filename: 'tactical-intel-export-20250107.json',
        size: 1024,
        format: 'json',
        encrypted: false,
        compressed: false,
        timestamp: new Date()
      };

      mockExportService.exportFeeds.mockResolvedValue(mockExportResult);

      // Act
      render(<Export feeds={mockFeeds} />);
      
      const exportButton = screen.getByText('Export Data');
      await user.click(exportButton);

      // Select JSON format
      const jsonOption = screen.getByLabelText('JSON');
      await user.click(jsonOption);

      const confirmButton = screen.getByText('Export');
      await user.click(confirmButton);

      // Assert
      await waitFor(() => {
        expect(mockExportService.exportFeeds).toHaveBeenCalledWith(
          mockFeeds,
          expect.objectContaining({
            format: 'json'
          })
        );
      });

      logger.info('Test', '✅ Current view data export works correctly');
    });

    test('✅ Should generate JSON format correctly', async () => {
      // Arrange
      const exportOptions: ExportOptions = {
        format: 'json',
        metadata: {
          title: 'Test Export',
          description: 'Test intelligence export'
        }
      };

      // Act
      const result = await ExportService.exportFeeds(mockFeeds, exportOptions);

      // Assert
      expect(result.format).toBe('json');
      expect(result.filename).toMatch(/tactical-intel-export-\d{8}\.json/);
      
      const content = JSON.parse(result.content as string);
      expect(content.metadata.title).toBe('Test Export');
      expect(content.feeds).toHaveLength(3);
      expect(content.feeds[0].title).toBe('Breaking: Security Breach Detected');

      logger.info('Test', '✅ JSON format generation works correctly');
    });

    test('✅ Should generate CSV format correctly', async () => {
      // Arrange
      const exportOptions: ExportOptions = {
        format: 'csv'
      };

      // Act
      const result = await ExportService.exportFeeds(mockFeeds, exportOptions);

      // Assert
      expect(result.format).toBe('csv');
      expect(result.filename).toMatch(/tactical-intel-export-\d{8}\.csv/);
      
      const content = result.content as string;
      expect(content).toContain('ID,Name,URL,Title,Link,Publication Date');
      expect(content).toContain('Breaking: Security Breach Detected');
      expect(content).toContain('BBC');

      logger.info('Test', '✅ CSV format generation works correctly');
    });

    test('✅ Should generate PDF format correctly', async () => {
      // Arrange
      const exportOptions: ExportOptions = {
        format: 'pdf',
        metadata: {
          title: 'Intelligence Report',
          author: 'Tactical Intel Dashboard'
        }
      };

      // Act
      const result = await ExportService.exportFeeds(mockFeeds, exportOptions);

      // Assert
      expect(result.format).toBe('pdf');
      expect(result.filename).toMatch(/tactical-intel-export-\d{8}\.pdf/);
      expect(result.content).toBeInstanceOf(Blob);

      logger.info('Test', '✅ PDF format generation works correctly');
    });

    test('✅ Should generate XML format correctly', async () => {
      // Arrange
      const exportOptions: ExportOptions = {
        format: 'xml',
        metadata: {
          title: 'XML Intelligence Export'
        }
      };

      // Act
      const result = await ExportService.exportFeeds(mockFeeds, exportOptions);

      // Assert
      expect(result.format).toBe('xml');
      expect(result.filename).toMatch(/tactical-intel-export-\d{8}\.xml/);
      
      const content = result.content as string;
      expect(content).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(content).toContain('<TacticalIntelExport>');
      expect(content).toContain('<Title>Breaking: Security Breach Detected</Title>');

      logger.info('Test', '✅ XML format generation works correctly');
    });

    test('✅ Should handle filtered data export', async () => {
      // Arrange
      const filteredFeeds = mockFeeds.filter(feed => feed.tags?.includes('security'));
      const exportOptions: ExportOptions = {
        format: 'json',
        includeFields: ['title', 'description', 'timestamp']
      };

      // Act
      const result = await ExportService.exportFeeds(filteredFeeds, exportOptions);

      // Assert
      const content = JSON.parse(result.content as string);
      expect(content.feeds).toHaveLength(1);
      expect(content.feeds[0].title).toBe('Breaking: Security Breach Detected');

      logger.info('Test', '✅ Filtered data export works correctly');
    });

    test('✅ Should handle date range filtering', async () => {
      // Arrange
      const exportOptions: ExportOptions = {
        format: 'json',
        dateRange: {
          start: new Date('2025-01-07T09:00:00Z'),
          end: new Date('2025-01-07T11:00:00Z')
        }
      };

      // Act
      const result = await ExportService.exportFeeds(mockFeeds, exportOptions);

      // Assert
      const content = JSON.parse(result.content as string);
      expect(content.feeds).toHaveLength(2); // Only feeds within date range

      logger.info('Test', '✅ Date range filtering works correctly');
    });
  });

  describe('🔐 Phase 3: Security & Encryption', () => {
    
    test('✅ Should handle encryption', async () => {
      // Arrange
      const exportOptions: ExportOptions = {
        format: 'json',
        encryption: {
          enabled: true,
          password: 'test-password-123'
        }
      };

      // Act
      const result = await ExportService.exportFeeds(mockFeeds, exportOptions);

      // Assert
      expect(result.encrypted).toBe(true);
      expect(result.filename).toMatch(/\.encrypted$/);
      expect(typeof result.content).toBe('string');

      // Test decryption
      const decrypted = await ExportService.decryptContent(
        result.content as string, 
        'test-password-123'
      );
      expect(decrypted).toContain('Breaking: Security Breach Detected');

      logger.info('Test', '✅ Encryption works correctly');
    });

    test('✅ Should handle compression', async () => {
      // Arrange
      const exportOptions: ExportOptions = {
        format: 'json',
        compression: true
      };

      // Act
      const result = await ExportService.exportFeeds(mockFeeds, exportOptions);

      // Assert
      expect(result.compressed).toBe(true);
      expect(result.filename).toMatch(/\.gz$/);
      expect(result.content).toBeInstanceOf(Blob);

      logger.info('Test', '✅ Compression works correctly');
    });

    test('✅ Should validate export options', async () => {
      // Arrange
      const invalidOptions: ExportOptions = {
        format: 'invalid' as any,
        encryption: {
          enabled: true
          // Missing password
        }
      };

      // Act
      const validation = ExportService.validateExportOptions(invalidOptions);

      // Assert
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Invalid export format');
      expect(validation.errors).toContain('Encryption requires a password');

      logger.info('Test', '✅ Export options validation works correctly');
    });
  });

  describe('📁 Phase 4: File Delivery', () => {
    
    test('✅ Should trigger browser download', async () => {
      // Arrange
      const mockResult: ExportResult = {
        content: 'test content',
        filename: 'test-export.json',
        size: 12,
        format: 'json',
        encrypted: false,
        compressed: false,
        timestamp: new Date()
      };

      const mockLink = {
        href: '',
        download: '',
        click: jest.fn(),
        remove: jest.fn()
      };

      (document.createElement as jest.Mock).mockReturnValue(mockLink);

      // Act
      await ExportService.downloadFile(mockResult);

      // Assert
      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(mockLink.download).toBe('test-export.json');
      expect(mockLink.click).toHaveBeenCalled();
      expect(document.body.appendChild).toHaveBeenCalledWith(mockLink);
      expect(document.body.removeChild).toHaveBeenCalledWith(mockLink);

      logger.info('Test', '✅ Browser download works correctly');
    });

    test('✅ Should handle large dataset exports', async () => {
      // Arrange
      const largeDataset = Array.from({ length: 10000 }, (_, i) => ({
        ...mockFeeds[0],
        id: `large-${i}`,
        title: `Large Dataset Article ${i}`
      }));

      const exportOptions: ExportOptions = {
        format: 'json'
      };

      // Act
      const startTime = performance.now();
      const result = await ExportService.exportFeeds(largeDataset, exportOptions);
      const endTime = performance.now();
      const exportTime = endTime - startTime;

      // Assert
      expect(exportTime).toBeLessThan(5000); // Should complete within 5 seconds
      expect(result.size).toBeGreaterThan(0);

      const content = JSON.parse(result.content as string);
      expect(content.feeds).toHaveLength(10000);

      logger.info('Test', `✅ Large dataset export completed in ${exportTime}ms`);
    });

    test('✅ Should provide export progress feedback', async () => {
      // Arrange
      const user = userEvent.setup();
      let progressCallback: ((progress: number) => void) | undefined;

      mockExportService.exportFeeds.mockImplementation((feeds, options) => {
        return new Promise((resolve) => {
          // Simulate progress updates
          let progress = 0;
          const interval = setInterval(() => {
            progress += 20;
            if (progressCallback) progressCallback(progress);
            
            if (progress >= 100) {
              clearInterval(interval);
              resolve({
                content: 'test',
                filename: 'test.json',
                size: 100,
                format: 'json',
                encrypted: false,
                compressed: false,
                timestamp: new Date()
              });
            }
          }, 100);
        });
      });

      // Act
      render(<Export feeds={mockFeeds} onProgress={(callback) => { progressCallback = callback; }} />);
      
      const exportButton = screen.getByText('Export Data');
      await user.click(exportButton);

      const jsonOption = screen.getByLabelText('JSON');
      await user.click(jsonOption);

      const confirmButton = screen.getByText('Export');
      await user.click(confirmButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Exporting...')).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText('Export Complete')).toBeInTheDocument();
      }, { timeout: 10000 });

      logger.info('Test', '✅ Export progress feedback works correctly');
    });

    test('✅ Should handle export errors gracefully', async () => {
      // Arrange
      const user = userEvent.setup();
      const exportError = new Error('Export service unavailable');

      mockExportService.exportFeeds.mockRejectedValue(exportError);

      // Act
      render(<Export feeds={mockFeeds} />);
      
      const exportButton = screen.getByText('Export Data');
      await user.click(exportButton);

      const jsonOption = screen.getByLabelText('JSON');
      await user.click(jsonOption);

      const confirmButton = screen.getByText('Export');
      await user.click(confirmButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Export Error')).toBeInTheDocument();
        expect(screen.getByText(/export service unavailable/i)).toBeInTheDocument();
        expect(screen.getByText('Retry')).toBeInTheDocument();
      });

      logger.info('Test', '✅ Export error handling works correctly');
    });
  });

  describe('🔗 Integration Tests', () => {
    
    test('✅ Should complete full export workflow', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockResult: ExportResult = {
        content: JSON.stringify({ feeds: mockFeeds }),
        filename: 'tactical-intel-export-20250107.json',
        size: 1024,
        format: 'json',
        encrypted: false,
        compressed: false,
        timestamp: new Date()
      };

      mockExportService.exportFeeds.mockResolvedValue(mockResult);
      mockExportService.downloadFile.mockResolvedValue();

      // Act - Complete workflow
      render(<Export feeds={mockFeeds} />);
      
      // Open export dialog
      const exportButton = screen.getByText('Export Data');
      await user.click(exportButton);

      // Select format
      const jsonOption = screen.getByLabelText('JSON');
      await user.click(jsonOption);

      // Add metadata
      const titleInput = screen.getByLabelText('Export Title');
      await user.type(titleInput, 'Test Intelligence Export');

      // Confirm export
      const confirmButton = screen.getByText('Export');
      await user.click(confirmButton);

      // Assert - Complete workflow
      await waitFor(() => {
        expect(mockExportService.exportFeeds).toHaveBeenCalledWith(
          mockFeeds,
          expect.objectContaining({
            format: 'json',
            metadata: expect.objectContaining({
              title: 'Test Intelligence Export'
            })
          })
        );
      });

      await waitFor(() => {
        expect(mockExportService.downloadFile).toHaveBeenCalledWith(mockResult);
      });

      logger.info('Test', '✅ Complete export workflow functions correctly');
    });

    test('⚡ Should handle multiple simultaneous exports', async () => {
      // Arrange
      const user = userEvent.setup();
      const exportPromises: Promise<ExportResult>[] = [];

      mockExportService.exportFeeds.mockImplementation(() => {
        const promise = new Promise<ExportResult>((resolve) => {
          setTimeout(() => resolve({
            content: 'test',
            filename: 'test.json',
            size: 100,
            format: 'json',
            encrypted: false,
            compressed: false,
            timestamp: new Date()
          }), 1000);
        });
        exportPromises.push(promise);
        return promise;
      });

      // Act - Start multiple exports
      render(<Export feeds={mockFeeds} />);
      
      const exportButton = screen.getByText('Export Data');
      await user.click(exportButton);

      const jsonOption = screen.getByLabelText('JSON');
      await user.click(jsonOption);

      // Start first export
      const confirmButton = screen.getByText('Export');
      await user.click(confirmButton);

      // Start second export immediately
      await user.click(exportButton);
      await user.click(jsonOption);
      await user.click(confirmButton);

      // Assert - Both exports should complete
      await Promise.all(exportPromises);
      expect(exportPromises).toHaveLength(2);

      logger.info('Test', '✅ Multiple simultaneous exports handled correctly');
    });
  });

  describe('⚡ Performance Tests', () => {
    
    test('✅ Should optimize memory usage during export', async () => {
      // Arrange
      const largeDataset = Array.from({ length: 50000 }, (_, i) => ({
        ...mockFeeds[0],
        id: `memory-test-${i}`,
        title: `Memory Test Article ${i}`.repeat(10) // Increase memory usage
      }));

      const exportOptions: ExportOptions = {
        format: 'json'
      };

      // Act
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      const result = await ExportService.exportFeeds(largeDataset, exportOptions);
      
      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;

      // Assert
      expect(result.size).toBeGreaterThan(0);
      expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024); // Less than 100MB increase

      logger.info('Test', `✅ Memory usage optimized: ${memoryIncrease / 1024 / 1024}MB increase`);
    });

    test('✅ Should handle concurrent exports efficiently', async () => {
      // Arrange
      const datasets = Array.from({ length: 5 }, (_, i) => 
        Array.from({ length: 1000 }, (_, j) => ({
          ...mockFeeds[0],
          id: `concurrent-${i}-${j}`,
          title: `Concurrent Export ${i}-${j}`
        }))
      );

      const exportOptions: ExportOptions = {
        format: 'json'
      };

      // Act
      const startTime = performance.now();
      
      const exportPromises = datasets.map(dataset => 
        ExportService.exportFeeds(dataset, exportOptions)
      );
      
      const results = await Promise.all(exportPromises);
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Assert
      expect(results).toHaveLength(5);
      expect(totalTime).toBeLessThan(10000); // Should complete within 10 seconds
      
      results.forEach(result => {
        expect(result.size).toBeGreaterThan(0);
      });

      logger.info('Test', `✅ Concurrent exports completed in ${totalTime}ms`);
    });
  });
});

/**
 * Test Utilities for Export & Analysis
 */
export class ExportTestUtils {
  
  static createMockFeedDataset(size: number, overrides = {}) {
    return Array.from({ length: size }, (_, i) => ({
      id: `feed-${i}`,
      title: `Test Article ${i}`,
      description: `Description for article ${i}`,
      source: `Source ${i % 5}`,
      timestamp: new Date(Date.now() - i * 1000 * 60),
      url: `https://example.com/article-${i}`,
      author: `Author ${i % 3}`,
      tags: [`tag${i % 3}`, `category${i % 2}`],
      priority: i % 3 === 0 ? 'high' : i % 3 === 1 ? 'medium' : 'low',
      classification: 'public',
      ...overrides
    }));
  }

  static createMockExportOptions(overrides: Partial<ExportOptions> = {}): ExportOptions {
    return {
      format: 'json',
      metadata: {
        title: 'Test Export',
        description: 'Test intelligence export',
        author: 'Test Author'
      },
      ...overrides
    };
  }

  static async validateExportResult(result: ExportResult, expectedFormat: string) {
    expect(result.format).toBe(expectedFormat);
    expect(result.filename).toBeTruthy();
    expect(result.size).toBeGreaterThan(0);
    expect(result.content).toBeTruthy();
    expect(result.timestamp).toBeInstanceOf(Date);
  }

  static async validateJSONExport(content: string) {
    const parsed = JSON.parse(content);
    expect(parsed.metadata).toBeTruthy();
    expect(parsed.feeds).toBeInstanceOf(Array);
    expect(parsed.metadata.exportDate).toBeTruthy();
    return parsed;
  }

  static async validateCSVExport(content: string) {
    const lines = content.split('\n');
    expect(lines[0]).toContain('ID,Name,URL,Title'); // Header
    expect(lines.length).toBeGreaterThan(1);
    return lines;
  }

  static async validateXMLExport(content: string) {
    expect(content).toContain('<?xml version="1.0"');
    expect(content).toContain('<TacticalIntelExport>');
    expect(content).toContain('</TacticalIntelExport>');
    return content;
  }

  static async measureExportPerformance(
    exportFunction: Function,
    dataset: any[],
    options: ExportOptions
  ) {
    const startTime = performance.now();
    const startMemory = (performance as any).memory?.usedJSHeapSize || 0;
    
    const result = await exportFunction(dataset, options);
    
    const endTime = performance.now();
    const endMemory = (performance as any).memory?.usedJSHeapSize || 0;
    
    return {
      exportTime: endTime - startTime,
      memoryUsed: endMemory - startMemory,
      resultSize: result.size,
      performance: {
        timeRating: endTime - startTime < 1000 ? 'excellent' : 
                   endTime - startTime < 3000 ? 'good' : 'needs improvement',
        memoryRating: (endMemory - startMemory) < 50 * 1024 * 1024 ? 'excellent' : 
                     (endMemory - startMemory) < 100 * 1024 * 1024 ? 'good' : 'needs improvement'
      }
    };
  }

  static createLargeDatasetForTesting(size = 10000) {
    return this.createMockFeedDataset(size, {
      // Add extra data to increase export complexity
      content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(50),
      media: [
        { type: 'image', url: 'https://example.com/image.jpg' },
        { type: 'video', url: 'https://example.com/video.mp4' }
      ],
      categories: ['news', 'politics', 'technology', 'science', 'business'],
      metadata: {
        sentiment: Math.random() > 0.5 ? 'positive' : 'negative',
        readingTime: Math.floor(Math.random() * 10) + 1,
        wordCount: Math.floor(Math.random() * 1000) + 100
      }
    });
  }

  static async simulateFileDownload(result: ExportResult) {
    // Simulate browser file download behavior
    const blob = typeof result.content === 'string' 
      ? new Blob([result.content], { type: 'text/plain' })
      : result.content;

    const url = URL.createObjectURL(blob);
    
    // Simulate download completion
    await new Promise(resolve => setTimeout(resolve, 100));
    
    URL.revokeObjectURL(url);
    
    return {
      downloaded: true,
      filename: result.filename,
      size: result.size
    };
  }
}

/**
 * Export Performance Benchmarking
 */
export class ExportPerformanceBenchmark {
  
  static async runFullBenchmark() {
    const results = [];
    
    // Test different dataset sizes
    const sizes = [100, 1000, 5000, 10000];
    const formats = ['json', 'csv', 'xml'];
    
    for (const size of sizes) {
      for (const format of formats) {
        const dataset = ExportTestUtils.createMockFeedDataset(size);
        const options = ExportTestUtils.createMockExportOptions({ format: format as any });
        
        const performance = await ExportTestUtils.measureExportPerformance(
          ExportService.exportFeeds,
          dataset,
          options
        );
        
        results.push({
          size,
          format,
          ...performance
        });
      }
    }
    
    return results;
  }

  static generatePerformanceReport(benchmarkResults: any[]) {
    return {
      summary: {
        totalTests: benchmarkResults.length,
        averageTime: benchmarkResults.reduce((sum, r) => sum + r.exportTime, 0) / benchmarkResults.length,
        averageMemory: benchmarkResults.reduce((sum, r) => sum + r.memoryUsed, 0) / benchmarkResults.length
      },
      byFormat: benchmarkResults.reduce((acc, result) => {
        if (!acc[result.format]) acc[result.format] = [];
        acc[result.format].push(result);
        return acc;
      }, {}),
      bySize: benchmarkResults.reduce((acc, result) => {
        if (!acc[result.size]) acc[result.size] = [];
        acc[result.size].push(result);
        return acc;
      }, {}),
      recommendations: benchmarkResults
        .filter(r => r.performance.timeRating === 'needs improvement')
        .map(r => `Optimize ${r.format} export for ${r.size} items`)
    };
  }
}
