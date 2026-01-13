import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import AlertList from '../AlertList';
import { AlertConfig } from '../../../types/AlertTypes';
import { makeProvenanceFixture } from '../../../tests/provenanceFixtures';

const baseAlert: AlertConfig = {
  id: 'alert-1',
  name: 'Example Alert',
  description: 'Test alert description',
  keywords: ['alpha'],
  sources: ['source-1'],
  priority: 'high',
  notifications: { browser: true, sound: false },
  scheduling: {},
  active: true,
  createdAt: new Date('2024-01-01T00:00:00Z'),
  triggerCount: 0
};

const noop = () => {};

describe('AlertList provenance badges', () => {
  it('shows provenance badges when provenance is provided', () => {
    const alerts: AlertConfig[] = [
      {
        ...baseAlert,
        provenance: makeProvenanceFixture()
      }
    ];

    render(
      <AlertList
        alerts={alerts}
        onEdit={noop}
        onDelete={noop}
        onToggle={noop}
        onSnooze={noop}
      />
    );

    const badges = screen.getAllByTestId('provenance-badges');
    expect(badges.length).toBeGreaterThan(0);
    expect(screen.getByText('Anchored')).toBeInTheDocument();
    expect(screen.getByText('Signed')).toBeInTheDocument();
  });

  it('renders neutral provenance state when missing provenance', () => {
    render(
      <AlertList
        alerts={[baseAlert]}
        onEdit={noop}
        onDelete={noop}
        onToggle={noop}
        onSnooze={noop}
      />
    );

    expect(screen.getByText(/Not anchored/i)).toBeInTheDocument();
  });
});
