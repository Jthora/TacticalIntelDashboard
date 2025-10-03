import '@testing-library/jest-dom';

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import FeedItem from '../FeedItem';
import { Feed } from '../../../../models/Feed';
import useSocialShare from '../../../../hooks/useSocialShare';
import { useSettings } from '../../../../contexts/SettingsContext';

jest.mock('../../../../hooks/useSocialShare');
jest.mock('../../../../contexts/SettingsContext');

const mockShare = jest.fn();

const createFeed = (overrides: Partial<Feed> = {}): Feed => ({
  id: 'feed-123',
  name: 'Test Feed',
  url: 'https://example.com/rss',
  title: 'Sample Feed Title',
  link: 'https://example.com/articles/1',
  pubDate: '2025-10-01T00:00:00Z',
  description: '<p>Critical update for intelligence analysts.</p>',
  feedListId: 'list-1',
  author: 'Analyst',
  tags: ['OSINT', 'Intel'],
  ...overrides
});

const mockUseSettings = useSettings as jest.Mock;

describe('FeedItem social sharing', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useSocialShare as jest.Mock).mockReturnValue({
      share: mockShare.mockResolvedValue({ method: 'intent', intentUrl: 'https://x.com/intent/tweet?foo=bar' })
    });
    mockUseSettings.mockReturnValue({
      settings: {
        general: {
          share: {
            enabled: true,
            defaultHashtags: ['intelwatch'],
            attribution: 'via Tactical Intel Dashboard'
          }
        }
      }
    });
  });

  it('renders a share button', () => {
    render(<FeedItem feed={createFeed()} />);

    expect(screen.getByTestId('feed-share-btn')).toBeInTheDocument();
    expect(screen.getByTestId('feed-share-btn')).toHaveTextContent('Share');
  });

  it('invokes social share helper with sanitized payload', async () => {
    const user = userEvent.setup();
    render(<FeedItem feed={createFeed()} />);

    await user.click(screen.getByTestId('feed-share-btn'));

    await waitFor(() => {
      expect(mockShare).toHaveBeenCalledTimes(1);
    });

    expect(mockShare).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'https://example.com/articles/1',
        title: 'Sample Feed Title',
        summary: 'Critical update for intelligence analysts. via Tactical Intel Dashboard',
        hashtags: ['OSINT', 'Intel']
      })
    );
  });

  it('displays feedback message after sharing', async () => {
    const user = userEvent.setup();
    render(<FeedItem feed={createFeed()} />);

    await user.click(screen.getByTestId('feed-share-btn'));

    expect(await screen.findByRole('status')).toHaveTextContent('Share opened in new window');
  });

  it('hides share button when feature disabled', () => {
    mockUseSettings.mockReturnValue({
      settings: {
        general: {
          share: {
            enabled: false,
            defaultHashtags: [],
            attribution: ''
          }
        }
      }
    });

    render(<FeedItem feed={createFeed()} />);

    expect(screen.queryByTestId('feed-share-btn')).not.toBeInTheDocument();
  });
});
