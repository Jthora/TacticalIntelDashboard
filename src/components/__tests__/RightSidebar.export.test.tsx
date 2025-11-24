import { render } from '@testing-library/react';
import { act } from 'react';

import RightSidebar from '../RightSidebar';
import { Feed } from '../../models/Feed';
import { ExportService, ExportResult } from '../../services/ExportService';
import { useFeedData } from '../../contexts/FeedDataContext';
import { useStatusMessages } from '../../contexts/StatusMessageContext';
import { exportFeedsAsIntelZip, exportIntelReport } from '../../utils/intelExport';

jest.mock('../TacticalFilters', () => () => <div data-testid="tactical-filters" />);

let latestExportProps: any = null;
jest.mock('../Export', () => {
  const React = require('react');
  return function MockExport(props: any) {
    latestExportProps = props;
    return React.createElement('div', { 'data-testid': 'export-module' });
  };
});

jest.mock('../../contexts/FeedDataContext', () => ({
  useFeedData: jest.fn(),
}));

jest.mock('../../contexts/StatusMessageContext', () => ({
  useStatusMessages: jest.fn(),
}));

jest.mock('../../utils/intelExport', () => ({
  exportFeedsAsIntelZip: jest.fn(),
  exportIntelReport: jest.fn(),
}));

const useFeedDataMock = useFeedData as jest.MockedFunction<typeof useFeedData>;
const useStatusMessagesMock = useStatusMessages as jest.MockedFunction<typeof useStatusMessages>;
const exportFeedsAsIntelZipMock = exportFeedsAsIntelZip as jest.MockedFunction<typeof exportFeedsAsIntelZip>;
const exportIntelReportMock = exportIntelReport as jest.MockedFunction<typeof exportIntelReport>;

const makeFeed = (overrides: Partial<Feed> = {}): Feed => ({
  id: overrides.id || 'feed-1',
  name: overrides.name || 'Source',
  url: overrides.url || 'https://example.com/feed',
  title: overrides.title || 'Sample Title',
  link: overrides.link || 'https://example.com/article',
  pubDate: overrides.pubDate || new Date('2025-01-01T00:00:00Z').toISOString(),
  description: overrides.description || 'Sample description',
  content: overrides.content || 'Sample content',
  feedListId: overrides.feedListId || 'default',
  author: overrides.author || 'Analyst',
  categories: overrides.categories || ['INTEL'],
  priority: overrides.priority || 'HIGH',
  contentType: overrides.contentType || 'INTEL',
  region: overrides.region || 'GLOBAL',
  tags: overrides.tags || ['ALERT'],
  classification: overrides.classification || 'UNCLASS',
  timestamp: overrides.timestamp || new Date('2025-01-01T00:00:00Z').toISOString(),
  source: overrides.source || 'System',
  ...overrides,
});

const baseOptions = {
  includeMetadata: true,
  compress: false,
  encrypt: false,
  metadataTitle: 'Mission Export',
  metadataDescription: 'Details',
  encryptionPassword: '',
};

