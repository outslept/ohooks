import { useEffect, useRef, useState } from 'react';
import { useEventCallback } from './useEventCallback';
import {
  type EventListenerTarget,
  useEventListener,
} from './useEventListener';
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';
import { useThrottleCallback } from './useThrottleCallback';
import { useUnmount } from './useUnmount';
import { resolveTargetElement } from '@/lib/utils';

export interface ScrollDirections {
  /** Whether the element is currently scrolling left */
  left: boolean;
  /** Whether the element is currently scrolling right */
  right: boolean;
  /** Whether the element is currently scrolling up */
  top: boolean;
  /** Whether the element is currently scrolling down */
  bottom: boolean;
}

export interface ScrollArrivedState {
  /** Whether the scroll position has reached the top edge */
  top: boolean;
  /** Whether the scroll position has reached the bottom edge */
  bottom: boolean;
  /** Whether the scroll position has reached the left edge */
  left: boolean;
  /** Whether the scroll position has reached the right edge */
  right: boolean;
}

export interface ScrollOffset {
  /** Threshold in pixels from the top edge to consider `arrived.top` as `true` (default: `0`) */
  top?: number | undefined;
  /** Threshold in pixels from the bottom edge to consider `arrived.bottom` as `true` (default: `0`) */
  bottom?: number | undefined;
  /** Threshold in pixels from the left edge to consider `arrived.left` as `true` (default: `0`) */
  left?: number | undefined;
  /** Threshold in pixels from the right edge to consider `arrived.right` as `true` (default: `0`) */
  right?: number | undefined;
}

export interface UseElementScrollOptions {
  /** Throttle interval in milliseconds for scroll updates (default: `0`) */
  throttleMs?: number | undefined;
  /** Delay in milliseconds after the last scroll event before `isScrolling` resets to `false` (default: `150`) */
  idleDelayMs?: number | undefined;
  /** Edge arrival offset thresholds in pixels */
  offset?: ScrollOffset | undefined;
}

export interface UseElementScrollReturn {
  /** Current horizontal scroll offset (`scrollLeft`) */
  x: number;
  /** Current vertical scroll offset (`scrollTop`) */
  y: number;
  /** Whether the element is actively scrolling */
  isScrolling: boolean;
  /** Active scroll movement directions */
  directions: ScrollDirections;
  /** Flags indicating whether the scroll position has reached any edge */
  arrived: ScrollArrivedState;
  /** Programmatically scrolls the target element to given coordinates or `ScrollToOptions` */
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

/**
 * Tracks a scrollable element's scroll position, active scrolling state, movement directions, and edge arrival flags.
 *
 * @category DOM
 * @param target - Target scrollable DOM element or React ref
 * @param options - Configuration for throttling, idle delay, and edge arrival offsets
 * @returns Scroll coordinates (`x`, `y`), `isScrolling`, `directions`, `arrived` flags, and `scrollTo` helper
 *
 * @example
 * ```tsx
 * const { y, isScrolling, arrived, scrollTo } = useElementScroll(containerRef);
 * ```
 */
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

    if (fromScrollEvent && x === prevX && y === prevY && state.isScrolling) {
      return;
    }

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
