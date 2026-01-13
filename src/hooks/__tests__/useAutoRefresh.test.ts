import { act, renderHook } from '@testing-library/react';
import { describe, expect, jest, test } from '@jest/globals';

import { useAutoRefresh } from '../useAutoRefresh';

describe('useAutoRefresh', () => {
  test('registers interval and triggers load when autoRefresh is enabled', () => {
    const loadFeeds = jest.fn<(showLoading?: boolean, reason?: string) => void>();
    const getGeneralSettings = jest.fn(() => ({ refreshInterval: 120 }));
    const logDebug = jest.fn();

    let intervalCallback: () => void = () => {};
    const setIntervalMock = jest
      .fn((handler: () => void, timeout?: number) => {
        intervalCallback = handler;
        expect(timeout).toBe(120000);
        return 123 as unknown as ReturnType<typeof setInterval>;
      })
      .mockName('setIntervalMock') as unknown as typeof setInterval;
    const clearIntervalMock = jest.fn().mockName('clearIntervalMock') as unknown as typeof clearInterval;

    const { unmount } = renderHook(() =>
      useAutoRefresh(
        {
          autoRefresh: true,
          selectedFeedList: 'intel-sources',
          loadFeeds
        },
        {
          getGeneralSettings,
          logDebug,
          setIntervalFn: setIntervalMock,
          clearIntervalFn: clearIntervalMock
        }
      )
    );

    expect(getGeneralSettings).toHaveBeenCalledTimes(1);
    expect(setIntervalMock).toHaveBeenCalledTimes(1);

    act(() => {
      intervalCallback();
    });

    expect(logDebug).toHaveBeenCalledWith(
      'Component',
      'Auto-refreshing feeds every 120 seconds...'
    );
    expect(loadFeeds).toHaveBeenCalledWith(false, 'auto-refresh');

    unmount();
    expect(clearIntervalMock).toHaveBeenCalledWith(123 as unknown as ReturnType<typeof setInterval>);
  });

  test('does not register interval when autoRefresh is disabled', () => {
    const loadFeeds = jest.fn<(showLoading?: boolean) => void>();
  const setIntervalMock = jest.fn().mockName('setIntervalMock') as unknown as typeof setInterval;

    renderHook(() =>
      useAutoRefresh(
        {
          autoRefresh: false,
          selectedFeedList: 'intel-sources',
          loadFeeds
        },
        {
          setIntervalFn: setIntervalMock
        }
      )
    );

    expect(setIntervalMock).not.toHaveBeenCalled();
    expect(loadFeeds).not.toHaveBeenCalled();
  });

  test('does not register interval when selectedFeedList is null', () => {
    const loadFeeds = jest.fn<(showLoading?: boolean) => void>();
  const setIntervalMock = jest.fn().mockName('setIntervalMock') as unknown as typeof setInterval;

    renderHook(() =>
      useAutoRefresh(
        {
          autoRefresh: true,
          selectedFeedList: null,
          loadFeeds
        },
        {
          setIntervalFn: setIntervalMock
        }
      )
    );

    expect(setIntervalMock).not.toHaveBeenCalled();
    expect(loadFeeds).not.toHaveBeenCalled();
  });
});
