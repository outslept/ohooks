import { useEffect, useState } from 'react';
import { useLatest } from './useLatest';

export interface UseWakeLockOptions {
  reacquireOnVisible?: boolean;
  onError?: (error: Error) => void;
}

export interface UseWakeLockReturn {
  isSupported: boolean;
  isLocked: boolean;
  error: Error | null;
}

interface WakeLockSentinelLike extends EventTarget {
  readonly released: boolean;
  readonly type: 'screen';
  release: () => Promise<void>;
}

interface NavigatorWithWakeLock extends Navigator {
  readonly wakeLock?: {
    request: (type: 'screen') => Promise<WakeLockSentinelLike>;
  };
}

function isWakeLockSupported(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    'wakeLock' in navigator &&
    Boolean((navigator as NavigatorWithWakeLock).wakeLock)
  );
}

export function useWakeLock(
  enabled = true,
  options: UseWakeLockOptions = {},
): UseWakeLockReturn {
  const { reacquireOnVisible = true, onError } = options;

  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const onErrorRef = useLatest(onError);

  useEffect(() => {
    if (!enabled || !isWakeLockSupported() || typeof document === 'undefined') {
      setIsLocked(false);
      return;
    }

    let isCancelled = false;
    let sentinel: WakeLockSentinelLike | null = null;

    const handleRelease = (): void => {
      sentinel = null;
      if (!isCancelled) {
        setIsLocked(false);
      }
    };

    const acquire = async (): Promise<void> => {
      if (
        isCancelled ||
        sentinel !== null ||
        document.visibilityState !== 'visible'
      ) {
        return;
      }

      const wakeLockApi = (navigator as NavigatorWithWakeLock).wakeLock;
      if (!wakeLockApi) {
        return;
      }

      try {
        const acquired = await wakeLockApi.request('screen');
        if (isCancelled) {
          await acquired.release();
          return;
        }
        sentinel = acquired;
        sentinel.addEventListener('release', handleRelease);
        setError(null);
        setIsLocked(!acquired.released);
      } catch (err) {
        if (!isCancelled) {
          const normalized =
            err instanceof Error ? err : new Error(String(err));
          setError(normalized);
          setIsLocked(false);
          onErrorRef.current?.(normalized);
        }
      }
    };

    void acquire();

    const handleVisibilityChange = (): void => {
      if (
        reacquireOnVisible &&
        document.visibilityState === 'visible' &&
        sentinel === null
      ) {
        void acquire();
      }
    };

    if (reacquireOnVisible) {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    return () => {
      isCancelled = true;
      if (reacquireOnVisible) {
        document.removeEventListener(
          'visibilitychange',
          handleVisibilityChange,
        );
      }
      if (sentinel) {
        sentinel.removeEventListener('release', handleRelease);
        void sentinel.release().catch(() => {});
        sentinel = null;
      }
      setIsLocked(false);
    };
  }, [enabled, reacquireOnVisible, onErrorRef]);

  return {
    isSupported: isWakeLockSupported(),
    isLocked,
    error,
  };
}
