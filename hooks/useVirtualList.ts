import { useMemo, useState } from 'react';
import { useElementSize } from './useElementSize';
import { useEventCallback } from './useEventCallback';
import {
  type EventListenerTarget,
  useEventListener,
} from './useEventListener';
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';

export interface VirtualItem<T> {
  index: number;
  data: T;
  offsetTop: number;
  height: number;
}

export interface ScrollToIndexOptions {
  align?: 'start' | 'center' | 'end' | 'auto';
  behavior?: ScrollBehavior;
}

export interface UseVirtualListOptions {
  containerTarget: EventListenerTarget<HTMLElement>;
  itemHeight: number | ((index: number) => number);
  overscan?: number;
  initialContainerHeight?: number;
}

export interface UseVirtualListReturn<T> {
  virtualItems: VirtualItem<T>[];
  totalHeight: number;
  offsetTop: number;
  startIndex: number;
  endIndex: number;
  scrollToIndex: (index: number, options?: ScrollToIndexOptions) => void;
}

function resolveElement(
  target: EventListenerTarget<HTMLElement>,
): HTMLElement | null {
  if (!target) {
    return null;
  }
  if (typeof target === 'object' && 'current' in target) {
    return target.current;
  }
  return target;
}

function findStartIndex(offsets: readonly number[], scrollTop: number): number {
  let low = 0;
  let high = offsets.length - 1;

  while (low <= high) {
    const mid = (low + high) >>> 1;
    const midOffset = offsets[mid] ?? 0;

    if (midOffset === scrollTop) {
      return mid;
    } else if (midOffset < scrollTop) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return Math.max(0, low - 1);
}

export function useVirtualList<T>(
  items: readonly T[],
  options: UseVirtualListOptions,
): UseVirtualListReturn<T> {
  const {
    containerTarget,
    itemHeight,
    overscan = 5,
    initialContainerHeight = 0,
  } = options;

  const [scrollTop, setScrollTop] = useState(0);

  const { height: measuredHeight } = useElementSize(containerTarget, {
    initialHeight: initialContainerHeight,
  });
  const containerHeight = measuredHeight || initialContainerHeight;

  useEventListener(
    'scroll',
    () => {
      const container = resolveElement(containerTarget);
      if (container) {
        setScrollTop(container.scrollTop);
      }
    },
    containerTarget,
    { passive: true },
  );

  useIsomorphicLayoutEffect(() => {
    const container = resolveElement(containerTarget);
    if (container) {
      setScrollTop(container.scrollTop);
    }
  }, [containerTarget]);

  const layout = useMemo(() => {
    const count = items.length;
    if (count === 0) {
      return {
        offsets: [] as number[],
        heights: [] as number[],
        totalHeight: 0,
      };
    }

    const offsets = new Array<number>(count);
    const heights = new Array<number>(count);
    let runningOffset = 0;

    for (let i = 0; i < count; i++) {
      const h =
        typeof itemHeight === 'function' ? itemHeight(i) : itemHeight;
      offsets[i] = runningOffset;
      heights[i] = h;
      runningOffset += h;
    }

    return {
      offsets,
      heights,
      totalHeight: runningOffset,
    };
  }, [items.length, itemHeight]);

  const { startIndex, endIndex, virtualItems, offsetTop } = useMemo(() => {
    const count = items.length;
    if (count === 0) {
      return {
        startIndex: 0,
        endIndex: -1,
        virtualItems: [] as VirtualItem<T>[],
        offsetTop: 0,
      };
    }

    const rawStart = findStartIndex(layout.offsets, scrollTop);
    const viewportBottom = scrollTop + containerHeight;

    let rawEnd = rawStart;
    while (
      rawEnd < count - 1 &&
      (layout.offsets[rawEnd] ?? 0) < viewportBottom
    ) {
      rawEnd += 1;
    }

    const start = Math.max(0, rawStart - overscan);
    const end = Math.min(count - 1, rawEnd + overscan);

    const sliced: VirtualItem<T>[] = [];
    for (let i = start; i <= end; i++) {
      sliced.push({
        index: i,
        data: items[i] as T,
        offsetTop: layout.offsets[i] ?? 0,
        height: layout.heights[i] ?? 0,
      });
    }

    return {
      startIndex: start,
      endIndex: end,
      virtualItems: sliced,
      offsetTop: layout.offsets[start] ?? 0,
    };
  }, [items, layout, scrollTop, containerHeight, overscan]);

  const scrollToIndex = useEventCallback(
    (index: number, scrollOptions: ScrollToIndexOptions = {}) => {
      const container = resolveElement(containerTarget);
      if (!container || items.length === 0) {
        return;
      }

      const { align = 'auto', behavior = 'auto' } = scrollOptions;
      const clampedIndex = Math.max(0, Math.min(items.length - 1, index));
      const itemTop = layout.offsets[clampedIndex] ?? 0;
      const itemSize = layout.heights[clampedIndex] ?? 0;
      const itemBottom = itemTop + itemSize;

      let nextScrollTop = container.scrollTop;

      if (align === 'start') {
        nextScrollTop = itemTop;
      } else if (align === 'end') {
        nextScrollTop = itemBottom - containerHeight;
      } else if (align === 'center') {
        nextScrollTop = itemTop - (containerHeight - itemSize) / 2;
      } else {
        if (itemTop < container.scrollTop) {
          nextScrollTop = itemTop;
        } else if (itemBottom > container.scrollTop + containerHeight) {
          nextScrollTop = itemBottom - containerHeight;
        }
      }

      container.scrollTo({
        top: Math.max(0, nextScrollTop),
        behavior,
      });
    },
  );

  return {
    virtualItems,
    totalHeight: layout.totalHeight,
    offsetTop,
    startIndex,
    endIndex,
    scrollToIndex,
  };
}
