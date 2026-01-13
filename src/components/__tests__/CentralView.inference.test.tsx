import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import CentralView from '../CentralView';

jest.mock('../FeedVisualizer', () => () => <div data-testid="feed-visualizer" />);
jest.mock('../BottomStatusBar', () => () => <div data-testid="bottom-status" />);

const runInferenceMock = jest.fn();
const useInferenceRequestMock = jest.fn();

jest.mock('../../hooks/useInferenceRequest', () => ({
  __esModule: true,
  default: () => useInferenceRequestMock()
}));

describe('CentralView inference CTAs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useInferenceRequestMock.mockReturnValue({
      state: {
        status: 'idle',
        feature: null
      },
      runInference: runInferenceMock,
      payloadMeta: {
        feedCount: 2,
        totalFeeds: 2,
        alerts: 0,
        lastUpdated: null
      }
    });
  });

  it('disables CTAs and shows loading label when request in-flight', () => {
    useInferenceRequestMock.mockReturnValue({
      state: {
        status: 'loading',
        feature: 'summary'
      },
      runInference: runInferenceMock,
      payloadMeta: {
        feedCount: 2,
        totalFeeds: 2,
        alerts: 1,
        lastUpdated: null
      }
    });

    render(<CentralView selectedFeedList="list-1" />);

    const summaryBtn = screen.getByRole('button', { name: 'Working…' }) as HTMLButtonElement;
    expect(summaryBtn).toBeDisabled();
    const riskBtn = screen.getByRole('button', { name: 'Risk & Alerts' }) as HTMLButtonElement;
    expect(riskBtn).toBeDisabled();
  });

  it('shows error message from inference state', () => {
    useInferenceRequestMock.mockReturnValue({
      state: {
        status: 'error',
        feature: 'summary',
        errorMessage: 'No feeds available for inference right now'
      },
      runInference: runInferenceMock,
      payloadMeta: {
        feedCount: 0,
        totalFeeds: 0,
        alerts: 0,
        lastUpdated: null
      }
    });

    render(<CentralView selectedFeedList="list-1" />);

    expect(screen.getByText('No feeds available for inference right now')).toBeInTheDocument();
  });

  it('invokes runInference when CTA clicked', () => {
    render(<CentralView selectedFeedList="list-1" />);

    fireEvent.click(screen.getByText('Summarize Intel'));
    expect(runInferenceMock).toHaveBeenCalledWith('summary');
  });

  it('shows empty-feed messaging and disables CTAs when no feeds', () => {
    useInferenceRequestMock.mockReturnValue({
      state: {
        status: 'idle',
        feature: null
      },
      runInference: runInferenceMock,
      payloadMeta: {
        feedCount: 0,
        totalFeeds: 0,
        alerts: 0,
        lastUpdated: null
      }
    });

    render(<CentralView selectedFeedList="list-1" />);

    expect(screen.getByText('No feeds available for inference right now. Add feeds to proceed.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Summarize Intel' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Risk & Alerts' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Source Health' })).toBeDisabled();
  });
});