describe('RightSidebar export orchestration', () => {
  let pushMessageMock: jest.Mock;

  const renderSidebar = (feeds: Feed[], filteredFeeds: Feed[] = []) => {
    useFeedDataMock.mockReturnValue({
      feeds,
      filteredFeeds,
      lastUpdated: null,
      updateFeedSnapshot: jest.fn(),
      clearFeedSnapshot: jest.fn(),
    });

    render(<RightSidebar />);
    expect(latestExportProps).toBeTruthy();
  };

  beforeEach(() => {
    latestExportProps = null;
    pushMessageMock = jest.fn();
    useStatusMessagesMock.mockReturnValue({
      messages: [],
      latestMessage: null,
      highestPriorityMessage: null,
      pushMessage: pushMessageMock,
      dismissMessage: jest.fn(),
      clearMessages: jest.fn(),
    });
    exportFeedsAsIntelZipMock.mockReset();
    exportIntelReportMock.mockReset();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('warns when no format is selected', async () => {
    renderSidebar([makeFeed()]);
    await latestExportProps.onExecuteExport(null, baseOptions);
    expect(pushMessageMock).toHaveBeenCalledWith(
      'Select a format before exporting.',
      'warning',
      { source: 'Export' }
    );
  });

  it('warns when no feeds are available', async () => {
    renderSidebar([]);
    await latestExportProps.onExecuteExport('json', baseOptions);
    expect(pushMessageMock).toHaveBeenCalledWith(
      'No feeds available to export.',
      'warning',
      { source: 'Export' }
    );
  });

  it('requires a password when encryption is enabled', async () => {
    renderSidebar([makeFeed()]);
    await latestExportProps.onExecuteExport('json', {
      ...baseOptions,
      encrypt: true,
      encryptionPassword: '   ',
    });
    expect(pushMessageMock).toHaveBeenCalledWith(
      'Provide an encryption password or disable encryption.',
      'warning',
      { source: 'Export' }
    );
  });

  it('passes exportable feeds and options to ExportService', async () => {
    renderSidebar([makeFeed({ id: 'feed-a' })], [makeFeed({ id: 'filtered-only' })]);

    const result: ExportResult = {
      content: 'payload',
      filename: 'file.json',
      size: 16,
      format: 'json',
      encrypted: false,
      compressed: true,
      timestamp: new Date(),
    };

    const exportFeedsSpy = jest
      .spyOn(ExportService, 'exportFeeds')
      .mockResolvedValue(result);
    const downloadSpy = jest
      .spyOn(ExportService, 'downloadFile')
      .mockResolvedValue();

    await act(async () => {
      await latestExportProps.onExecuteExport('json', {
        includeMetadata: true,
        compress: true,
        encrypt: true,
        metadataTitle: 'Custom Title',
        metadataDescription: 'Custom Description',
        encryptionPassword: 'secret',
      });
    });

    expect(exportFeedsSpy).toHaveBeenCalledWith(
      [expect.objectContaining({ id: 'filtered-only' })],
      expect.objectContaining({
        format: 'json',
        metadata: {
          title: 'Custom Title',
          description: 'Custom Description',
        },
        compression: true,
        encryption: {
          enabled: true,
          password: 'secret',
        },
      })
    );

    expect(downloadSpy).toHaveBeenCalledWith(result);
    expect(pushMessageMock).toHaveBeenLastCalledWith(
      'Exported 1 feeds as JSON.',
      'success',
      { source: 'Export' }
    );
  });

  it('falls back to default metadata title when missing', async () => {
    renderSidebar([makeFeed()]);

    const exportFeedsSpy = jest
      .spyOn(ExportService, 'exportFeeds')
      .mockResolvedValue({
        content: 'payload',
        filename: 'file.json',
        size: 4,
        format: 'json',
        encrypted: false,
        compressed: false,
        timestamp: new Date(),
      });
    jest.spyOn(ExportService, 'downloadFile').mockResolvedValue();

    await act(async () => {
      await latestExportProps.onExecuteExport('json', {
        includeMetadata: true,
        compress: false,
        encrypt: false,
        metadataTitle: '',
        metadataDescription: '',
        encryptionPassword: '',
      });
    });

    expect(exportFeedsSpy).toHaveBeenCalledWith(
      expect.any(Array),
      expect.objectContaining({
        metadata: { title: 'Tactical Intel Dashboard Export' },
      })
    );
  });

  it('routes INTEL exports to the intel zip utility', async () => {
    renderSidebar([makeFeed({ id: 'intel-feed' })], [makeFeed({ id: 'filtered-intel' })]);

    await act(async () => {
      await latestExportProps.onExecuteExport('intel', baseOptions);
    });

    expect(exportFeedsAsIntelZipMock).toHaveBeenCalledWith(
      [expect.objectContaining({ id: 'filtered-intel' })],
      { limit: 200 }
    );
    expect(pushMessageMock).toHaveBeenCalledWith(
      'Intel package export request logged (stub implementation).',
      'info',
      { source: 'Export' }
    );
  });

  it('routes INTELREPORT exports to the report utility', async () => {
    renderSidebar([makeFeed({ id: 'intel-feed' })]);

    await act(async () => {
      await latestExportProps.onExecuteExport('intelreport', baseOptions);
    });

    expect(exportIntelReportMock).toHaveBeenCalledWith(
      [expect.objectContaining({ id: 'intel-feed' })],
      { limit: 200 }
    );
    expect(pushMessageMock).toHaveBeenCalledWith(
      'Intel report export request logged (stub implementation).',
      'info',
      { source: 'Export' }
    );
  });

  it('rejects unsupported formats with an error message', async () => {
    renderSidebar([makeFeed()]);

    await act(async () => {
      await latestExportProps.onExecuteExport('unsupported', baseOptions);
    });

    expect(pushMessageMock).toHaveBeenCalledWith(
      'Unsupported export format selected.',
      'error',
      { source: 'Export' }
    );
  });
});
