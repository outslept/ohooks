import { CSSProperties, useCallback, useEffect, useMemo, useState } from 'react';
import {
  EventListenerTarget,
} from './useEventListener';
import { useLatest } from './useLatest';
import { resolveTargetElement } from '@/lib/utils';

/** Metadata for a single visible item in a virtualized list. */
export interface VirtualItem<T> {
  /** Index of the item in the source `items` array. */
  index: number;
  /** The item data at `index`. */
  data: T;
  /** Top offset in pixels from the start of the scrollable content. */
  offsetTop: number;
  /** Computed height of the item in pixels. */
  height: number;
}

/** Configuration options for `useVirtualList`. */
export interface UseVirtualListOptions {
  /** Ref, element, or getter for the scrollable container element. */
  containerTarget: EventListenerTarget<HTMLElement>;
  /** Fixed pixel height or function returning the pixel height for each item index. */
  itemHeight: number | ((index: number) => number);
  /** Number of extra items to render above and below the visible viewport (default: `5`). */
  overscan?: number;
}

/** Virtualized items, layout props, and scroll controls returned by `useVirtualList`. */
export interface UseVirtualListReturn<T> {
  /** Slice of items currently within the visible viewport plus overscan. */
  virtualItems: VirtualItem<T>[];
  /** Total pixel height of all items combined. */
  totalHeight: number;
  /** Style props to spread onto the inner positioning wrapper element. */
  wrapperProps: {
    style: CSSProperties;
  };
  /** Scrolls the container to bring the item at `index` into view. */
  scrollToIndex: (index: number, behavior?: ScrollBehavior) => void;
}

function findStartIndex(offsets: readonly number[], scrollTop: number): number {
  let low = 0;
  let high = offsets.length - 1;

  while (low <= high) {
    const mid = (low + high) >>> 1;
    const midOffset = offsets[mid] ?? 0;
    if (midOffset === scrollTop) {
      return mid;
    }
    if (midOffset < scrollTop) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return Math.max(0, low - 1);
}

/**
 * Virtualizes a large list of fixed or variable-height items so only visible rows are rendered.
 *
 * @category DOM
 * @param items - Full array of list items
 * @param options - Scroll container target, item height (number or function), and overscan count
 * @returns Visible `virtualItems`, `totalHeight`, `wrapperProps`, and `scrollToIndex`
 *
 * @example
 * ```tsx
 * const containerRef = useRef<HTMLDivElement>(null);
 * const { virtualItems, wrapperProps } = useVirtualList(rows, {
 *   containerTarget: containerRef,
 *   itemHeight: 40,
 * });
 * ```
 */
export function useVirtualList<T>(
  items: readonly T[],
  options: UseVirtualListOptions
): UseVirtualListReturn<T> {
  const { containerTarget, itemHeight, overscan = 5 } = options;

  const [scrollTop, setScrollTop] = useState<number>(0);
  const [viewportHeight, setViewportHeight] = useState<number>(0);
  const itemHeightRef = useLatest(itemHeight);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const container = resolveTargetElement(containerTarget);
    if (!container) {
      return;
    }

    let lastScrollTop = container.scrollTop;
    let lastViewportHeight = container.clientHeight;

    setScrollTop(lastScrollTop);
    setViewportHeight(lastViewportHeight);

    const syncMetrics = () => {
      const nextScrollTop = container.scrollTop;
      const nextViewportHeight = container.clientHeight;

      if (nextScrollTop !== lastScrollTop) {
        lastScrollTop = nextScrollTop;
        setScrollTop(nextScrollTop);
      }
      if (nextViewportHeight !== lastViewportHeight) {
        lastViewportHeight = nextViewportHeight;
        setViewportHeight(nextViewportHeight);
      }
    };

    const handleScroll = () => {
      const nextScrollTop = container.scrollTop;
      if (nextScrollTop !== lastScrollTop) {
        lastScrollTop = nextScrollTop;
        setScrollTop(nextScrollTop);
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        const nextViewportHeight = container.clientHeight;
        if (nextViewportHeight !== lastViewportHeight) {
          lastViewportHeight = nextViewportHeight;
          setViewportHeight(nextViewportHeight);
        }
      });
      resizeObserver.observe(container);
    } else {
      window.addEventListener('resize', syncMetrics);
    }

    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (resizeObserver) {
        resizeObserver.disconnect();
      } else {
        window.removeEventListener('resize', syncMetrics);
      }
    };
  }, [containerTarget]);

  const { offsets, heights, totalHeight } = useMemo(() => {
    const count = items.length;
    const itemOffsets = new Array<number>(count);
    const itemHeights = new Array<number>(count);
    let runningTotal = 0;

    for (let i = 0; i < count; i += 1) {
      itemOffsets[i] = runningTotal;
      const h =
        typeof itemHeight === 'function'
          ? itemHeight(i)
          : itemHeight;
      const safeHeight = Math.max(0, h);
      itemHeights[i] = safeHeight;
      runningTotal += safeHeight;
    }

    return {
      offsets: itemOffsets,
      heights: itemHeights,
      totalHeight: runningTotal,
    };
  }, [items.length, itemHeight]);

  const virtualItems = useMemo<VirtualItem<T>[]>(() => {
    const count = items.length;
    if (count === 0) {
      return [];
    }

    const rawStartIndex = findStartIndex(offsets, scrollTop);
    const visibleEndScroll = scrollTop + Math.max(viewportHeight, 1);

    let rawEndIndex = rawStartIndex;
    while (
      rawEndIndex < count - 1 &&
      (offsets[rawEndIndex] ?? 0) < visibleEndScroll
    ) {
      rawEndIndex += 1;
    }

    const startIndex = Math.max(0, rawStartIndex - overscan);
    const endIndex = Math.min(count - 1, rawEndIndex + overscan);

    const result: VirtualItem<T> = [];
    for (let i = startIndex; i <= endIndex; i += 1) {
      result.push({
        index: i,
        data: items[i] as T,
        offsetTop: offsets[i] ?? 0,
        height: heights[i] ?? 0,
      });
    }

    return result;
  }, [items, offsets, heights, scrollTop, viewportHeight, overscan]);

  const scrollToIndex = useCallback(
    (index: number, behavior: ScrollBehavior = 'auto') => {
      const container = resolveTargetElement(containerTarget);
      if (!container || items.length === 0) {
        return;
      }

      const clampedIndex = Math.max(0, Math.min(index, items.length - 1));
      let targetTop = 0;
      const currentItemHeight = itemHeightRef.current;

      if (typeof currentItemHeight === 'number') {
        targetTop = clampedIndex * currentItemHeight;
      } else {
        for (let i = 0; i < clampedIndex; i += 1) {
          targetTop += Math.max(0, currentItemHeight(i));
        }
      }

      container.scrollTo({
        top: targetTop,
        behavior,
      });
    },
    [containerTarget, items.length, itemHeightRef]
  );

  const wrapperProps = useMemo(
    () => ({
      style: {
        position: 'relative' as const,
        width: '100%',
        height: `${totalHeight}px`,
      },
    }),
    [totalHeight]
  );

  return {
    virtualItems,
    totalHeight,
    wrapperProps,
    scrollToIndex,
  };
}

export default useVirtualList;
