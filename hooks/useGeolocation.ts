import { useEffect, useState } from 'react';

export interface UseGeolocationOptions extends PositionOptions {
  /** Whether geolocation watching is active (default: `true`) */
  enabled?: boolean;
}

export interface GeolocationState {
  /** Whether `navigator.geolocation` is supported in the current environment */
  isSupported: boolean;
  /** Whether the initial position is currently being resolved */
  loading: boolean;
  /** Accuracy of latitude and longitude coordinates in meters */
  accuracy: number | null;
  /** Altitude in meters above the WGS84 ellipsoid, or `null` */
  altitude: number | null;
  /** Accuracy of the altitude value in meters, or `null` */
  altitudeAccuracy: number | null;
  /** Direction of travel in degrees (`0`–`360`), or `null` */
  heading: number | null;
  /** Latitude in decimal degrees, or `null` */
  latitude: number | null;
  /** Longitude in decimal degrees, or `null` */
  longitude: number | null;
  /** Velocity in meters per second, or `null` */
  speed: number | null;
  /** Timestamp when the position was acquired, or `null` */
  timestamp: number | null;
  /** Latest `GeolocationPositionError`, or `null` */
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

/**
 * Watches the user's geographic location reactively using `navigator.geolocation.watchPosition`.
 *
 * @category Sensors
 * @param options - Geolocation `PositionOptions` (`enableHighAccuracy`, `maximumAge`, `timeout`) and `enabled` flag
 * @returns Reactive geolocation coordinates, loading flag, support status, and error state
 *
 * @example
 * ```tsx
 * const { latitude, longitude, loading, error } = useGeolocation({
 *   enableHighAccuracy: true,
 * });
 * ```
 */
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

  const watchKey = `${isSupported}:${enabled}:${enableHighAccuracy}:${maximumAge}:${timeout}`;
  const [prevWatchKey, setPrevWatchKey] = useState(watchKey);
  if (prevWatchKey !== watchKey) {
    setPrevWatchKey(watchKey);
    if (!isSupported || !enabled) {
      if (state.loading) {
        setState((prev) => ({ ...prev, loading: false }));
      }
    } else {
      setState((prev) => ({ ...prev, loading: true, error: null }));
    }
  }

  useEffect(() => {
    if (!isSupported || !enabled) {
      return;
    }

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
