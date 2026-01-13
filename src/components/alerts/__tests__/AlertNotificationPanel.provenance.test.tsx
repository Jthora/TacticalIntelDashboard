import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import AlertNotificationPanel from '../AlertNotificationPanel';
import { makePendingProvenance } from '../../../tests/provenanceFixtures';

const alertHistoryMock = [
  {
    id: 'trig-1',
    alertId: 'alert-1',
    triggeredAt: new Date('2024-01-01T00:00:00Z'),
    feedItem: {
      title: 'Alert feed item',
      link: 'https://example.com',
      source: 'Example',
      pubDate: '2024-01-01T00:00:00Z',
      provenance: makePendingProvenance()
    },
    matchedKeywords: ['alpha'],
    priority: 'high',
    acknowledged: false
  }
];

const acknowledgeAlertMock = jest.fn();

jest.mock('../../../hooks/alerts/useAlerts', () => {
  const mockUseAlerts = () => ({
    alertHistory: alertHistoryMock,
    acknowledgeAlert: acknowledgeAlertMock,
    alertStats: { triggersToday: 1, totalTriggers: 10 }
  });
  return { __esModule: true, default: mockUseAlerts };
});

describe('AlertNotificationPanel provenance badges', () => {
  it('renders provenance badges for alert notifications', () => {
    render(<AlertNotificationPanel />);
    expect(screen.getByTestId('provenance-badges')).toBeInTheDocument();
    expect(screen.getByText('Anchoring')).toBeInTheDocument();
  });
});
