import '@testing-library/jest-dom';

import { render, screen, fireEvent } from '@testing-library/react';

import FeedItem from '../FeedItem';
import { Feed } from '../../../../models/Feed';
import { makeMissingCidProvenance, makeMultiRelayProvenance, makePendingProvenance, makeProvenanceFixture } from '../../../../tests/provenanceFixtures';
import useSocialShare from '../../../../hooks/useSocialShare';
import { useSettings } from '../../../../contexts/SettingsContext';

jest.mock('../../../../hooks/useSocialShare');
jest.mock('../../../../contexts/SettingsContext');

const createFeed = (overrides: Partial<Feed> = {}): Feed => ({
  id: 'feed-123',
  name: 'Test Feed',
  url: 'https://example.com/rss',
  title: 'Sample Feed Title',
  link: 'https://example.com/articles/1',
  pubDate: '2025-10-01T00:00:00Z',
  description: 'Critical update for intelligence analysts.',
  feedListId: 'list-1',
  author: 'Analyst',
  tags: ['OSINT', 'Intel'],
  provenance: makeProvenanceFixture(),
  ...overrides
});

const mockShare = jest.fn();
const mockUseSettings = useSettings as jest.Mock;

describe('FeedItem provenance', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useSocialShare as jest.Mock).mockReturnValue({ share: mockShare });
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
  });

  it('renders provenance badges and detail panel when provided', () => {
    render(<FeedItem feed={createFeed()} />);

    expect(screen.getByTestId('provenance-badges')).toBeInTheDocument();
    expect(screen.getByTestId('prov-badge-signature')).toHaveTextContent('Signed');

    fireEvent.click(screen.getByTestId('feed-prov-toggle'));
    expect(screen.getByTestId('feed-prov-detail')).toBeInTheDocument();
    expect(screen.getByTestId('prov-detail-panel')).toBeInTheDocument();
    expect(screen.getByTestId('prov-anchor')).toHaveTextContent('confirmed');
  });

  it('shows pending anchor state when anchorStatus is pending', () => {
    render(<FeedItem feed={createFeed({ provenance: makePendingProvenance() })} />);

    expect(screen.getByText('Anchoring')).toBeInTheDocument();
  });

  it('shows no CID when provenance lacks cid', () => {
    render(<FeedItem feed={createFeed({ provenance: makeMissingCidProvenance() })} />);

    expect(screen.getByTestId('prov-badge-cid')).toHaveTextContent('No CID');
  });

  it('renders multi-relay detail entries', () => {
    render(<FeedItem feed={createFeed({ provenance: makeMultiRelayProvenance() })} />);

    fireEvent.click(screen.getByTestId('feed-prov-toggle'));
    expect(screen.getByTestId('prov-relays')).toHaveTextContent('relay-1, relay-2, relay-3');
  });
});
