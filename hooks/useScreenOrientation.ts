import { useCallback, useRef, useSyncExternalStore } from "react";

/** Reactive snapshot of the screen's orientation. */
export interface ScreenOrientationState {
  /** Current orientation type (e.g. `'portrait-primary'`, `'landscape-primary'`). */
  type: OrientationType;
  /** Current orientation angle in degrees (`0`, `90`, `180`, or `270`). */
  angle: number;
  /** Whether the `screen.orientation` API is natively supported. */
  isSupported: boolean;
}

/** Return value of `useScreenOrientation`. */
export interface UseScreenOrientationReturn extends ScreenOrientationState {
  /** Locks the screen orientation to the specified type (if supported by the browser). */
  lock: (orientation: string) => Promise<void>;
  /** Unlocks the screen orientation. */
  unlock: () => void;
}

const SERVER_SNAPSHOT: ScreenOrientationState = Object.freeze({
  type: "portrait-primary",
  angle: 0,
  isSupported: false,
});

function getServerSnapshot(): ScreenOrientationState {
  return SERVER_SNAPSHOT;
}

function readOrientationState(): ScreenOrientationState {
  if (typeof window === "undefined" || typeof screen === "undefined") {
    return SERVER_SNAPSHOT;
  }

  const orientation = screen.orientation;
  if (orientation) {
    return {
      type: orientation.type,
      angle: orientation.angle,
      isSupported: true,
    };
  }

  const isLandscape =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(orientation: landscape)").matches;

  return {
    type: isLandscape ? "landscape-primary" : "portrait-primary",
    angle: isLandscape ? 90 : 0,
    isSupported: false,
  };
}

function subscribe(onStoreChange: () => void): () => void {
  if (typeof window === "undefined" || typeof screen === "undefined") {
    return () => {};
  }

  const orientation = screen.orientation;
  if (orientation && typeof orientation.addEventListener === "function") {
    orientation.addEventListener("change", onStoreChange);
    return () => {
      orientation.removeEventListener("change", onStoreChange);
    };
  }

  window.addEventListener("orientationchange", onStoreChange);
  window.addEventListener("resize", onStoreChange);

  return () => {
    window.removeEventListener("orientationchange", onStoreChange);
    window.removeEventListener("resize", onStoreChange);
  };
}

/**
 * Tracks the device screen orientation and provides `lock` and `unlock` controls.
 *
 * @category Sensors
 * @returns Current orientation `type`, `angle`, support flag, and lock/unlock methods
 *
 * @example
 * ```tsx
 * const { type, angle, lock, unlock } = useScreenOrientation();
 * ```
 */
export function useScreenOrientation(): UseScreenOrientationReturn {
  const cacheRef: { current: ScreenOrientationState } = useRef(SERVER_SNAPSHOT);

  const getSnapshot = useCallback((): ScreenOrientationState => {
    const next = readOrientationState();
    const prev = cacheRef.current;
    if (
      prev.type === next.type &&
      prev.angle === next.angle &&
      prev.isSupported === next.isSupported
    ) {
      return prev;
    }
    cacheRef.current = next;
    return next;
  }, []);

  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const lock = useCallback(async (orientation: string): Promise<void> => {
    if (
      typeof screen === "undefined" ||
      !screen.orientation ||
      typeof (
        screen.orientation as ScreenOrientation & {
          lock?: (o: string) => Promise<void>;
        }
      ).lock !== "function"
    ) {
      throw new Error("Screen Orientation lock API is not supported.");
    }
    await (
      screen.orientation as ScreenOrientation & {
        lock: (o: string) => Promise<void>;
      }
    ).lock(orientation);
  }, []);

  const unlock = useCallback((): void => {
    if (
      typeof screen !== "undefined" &&
      screen.orientation &&
      typeof screen.orientation.unlock === "function"
    ) {
      screen.orientation.unlock();
    }
  }, []);

  return {
    ...state,
    lock,
    unlock,
  };
}

export default useScreenOrientation;
