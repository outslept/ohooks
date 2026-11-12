import { useState } from 'react';
import { useEventCallback } from './useEventCallback';
import { useEventListener } from './useEventListener';
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';
import { useThrottleCallback } from './useThrottleCallback';

export interface WindowScrollPosition {
  x: number;
  y: number;
}

export interface UseWindowScrollOptions {
  initializeWithValue?: boolean;
  throttleMs?: number;
}

export interface UseWindowScrollReturn extends WindowScrollPosition {
  scrollTo: (
    xOrOptions: number | ScrollToOptions,
    y?: number,
  ) => void;
}

export function useWindowScroll(
  options: UseWindowScrollOptions = {},
): UseWindowScrollReturn {
  const { initializeWithValue = true, throttleMs = 0 } = options;

  const readPosition = (): WindowScrollPosition => {
    if (typeof window === 'undefined') {
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

  const updatePosition = useEventCallback(() => {
    setPosition((prev) => {
      const next = readPosition();
      if (prev.x === next.x && prev.y === next.y) {
        return prev;
      }
      return next;
    });
  });

  const throttledUpdatePosition = useThrottleCallback(
    updatePosition,
    throttleMs,
  );

  const handleScroll = (): void => {
    if (throttleMs > 0) {
      throttledUpdatePosition();
    } else {
      updatePosition();
    }
  };

  useEventListener('scroll', handleScroll, undefined, { passive: true });

  useIsomorphicLayoutEffect(() => {
    updatePosition();
  }, []);

  const scrollTo = useEventCallback(
    (xOrOptions: number | ScrollToOptions, y?: number) => {
      if (typeof window === 'undefined') {
        return;
      }

      if (typeof xOrOptions === 'number') {
        window.scrollTo(xOrOptions, y ?? position.y);
      } else {
        window.scrollTo(xOrOptions);
      }
    },
  );

  return {
    x: position.x,
    y: position.y,
    scrollTo,
  };
}
