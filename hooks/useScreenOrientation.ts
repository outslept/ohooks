import { useSyncExternalStore } from 'react';
import { useEventCallback } from './useEventCallback';

export type ScreenOrientationLockType =
  | 'any'
  | 'natural'
  | 'landscape'
  | 'portrait'
  | 'portrait-primary'
  | 'portrait-secondary'
  | 'landscape-primary'
  | 'landscape-secondary';

export interface ScreenOrientationSnapshot {
  isSupported: boolean;
  type: OrientationType;
  angle: number;
}

export interface UseScreenOrientationReturn extends ScreenOrientationSnapshot {
  lock: (orientation: ScreenOrientationLockType) => Promise<void>;
  unlock: () => void;
}

interface ScreenOrientationWithLock extends ScreenOrientation {
  lock?: (orientation: ScreenOrientationLockType) => Promise<void>;
}

const SERVER_SNAPSHOT: ScreenOrientationSnapshot = {
  isSupported: false,
  type: 'landscape-primary',
  angle: 0,
};

let cachedSnapshot: ScreenOrientationSnapshot = SERVER_SNAPSHOT;

function subscribe(onStoreChange: () => void): () => void {
  if (typeof window === 'undefined' || !window.screen?.orientation) {
    return () => {};
  }

  const orientation = window.screen.orientation;
  orientation.addEventListener('change', onStoreChange);

  return () => {
    orientation.removeEventListener('change', onStoreChange);
  };
}

function getSnapshot(): ScreenOrientationSnapshot {
  if (typeof window === 'undefined' || !window.screen?.orientation) {
    return SERVER_SNAPSHOT;
  }

  const { type, angle } = window.screen.orientation;

  if (
    cachedSnapshot.isSupported &&
    cachedSnapshot.type === type &&
    cachedSnapshot.angle === angle
  ) {
    return cachedSnapshot;
  }

  cachedSnapshot = {
    isSupported: true,
    type,
    angle,
  };

  return cachedSnapshot;
}

function getServerSnapshot(): ScreenOrientationSnapshot {
  return SERVER_SNAPSHOT;
}

export function useScreenOrientation(): UseScreenOrientationReturn {
  const snapshot = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const lock = useEventCallback(
    async (orientation: ScreenOrientationLockType): Promise<void> => {
      if (typeof window === 'undefined' || !window.screen?.orientation) {
        return;
      }
      const screenOrientation = window.screen
        .orientation as ScreenOrientationWithLock;
      if (typeof screenOrientation.lock === 'function') {
        await screenOrientation.lock(orientation);
      }
    },
  );

  const unlock = useEventCallback((): void => {
    if (
      typeof window !== 'undefined' &&
      typeof window.screen?.orientation?.unlock === 'function'
    ) {
      window.screen.orientation.unlock();
    }
  });

  return {
    ...snapshot,
    lock,
    unlock,
  };
}
