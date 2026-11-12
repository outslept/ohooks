import { useEffect, useState } from 'react';

export interface UseGeolocationOptions extends PositionOptions {
  enabled?: boolean;
}

export interface GeolocationState {
  isSupported: boolean;
  loading: boolean;
  accuracy: number | null;
  altitude: number | null;
  altitudeAccuracy: number | null;
  heading: number | null;
  latitude: number | null;
  longitude: number | null;
  speed: number | null;
  timestamp: number | null;
  error: GeolocationPositionError | null;
}

const INITIAL_STATE: Omit<GeolocationState, 'isSupported' | 'loading'> = {
  accuracy: null,
  altitude: null,
  altitudeAccuracy: null,
  heading: null,
  latitude: null,
  longitude: null,
  speed: null,
  timestamp: null,
  error: null,
};

export function useGeolocation(
  options: UseGeolocationOptions = {},
): GeolocationState {
  const {
    enabled = true,
    enableHighAccuracy = false,
    maximumAge = 0,
    timeout = Infinity,
  } = options;

  const isSupported =
    typeof navigator !== 'undefined' && 'geolocation' in navigator;

  const [state, setState] = useState<GeolocationState>({
    ...INITIAL_STATE,
    isSupported,
    loading: Boolean(enabled && isSupported),
  });

  useEffect(() => {
    if (!isSupported || !enabled) {
      setState((prev) => (prev.loading ? { ...prev, loading: false } : prev));
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    const onSuccess = (position: GeolocationPosition): void => {
      const { coords, timestamp } = position;
      setState({
        isSupported: true,
        loading: false,
        accuracy: coords.accuracy,
        altitude: coords.altitude,
        altitudeAccuracy: coords.altitudeAccuracy,
        heading: coords.heading,
        latitude: coords.latitude,
        longitude: coords.longitude,
        speed: coords.speed,
        timestamp,
        error: null,
      });
    };

    const onError = (error: GeolocationPositionError): void => {
      setState((prev) => ({
        ...prev,
        loading: false,
        error,
      }));
    };

    const watchId = navigator.geolocation.watchPosition(onSuccess, onError, {
      enableHighAccuracy,
      maximumAge,
      timeout,
    });

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [isSupported, enabled, enableHighAccuracy, maximumAge, timeout]);

  return state;
}
