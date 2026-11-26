import {
  useGeolocation,
  type UseGeolocationOptions,
} from '@/hooks/useGeolocation';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from 'vitest-browser-react';

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

describe('useGeolocation', () => {
  const originalGeo = Object.getOwnPropertyDescriptor(navigator, 'geolocation');

  afterEach(() => {
    if (originalGeo) {
      Object.defineProperty(navigator, 'geolocation', originalGeo);
    }
    vi.restoreAllMocks();
  });

  it('watches position updates, handles and recovers from errors, and clears watch on disable or unmount', async () => {
    let successCb: PositionCallback | null = null;
    let errorCb: PositionErrorCallback | null = null;
    let watchCalls = 0;
    const clearedIds: number[] = [];

    Object.defineProperty(navigator, 'geolocation', {
      value: {
        watchPosition: (
          onSuccess: PositionCallback,
          onError?: PositionErrorCallback | null,
        ) => {
          watchCalls += 1;
          successCb = onSuccess;
          errorCb = onError ?? null;
          return 77;
        },
        clearWatch: (id: number) => {
          clearedIds.push(id);
        },
      },
      configurable: true,
    });

    const { result, rerender, unmount, act } = await renderHook(
      (props?: UseGeolocationOptions) =>
        useGeolocation(props ?? { enableHighAccuracy: true }),
    );

    expect(result.current.isSupported).toBe(true);
    expect(result.current.loading).toBe(true);
    expect(watchCalls).toBe(1);

    const mockErr = {
      code: 1,
      message: 'User denied Geolocation',
      PERMISSION_DENIED: 1,
      POSITION_UNAVAILABLE: 2,
      TIMEOUT: 3,
    } as GeolocationPositionError;

    await act(async () => {
      errorCb?.(mockErr);
    });
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(mockErr);

    await act(async () => {
      successCb?.({
        coords: {
          latitude: 55.75,
          longitude: 37.61,
          accuracy: 10,
          altitude: 150,
          altitudeAccuracy: 5,
          heading: 90,
          speed: 2,
          toJSON: () => ({}),
        },
        timestamp: 123456,
        toJSON: () => ({}),
      });
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.latitude).toBe(55.75);
    expect(result.current.longitude).toBe(37.61);
    expect(result.current.altitude).toBe(150);

    await rerender({ enabled: false });
    expect(clearedIds).toEqual([77]);
    expect(result.current.loading).toBe(false);

    await rerender({ enabled: true, enableHighAccuracy: false });
    expect(result.current.loading).toBe(true);
    expect(watchCalls).toBe(2);

    await unmount();
    expect(clearedIds).toEqual([77, 77]);
  });
});
