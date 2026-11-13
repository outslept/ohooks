import { useCallback, useEffect, useRef, useState } from 'react';
import {
  EventListenerTarget,
} from './useEventListener';
import { useLatest } from './useLatest';
import { resolveTargetElement } from '@/lib/utils';

export interface UseInfiniteScrollOptions {
  /** Scrollable root container element or ref (default: browser viewport) */
  root?: EventListenerTarget<HTMLElement>;
  /** Margin around the root element used to trigger loading early (default: `'0px 0px 200px 0px'`) */
  rootMargin?: string;
  /** Intersection ratio threshold(s) to trigger `onLoadMore` (default: `0`) */
  threshold?: number | number[];
  /** Whether more items are available to load (default: `true`) */
  hasMore?: boolean;
  /** Whether the intersection observer is active (default: `true`) */
  enabled?: boolean;
}

export interface UseInfiniteScrollReturn {
  /** Whether `onLoadMore` is currently executing */
  isLoading: boolean;
  /** Manually triggers `onLoadMore` if not already loading and `hasMore` is `true` */
  loadMore: () => Promise<void>;
}

/**
 * Triggers an asynchronous `onLoadMore` callback when a sentinel element scrolls into view using `IntersectionObserver`.
 *
 * @category DOM
 * @param sentinelTarget - Sentinel DOM element or React ref placed at the end of the list
 * @param onLoadMore - Callback invoked to fetch or append the next page of items
 * @param options - Intersection observer options, `hasMore` flag, and `enabled` state
 * @returns `isLoading` state and manual `loadMore` trigger function
 *
 * @example
 * ```tsx
 * const { isLoading } = useInfiniteScroll(sentinelRef, fetchNextPage, {
 *   hasMore: hasNextPage,
 * });
 * ```
 */
export function useInfiniteScroll(
  sentinelTarget: EventListenerTarget<HTMLElement>,
  onLoadMore: () => void | Promise<void>,
  options: UseInfiniteScrollOptions = {}
): UseInfiniteScrollReturn {
  const {
    root,
    rootMargin = '0px 0px 200px 0px',
    threshold = 0,
    hasMore = true,
    enabled = true,
  } = options;

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const isLoadingRef: { current: boolean } = useRef(false);
  const isMountedRef: { current: boolean } = useRef(true);
  const onLoadMoreRef = useLatest(onLoadMore);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadMore = useCallback(async (): Promise<void> => {
    if (isLoadingRef.current || !hasMore || !enabled) {
      return;
    }

    isLoadingRef.current = true;
    setIsLoading(true);

    try {
      await onLoadMoreRef.current();
    } finally {
      isLoadingRef.current = false;
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [hasMore, enabled, onLoadMoreRef]);

  const thresholdKey = Array.isArray(threshold)
    ? threshold.join(',')
    : String(threshold);

  useEffect(() => {
    if (
      !enabled ||
      !hasMore ||
      typeof window === 'undefined' ||
      typeof IntersectionObserver === 'undefined'
    ) {
      return;
    }

    const sentinel = resolveTargetElement(sentinelTarget);
    if (!sentinel) {
      return;
    }

    const rootElement = resolveTargetElement(root);

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting && !isLoadingRef.current) {
          void loadMore();
        }
      },
      {
        root: rootElement,
        rootMargin,
        threshold,
      }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [
    sentinelTarget,
    root,
    rootMargin,
    thresholdKey,
    hasMore,
    enabled,
    loadMore,
  ]);

  return {
    isLoading,
    loadMore,
  };
}

export default useInfiniteScroll;
