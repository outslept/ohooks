import { useRef, useState } from 'react';
import { useEventCallback } from './useEventCallback';
import {
  type EventListenerTarget,
  useEventListener,
} from './useEventListener';
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';
import { useThrottleCallback } from './useThrottleCallback';

export interface ScrollDirections {
  left: boolean;
  right: boolean;
  top: boolean;
  bottom: boolean;
}

export interface ScrollArrivedState {
  top: boolean;
  bottom: boolean;
  left: boolean;
  right: boolean;
}

export interface ScrollOffset {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
}

export interface UseElementScrollOptions {
  throttleMs?: number;
  offset?: ScrollOffset;
}

export interface UseElementScrollReturn {
  x: number;
  y: number;
  directions: ScrollDirections;
  arrived: ScrollArrivedState;
  scrollTo: (xOrOptions: number | ScrollToOptions, y?: number) => void;
}

const INITIAL_DIRECTIONS: ScrollDirections = {
  left: false,
  right: false,
  top: false,
  bottom: false,
};

const INITIAL_ARRIVED: ScrollArrivedState = {
  top: true,
  bottom: false,
  left: true,
  right: false,
};

function resolveElement<T extends HTMLElement>(
  target: EventListenerTarget<T>,
): T | null {
  if (!target) {
    return null;
  }
  if (typeof target === 'object' && 'current' in target) {
    return target.current;
  }
  return target;
}

export function useElementScroll<T extends HTMLElement = HTMLElement>(
  target: EventListenerTarget<T>,
  options: UseElementScrollOptions = {},
): UseElementScrollReturn {
  const { throttleMs = 0, offset } = options;
  const topOffset = offset?.top ?? 0;
  const bottomOffset = offset?.bottom ?? 0;
  const leftOffset = offset?.left ?? 0;
  const rightOffset = offset?.right ?? 0;

  const [state, setState] = useState<{
    x: number;
    y: number;
    directions: ScrollDirections;
    arrived: ScrollArrivedState;
  }>({
    x: 0,
    y: 0,
    directions: INITIAL_DIRECTIONS,
    arrived: INITIAL_ARRIVED,
  });

  const prevScrollRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const updateScroll = useEventCallback(() => {
    const element = resolveElement(target);
    if (!element) {
      return;
    }

    const x = element.scrollLeft;
    const y = element.scrollTop;
    const prevX = prevScrollRef.current.x;
    const prevY = prevScrollRef.current.y;

    const directions: ScrollDirections = {
      left: x < prevX,
      right: x > prevX,
      top: y < prevY,
      bottom: y > prevY,
    };

    const arrived: ScrollArrivedState = {
      top: y <= topOffset,
      bottom:
        y + element.clientHeight >=
        element.scrollHeight - bottomOffset - 1,
      left: x <= leftOffset,
      right:
        x + element.clientWidth >=
        element.scrollWidth - rightOffset - 1,
    };

    prevScrollRef.current = { x, y };

    setState((prev) => {
      if (
        prev.x === x &&
        prev.y === y &&
        prev.arrived.top === arrived.top &&
        prev.arrived.bottom === arrived.bottom &&
        prev.arrived.left === arrived.left &&
        prev.arrived.right === arrived.right &&
        prev.directions.top === directions.top &&
        prev.directions.bottom === directions.bottom &&
        prev.directions.left === directions.left &&
        prev.directions.right === directions.right
      ) {
        return prev;
      }
      return { x, y, directions, arrived };
    });
  });

  const throttledUpdate = useThrottleCallback(updateScroll, throttleMs);

  const handleScroll = (): void => {
    if (throttleMs > 0) {
      throttledUpdate();
    } else {
      updateScroll();
    }
  };

  useEventListener('scroll', handleScroll, target, { passive: true });

  useIsomorphicLayoutEffect(() => {
    updateScroll();
  }, [target, topOffset, bottomOffset, leftOffset, rightOffset]);

  const scrollTo = useEventCallback(
    (xOrOptions: number | ScrollToOptions, y?: number) => {
      const element = resolveElement(target);
      if (!element) {
        return;
      }

      if (typeof xOrOptions === 'number') {
        element.scrollTo(xOrOptions, y ?? element.scrollTop);
      } else {
        element.scrollTo(xOrOptions);
      }
    },
  );

  return {
    x: state.x,
    y: state.y,
    directions: state.directions,
    arrived: state.arrived,
    scrollTo,
  };
}
