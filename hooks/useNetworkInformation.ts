import { useCallback, useRef, useSyncExternalStore } from 'react';

export type EffectiveConnectionType = 'slow-2g' | '2g' | '3g' | '4g';

export type NetworkConnectionType =
  | 'bluetooth'
  | 'cellular'
  | 'ethernet'
  | 'mixed'
  | 'none'
  | 'other'
  | 'unknown'
  | 'wifi'
  | 'wimax';

interface NetworkInformationTarget extends EventTarget {
  readonly downlink?: number;
  readonly downlinkMax?: number;
  readonly effectiveType?: EffectiveConnectionType;
  readonly rtt?: number;
  readonly saveData?: boolean;
  readonly type?: NetworkConnectionType;
}

interface VendorNavigator extends Navigator {
  readonly connection?: NetworkInformationTarget;
  readonly mozConnection?: NetworkInformationTarget;
  readonly webkitConnection?: NetworkInformationTarget;
}

export interface NetworkInformationState {
  /** Whether the browser currently reports being online (`navigator.onLine`) */
  isOnline: boolean;
  /** Whether the Network Information API (`navigator.connection`) is supported */
  isSupported: boolean;
  /** Effective bandwidth estimate in megabits per second */
  downlink?: number;
  /** Maximum downlink speed in megabits per second for the underlying connection technology */
  downlinkMax?: number;
  /** Effective connection type (`'slow-2g'`, `'2g'`, `'3g'`, or `'4g'`) */
  effectiveType?: EffectiveConnectionType;
  /** Estimated effective round-trip time of the current connection in milliseconds */
  rtt?: number;
  /** Whether the user has requested a reduced data usage mode */
  saveData?: boolean;
  /** Type of connection a device is using to communicate with the network */
  type?: NetworkConnectionType;
}

const SERVER_SNAPSHOT: NetworkInformationState = {
  isOnline: true,
  isSupported: false,
};

function getConnection(): NetworkInformationTarget | null {
  if (typeof navigator === 'undefined') {
    return null;
  }
  const nav = navigator as VendorNavigator;
  return nav.connection ?? nav.mozConnection ?? nav.webkitConnection ?? null;
}

function isSameNetworkState(
  a: NetworkInformationState,
  b: NetworkInformationState,
): boolean {
  return (
    a.isOnline === b.isOnline &&
    a.isSupported === b.isSupported &&
    Object.is(a.downlink, b.downlink) &&
    Object.is(a.downlinkMax, b.downlinkMax) &&
    a.effectiveType === b.effectiveType &&
    Object.is(a.rtt, b.rtt) &&
    a.saveData === b.saveData &&
    a.type === b.type
  );
}

function subscribe(onStoreChange: () => void): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const connection = getConnection();

  window.addEventListener('online', onStoreChange);
  window.addEventListener('offline', onStoreChange);
  connection?.addEventListener('change', onStoreChange);

  return () => {
    window.removeEventListener('online', onStoreChange);
    window.removeEventListener('offline', onStoreChange);
    connection?.removeEventListener('change', onStoreChange);
  };
}

function getServerSnapshot(): NetworkInformationState {
  return SERVER_SNAPSHOT;
}

/**
 * Tracks network connectivity status and connection quality metrics (`effectiveType`, `downlink`, `rtt`, `saveData`) via the Network Information API.
 *
 * @category Sensors
 * @returns Reactive `NetworkInformationState` object
 *
 * @example
 * ```tsx
 * const { isOnline, effectiveType, saveData } = useNetworkInformation();
 * ```
 */
export function useNetworkInformation(): NetworkInformationState {
  const cacheRef = useRef<NetworkInformationState>(SERVER_SNAPSHOT);

  const getSnapshot = useCallback((): NetworkInformationState => {
    if (typeof navigator === 'undefined') {
      return SERVER_SNAPSHOT;
    }

    const isOnline =
      typeof navigator.onLine === 'boolean' ? navigator.onLine : true;
    const connection = getConnection();

    const nextState: NetworkInformationState = connection
      ? {
          isOnline,
          isSupported: true,
          downlink: connection.downlink,
          downlinkMax: connection.downlinkMax,
          effectiveType: connection.effectiveType,
          rtt: connection.rtt,
          saveData: connection.saveData,
          type: connection.type,
        }
      : {
          isOnline,
          isSupported: false,
        };

    if (isSameNetworkState(cacheRef.current, nextState)) {
      return cacheRef.current;
    }

    cacheRef.current = nextState;
    return nextState;
  }, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
