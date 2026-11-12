// hooks/useIntersectionObserver.ts
import { useEffect, useState } from 'react';
import {
  EventListenerTarget,
  resolveTargetElement,
} from './useEventListener';
import { useLatest } from './useLatest';

export interface UseIntersectionObserverOptions {
  root?: EventListenerTarget<Element | Document>;
  rootMargin?: string;
  threshold?: number | number[];
  freezeOnceVisible?: boolean;
  enabled?: boolean;
  onChange?: (entry: IntersectionObserverEntry) => void;
}

export function useIntersectionObserver(
  target: EventListenerTarget<Element>,
  options: UseIntersectionObserverOptions = {}
): IntersectionObserverEntry | null {
  const {
    root = null,
    rootMargin = '0px',
    threshold = 0,
    freezeOnceVisible = false,
    enabled = true,
    onChange,
  } = options;

  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const onChangeRef = useLatest(onChange);

  const frozen = Boolean(entry?.isIntersecting && freezeOnceVisible);
  const thresholdKey = Array.isArray(threshold)
    ? threshold.join(',')
    : String(threshold);

  useEffect(() => {
    if (
      !enabled ||
      frozen ||
      typeof window === 'undefined' ||
      typeof IntersectionObserver === 'undefined'
    ) {
      return;
    }

    const element = resolveTargetElement(target);
    if (!element) {
      return;
    }

    const rootNode = resolveTargetElement(root);

    const observer = new IntersectionObserver(
      (entries) => {
        const latestEntry = entries[entries.length - 1];
        if (latestEntry) {
          setEntry(latestEntry);
          onChangeRef.current?.(latestEntry);
        }
      },
      {
        root: rootNode,
        rootMargin,
        threshold,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [
    target,
    root,
    rootMargin,
    thresholdKey,
    frozen,
    enabled,
    onChangeRef,
  ]);

  return entry;
}

export default useIntersectionObserver;
