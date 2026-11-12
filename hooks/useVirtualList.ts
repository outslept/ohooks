import { CSSProperties, useCallback, useEffect, useMemo, useState } from 'react';
import {
  EventListenerTarget,
  resolveTargetElement,
} from './useEventListener';
import { useLatest } from './useLatest';

export interface VirtualItem<T> {
  index: number;
  data: T;
  offsetTop: number;
  height: number;
}

export interface UseVirtualListOptions {
  containerTarget: EventListenerTarget<HTMLElement>;
  itemHeight: number | ((index: number) => number);
  overscan?: number;
}

export interface UseVirtualListReturn<T> {
  virtualItems: VirtualItem<T>[];
  totalHeight: number;
  wrapperProps: {
    style: CSSProperties;
  };
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

    const syncMetrics = () => {
      setScrollTop(container.scrollTop);
      setViewportHeight(container.clientHeight);
    };

    syncMetrics();

    const handleScroll = () => {
      setScrollTop(container.scrollTop);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        setViewportHeight(container.clientHeight);
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

    const result: VirtualItem<T>[] = [];
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
