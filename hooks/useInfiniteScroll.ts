import { useCallback, useEffect, useRef, useState } from 'react';
import {
  EventListenerTarget,
  resolveTargetElement,
} from './useEventListener';
import { useLatest } from './useLatest';

export interface UseInfiniteScrollOptions {
  root?: EventListenerTarget<HTMLElement>;
  rootMargin?: string;
  threshold?: number | number[];
  hasMore?: boolean;
  enabled?: boolean;
}

export interface UseInfiniteScrollReturn {
  isLoading: boolean;
  loadMore: () => Promise<void>;
}

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
