import { useEffect, useState } from 'react';
import { type EventListenerTarget } from './useEventListener';
import { useLatest } from './useLatest';

export interface UseIntersectionObserverOptions
  extends IntersectionObserverInit {
  freezeOnceVisible?: boolean;
  initialIsIntersecting?: boolean;
  onChange?: (
    isIntersecting: boolean,
    entry: IntersectionObserverEntry,
  ) => void;
}

export interface UseIntersectionObserverReturn {
  isIntersecting: boolean;
  entry: IntersectionObserverEntry | null;
}

function resolveElement<T extends Element>(
  target: EventListenerTarget<T>,
): T | null {
  if (target === null || target === undefined) {
    return null;
  }
  if (typeof target === 'object' && 'current' in target) {
    return target.current;
  }
  return target;
}

export function useIntersectionObserver<T extends Element = Element>(
  target: EventListenerTarget<T>,
  options: UseIntersectionObserverOptions = {},
): UseIntersectionObserverReturn {
  const {
    threshold = 0,
    root = null,
    rootMargin = '0px',
    freezeOnceVisible = false,
    initialIsIntersecting = false,
    onChange,
  } = options;

  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const onChangeRef = useLatest(onChange);

  const isIntersecting = entry?.isIntersecting ?? initialIsIntersecting;
  const frozen = freezeOnceVisible && isIntersecting;
  const thresholdKey = Array.isArray(threshold)
    ? threshold.join(',')
    : String(threshold);

  useEffect(() => {
    const element = resolveElement(target);

    if (
      frozen ||
      !element ||
      typeof window === 'undefined' ||
      typeof window.IntersectionObserver !== 'function'
    ) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const latestEntry = entries[entries.length - 1];
        if (!latestEntry) {
          return;
        }

        setEntry(latestEntry);
        onChangeRef.current?.(latestEntry.isIntersecting, latestEntry);
      },
      { threshold, root, rootMargin },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [target, thresholdKey, root, rootMargin, frozen, onChangeRef]);

  return { isIntersecting, entry };
}
