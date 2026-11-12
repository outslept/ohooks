import { useEffect, useRef, useState } from 'react';
import { type EventListenerTarget } from './useEventListener';
import { useLatest } from './useLatest';

export interface UseInfiniteScrollOptions {
  hasMore: boolean;
  isLoading?: boolean;
  disabled?: boolean;
  error?: boolean;
  root?: EventListenerTarget<Element> | Document | null;
  rootMargin?: string;
  threshold?: number;
}

function resolveElement<T extends Element>(
  target: EventListenerTarget<T> | Document | null | undefined,
): T | Document | null {
  if (!target) {
    return null;
  }
  if (typeof target === 'object' && 'current' in target) {
    return target.current;
  }
  return target;
}

function isSentinelInViewport(
  sentinel: Element,
  root: Element | Document | null,
): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const rect = sentinel.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0 && !sentinel.isConnected) {
    return false;
  }

  if (!root || root instanceof Document) {
    return (
      rect.top <= window.innerHeight &&
      rect.bottom >= 0 &&
      rect.left <= window.innerWidth &&
      rect.right >= 0
    );
  }

  const rootRect = root.getBoundingClientRect();
  return (
    rect.top <= rootRect.bottom &&
    rect.bottom >= rootRect.top &&
    rect.left <= rootRect.right &&
    rect.right >= rootRect.left
  );
}

export function useInfiniteScroll<T extends Element = HTMLElement>(
  target: EventListenerTarget<T>,
  onLoadMore: () => void | Promise<void>,
  options: UseInfiniteScrollOptions,
): void {
  const {
    hasMore,
    isLoading = false,
    disabled = false,
    error = false,
    root = null,
    rootMargin = '0px',
    threshold = 0,
  } = options;

  const [isIntersecting, setIsIntersecting] = useState(false);
  const [internalPending, setInternalPending] = useState(false);
  const internalErrorRef = useRef(false);
  const onLoadMoreRef = useLatest(onLoadMore);

  useEffect(() => {
    if (!error) {
      internalErrorRef.current = false;
    }
  }, [error]);

  useEffect(() => {
    const sentinel = resolveElement(target) as T | null;
    const rootNode = resolveElement(root);

    if (
      disabled ||
      !hasMore ||
      !sentinel ||
      typeof window === 'undefined' ||
      typeof window.IntersectionObserver !== 'function'
    ) {
      setIsIntersecting(false);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[entries.length - 1];
        if (!entry) {
          return;
        }
        if (entry.isIntersecting) {
          internalErrorRef.current = false;
        }
        setIsIntersecting(entry.isIntersecting);
      },
      {
        root: rootNode,
        rootMargin,
        threshold,
      },
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [target, root, rootMargin, threshold, hasMore, disabled]);

  const busy = isLoading || internalPending;

  useEffect(() => {
    if (
      !isIntersecting ||
      !hasMore ||
      disabled ||
      busy ||
      error ||
      internalErrorRef.current
    ) {
      return;
    }

    const sentinel = resolveElement(target) as T | null;
    const rootNode = resolveElement(root);

    if (!sentinel || !isSentinelInViewport(sentinel, rootNode)) {
      return;
    }

    let isCancelled = false;
    setInternalPending(true);

    Promise.resolve(onLoadMoreRef.current())
      .catch(() => {
        internalErrorRef.current = true;
      })
      .finally(() => {
        if (!isCancelled) {
          setInternalPending(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [
    isIntersecting,
    hasMore,
    disabled,
    busy,
    error,
    target,
    root,
    onLoadMoreRef,
  ]);
}
