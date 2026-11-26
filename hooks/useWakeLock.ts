import { useEffect, useState } from "react";
import { useLatest } from "./useLatest";

/** Configuration options for `useWakeLock`. */
export interface UseWakeLockOptions {
  /** Automatically re-acquire the screen wake lock when the document becomes visible again (default: `true`). */
  reacquireOnVisible?: boolean;
  /** Callback fired if requesting the wake lock fails. */
  onError?: (error: Error) => void;
}

/** State returned by `useWakeLock`. */
export interface UseWakeLockReturn {
  /** Whether the Screen Wake Lock API (`navigator.wakeLock`) is supported. */
  isSupported: boolean;
  /** Whether a screen wake lock is currently active. */
  isLocked: boolean;
  /** Most recent error thrown while requesting the wake lock, or `null`. */
  error: Error | null;
}

interface WakeLockSentinelLike extends EventTarget {
  readonly released: boolean;
  readonly type: "screen";
  release: () => Promise<void>;
}

type NavigatorWithWakeLock = Omit<Navigator, "wakeLock"> & {
  readonly wakeLock?:
    | {
        request: (type: "screen") => Promise<WakeLockSentinelLike>;
      }
    | undefined;
};

function isWakeLockSupported(): boolean {
  return (
    typeof navigator !== "undefined" &&
    "wakeLock" in navigator &&
    Boolean((navigator as NavigatorWithWakeLock).wakeLock)
  );
}

/**
 * Prevents the device screen from dimming or locking using the Screen Wake Lock API.
 *
 * @category Browser
 * @param enabled - Whether the wake lock should be held (default: `true`)
 * @param options - Visibility re-acquisition and error handler options
 * @returns `{ isSupported, isLocked, error }`
 *
 * @example
 * ```tsx
 * const { isLocked, isSupported } = useWakeLock(isPlayingVideo);
 * ```
 */
export function useWakeLock(enabled = true, options: UseWakeLockOptions = {}): UseWakeLockReturn {
  const { reacquireOnVisible = true, onError } = options;

  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [prevEnabled, setPrevEnabled] = useState<boolean>(enabled);
  const onErrorRef = useLatest(onError);

  if (prevEnabled !== enabled) {
    setPrevEnabled(enabled);
    if (!enabled && isLocked) {
      setIsLocked(false);
    }
  }

  useEffect(() => {
    if (!enabled || !isWakeLockSupported() || typeof document === "undefined") {
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
      if (isCancelled || sentinel !== null || document.visibilityState !== "visible") {
        return;
      }

      const wakeLockApi = (navigator as NavigatorWithWakeLock).wakeLock;
      if (!wakeLockApi) {
        return;
      }

      try {
        const acquired = await wakeLockApi.request("screen");
        if (isCancelled) {
          await acquired.release();
          return;
        }
        sentinel = acquired;
        sentinel.addEventListener("release", handleRelease);
        setError(null);
        setIsLocked(!acquired.released);
      } catch (err) {
        if (!isCancelled) {
          const normalized = err instanceof Error ? err : new Error(String(err));
          setError(normalized);
          setIsLocked(false);
          onErrorRef.current?.(normalized);
        }
      }
    };

    void acquire();

    const handleVisibilityChange = (): void => {
      if (reacquireOnVisible && document.visibilityState === "visible" && sentinel === null) {
        void acquire();
      }
    };

    if (reacquireOnVisible) {
      document.addEventListener("visibilitychange", handleVisibilityChange);
    }

    return () => {
      isCancelled = true;
      if (reacquireOnVisible) {
        document.removeEventListener("visibilitychange", handleVisibilityChange);
      }
      if (sentinel) {
        sentinel.removeEventListener("release", handleRelease);
        void sentinel.release().catch(() => {});
        sentinel = null;
      }
    };
  }, [enabled, reacquireOnVisible, onErrorRef]);

  return {
    isSupported: isWakeLockSupported(),
    isLocked: enabled ? isLocked : false,
    error,
  };
}

export default useWakeLock;
