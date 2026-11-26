import { useRef, useState } from "react";
import { useEventCallback } from "./useEventCallback";
import { useEventListener } from "./useEventListener";
import { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect";
import { useThrottleCallback } from "./useThrottleCallback";

/** Window scroll coordinates in pixels. */
export interface WindowScrollPosition {
  /** Horizontal scroll offset (`window.scrollX`). */
  x: number;
  /** Vertical scroll offset (`window.scrollY`). */
  y: number;
}

/** Configuration options for `useWindowScroll`. */
export interface UseWindowScrollOptions {
  /** Read `window.scrollX`/`scrollY` synchronously on initial client render (default: `true`). */
  initializeWithValue?: boolean;
  /** Optional throttle interval in milliseconds for scroll updates (default: `0`). */
  throttleMs?: number;
}

/** Window scroll coordinates and programmatic `scrollTo` helper returned by `useWindowScroll`. */
export interface UseWindowScrollReturn extends WindowScrollPosition {
  /** Scrolls the window to the given coordinates or `ScrollToOptions`. */
  scrollTo: (xOrOptions: number | ScrollToOptions, y?: number) => void;
}

/**
 * Tracks the window scroll position (`x`, `y`) and provides a `scrollTo` helper.
 *
 * @category Sensors
 * @param options - SSR initialization and throttle options
 * @returns `{ x, y, scrollTo }`
 *
 * @example
 * ```tsx
 * const { y, scrollTo } = useWindowScroll({ throttleMs: 50 });
 * ```
 */
export function useWindowScroll(options: UseWindowScrollOptions = {}): UseWindowScrollReturn {
  const { initializeWithValue = true, throttleMs = 0 } = options;

  const readPosition = (): WindowScrollPosition => {
    if (typeof window === "undefined") {
      return { x: 0, y: 0 };
    }
    return {
      x: window.scrollX,
      y: window.scrollY,
    };
  };

  const [position, setPosition] = useState<WindowScrollPosition>(() =>
    initializeWithValue ? readPosition() : { x: 0, y: 0 },
  );
  const lastPositionRef = useRef<WindowScrollPosition>(position);

  const updatePosition = useEventCallback(() => {
    const next = readPosition();
    if (lastPositionRef.current.x === next.x && lastPositionRef.current.y === next.y) {
      return;
    }
    lastPositionRef.current = next;
    setPosition(next);
  });

  const throttledUpdatePosition = useThrottleCallback(updatePosition, throttleMs);

  const handleScroll = (): void => {
    if (throttleMs > 0) {
      throttledUpdatePosition();
    } else {
      updatePosition();
    }
  };

  useEventListener("scroll", handleScroll, undefined, { passive: true });

  useIsomorphicLayoutEffect(() => {
    updatePosition();
  }, []);

  const scrollTo = useEventCallback((xOrOptions: number | ScrollToOptions, y?: number) => {
    if (typeof window === "undefined") {
      return;
    }

    if (typeof xOrOptions === "number") {
      window.scrollTo(xOrOptions, y ?? position.y);
    } else {
      window.scrollTo(xOrOptions);
    }
  });

  return {
    x: position.x,
    y: position.y,
    scrollTo,
  };
}
