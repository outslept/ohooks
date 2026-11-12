import { useState } from 'react';
import { useEventCallback } from './useEventCallback';
import { useEventListener } from './useEventListener';
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';
import { useThrottleCallback } from './useThrottleCallback';

export interface WindowSize {
  width: number;
  height: number;
}

export interface UseWindowSizeOptions {
  initialWidth?: number;
  initialHeight?: number;
  initializeWithValue?: boolean;
  throttleMs?: number;
}

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
