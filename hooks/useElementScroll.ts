import { useEffect, useRef, useState } from 'react';
import { useEventCallback } from './useEventCallback';
import {
  type EventListenerTarget,
  resolveTargetElement,
  useEventListener,
} from './useEventListener';
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';
import { useThrottleCallback } from './useThrottleCallback';
import { useUnmount } from './useUnmount';

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
  top?: number | undefined;
  bottom?: number | undefined;
  left?: number | undefined;
  right?: number | undefined;
}

export interface UseElementScrollOptions {
  throttleMs?: number | undefined;
  idleDelayMs?: number | undefined;
  offset?: ScrollOffset | undefined;
}

export interface UseElementScrollReturn {
  x: number;
  y: number;
  isScrolling: boolean;
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

export function useElementScroll<T extends HTMLElement = HTMLElement>(
  target: EventListenerTarget<T>,
  options: UseElementScrollOptions = {},
): UseElementScrollReturn {
  const { throttleMs = 0, idleDelayMs = 150, offset } = options;
  const topOffset = offset?.top ?? 0;
  const bottomOffset = offset?.bottom ?? 0;
  const leftOffset = offset?.left ?? 0;
  const rightOffset = offset?.right ?? 0;

  const [state, setState] = useState<{
    x: number;
    y: number;
    isScrolling: boolean;
    directions: ScrollDirections;
    arrived: ScrollArrivedState;
  }>({
    x: 0,
    y: 0,
    isScrolling: false,
    directions: INITIAL_DIRECTIONS,
    arrived: INITIAL_ARRIVED,
  });

  const prevScrollRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearIdleTimer = (): void => {
    if (idleTimerRef.current !== null) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
  };

  const measureScroll = useEventCallback((fromScrollEvent: boolean) => {
    const element = resolveTargetElement(target);
    if (!element) {
      return;
    }

    const x = element.scrollLeft;
    const y = element.scrollTop;
    const prevX = prevScrollRef.current.x;
    const prevY = prevScrollRef.current.y;

    const directions: ScrollDirections = fromScrollEvent
      ? {
          left: x < prevX,
          right: x > prevX,
          top: y < prevY,
          bottom: y > prevY,
        }
      : INITIAL_DIRECTIONS;

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

    if (fromScrollEvent) {
      clearIdleTimer();
      idleTimerRef.current = setTimeout(() => {
        setState((prev) =>
          prev.isScrolling
            ? { ...prev, isScrolling: false, directions: INITIAL_DIRECTIONS }
            : prev,
        );
      }, Math.max(0, idleDelayMs));
    }

    const nextIsScrolling = fromScrollEvent ? true : state.isScrolling;

    setState((prev) => {
      if (
        prev.x === x &&
        prev.y === y &&
        prev.isScrolling === nextIsScrolling &&
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
      return {
        x,
        y,
        isScrolling: nextIsScrolling,
        directions,
        arrived,
      };
    });
  });

  const onScrollUpdate = useEventCallback(() => {
    measureScroll(true);
  });

  const throttledUpdate = useThrottleCallback(onScrollUpdate, throttleMs);

  useEffect(() => {
    if (throttleMs <= 0) {
      throttledUpdate.cancel();
    }
  }, [throttleMs, throttledUpdate]);

  const handleScroll = (): void => {
    if (throttleMs > 0) {
      throttledUpdate();
    } else {
      onScrollUpdate();
    }
  };

  useEventListener('scroll', handleScroll, target, { passive: true });

  useIsomorphicLayoutEffect(() => {
    measureScroll(false);
  }, [target, topOffset, bottomOffset, leftOffset, rightOffset]);

  useUnmount(clearIdleTimer);

  const scrollTo = useEventCallback(
    (xOrOptions: number | ScrollToOptions, y?: number) => {
      const element = resolveTargetElement(target);
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
    isScrolling: state.isScrolling,
    directions: state.directions,
    arrived: state.arrived,
    scrollTo,
  };
}
