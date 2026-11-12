import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from 'vitest-browser-react';
import { useGeolocation } from '@/hooks/useGeolocation';

describe('useGeolocation', () => {
  const originalGeo = Object.getOwnPropertyDescriptor(navigator, 'geolocation');

  afterEach(() => {
    if (originalGeo) {
      Object.defineProperty(navigator, 'geolocation', originalGeo);
    }
    vi.restoreAllMocks();
  });

  it('watches position updates, handles errors, and clears watch on unmount', async () => {
    let successCb: PositionCallback | null = null;
    let errorCb: PositionErrorCallback | null = null;
    const clearWatch = vi.fn();

    const watchPosition = vi.fn((onSuccess: PositionCallback, onError?: PositionErrorCallback | null) => {
      successCb = onSuccess;
      errorCb = onError ?? null;
      return 77;
    });

    Object.defineProperty(navigator, 'geolocation', {
      value: { watchPosition, clearWatch },
      configurable: true,
    });

    const { result, act, unmount } = await renderHook(() =>
      useGeolocation({ enableHighAccuracy: true })
    );

    expect(result.current.isSupported).toBe(true);
    expect(result.current.loading).toBe(true);

    await act(async () => {
      successCb?.({
        coords: {
          latitude: 55.75,
          longitude: 37.61,
          accuracy: 10,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
          toJSON: () => ({}),
        },
        timestamp: 123456,
        toJSON: () => ({}),
      });
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.latitude).toBe(55.75);
    expect(result.current.longitude).toBe(37.61);
    expect(result.current.error).toBeNull();

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
    expect(result.current.error).toBe(mockErr);

    await unmount();
    expect(clearWatch).toHaveBeenCalledWith(77);
  });
});
