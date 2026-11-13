import { useState } from 'react';
import { useEventCallback } from './useEventCallback';
import { useEventListener } from './useEventListener';
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';
import { useThrottleCallback } from './useThrottleCallback';

/** Viewport inner width and height in pixels. */
export interface WindowSize {
  /** Viewport width (`window.innerWidth`). */
  width: number;
  /** Viewport height (`window.innerHeight`). */
  height: number;
}

/** Configuration options for `useWindowSize`. */
export interface UseWindowSizeOptions {
  /** Fallback width used during SSR or when `initializeWithValue` is `false` (default: `0`). */
  initialWidth?: number;
  /** Fallback height used during SSR or when `initializeWithValue` is `false` (default: `0`). */
  initialHeight?: number;
  /** Read `window.innerWidth`/`innerHeight` synchronously on initial client render (default: `true`). */
  initializeWithValue?: boolean;
  /** Optional throttle interval in milliseconds for resize updates (default: `0`). */
  throttleMs?: number;
}

/**
 * Tracks the browser window's `innerWidth` and `innerHeight` on resize.
 *
 * @category Sensors
 * @param options - Fallback dimensions, SSR initialization, and throttle options
 * @returns Current `{ width, height }` of the window
 *
 * @example
 * ```tsx
 * const { width, height } = useWindowSize({ throttleMs: 100 });
 * ```
 */
export function useWindowSize(
  options: UseWindowSizeOptions = {},
): WindowSize {
  const {
    initialWidth = 0,
    initialHeight = 0,
    initializeWithValue = true,
    throttleMs = 0,
  } = options;

  const readSize = (): WindowSize => {
    if (typeof window === 'undefined') {
      return { width: initialWidth, height: initialHeight };
    }
    return {
      width: window.innerWidth,
      height: window.innerHeight,
    };
  };

  const [windowSize, setWindowSize] = useState<WindowSize>(() =>
    initializeWithValue
      ? readSize()
      : { width: initialWidth, height: initialHeight },
  );

  const updateSize = useEventCallback(() => {
    setWindowSize((prev) => {
      const next = readSize();
      if (prev.width === next.width && prev.height === next.height) {
        return prev;
      }
      return next;
    });
  });

  const throttledUpdateSize = useThrottleCallback(updateSize, throttleMs);

  const handleResize = (): void => {
    if (throttleMs > 0) {
      throttledUpdateSize();
    } else {
      updateSize();
    }
  };

  useEventListener('resize', handleResize);

  useIsomorphicLayoutEffect(() => {
    updateSize();
  }, []);

  return windowSize;
}
