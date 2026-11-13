import { useEffect, useState } from 'react';
import {
  EventListenerTarget,
  resolveTargetElement,
} from './useEventListener';
import { useLatest } from './useLatest';

export interface UseIntersectionObserverOptions {
  /** Ancestor element or document used as the viewport for checking visibility (default: `null`) */
  root?: EventListenerTarget<Element | Document>;
  /** Margin around the `root` element (default: `'0px'`) */
  rootMargin?: string;
  /** Visibility ratio threshold(s) at which the observer callback fires (default: `0`) */
  threshold?: number | number[];
  /** Stop observing once the target element has intersected at least once (default: `false`) */
  freezeOnceVisible?: boolean;
  /** Whether the observer is active (default: `true`) */
  enabled?: boolean;
  /** Callback fired whenever the intersection entry updates */
  onChange?: (entry: IntersectionObserverEntry) => void;
}

/**
 * Observes changes in the intersection of a target DOM element with an ancestor element or the viewport.
 *
 * @category DOM
 * @param target - Target DOM element or React ref to observe
 * @param options - `IntersectionObserver` options, `freezeOnceVisible`, and `onChange` callback
 * @returns Latest `IntersectionObserverEntry`, or `null` before the first observation
 *
 * @example
 * ```tsx
 * const entry = useIntersectionObserver(sectionRef, { threshold: 0.5 });
 * const isVisible = Boolean(entry?.isIntersecting);
 * ```
 */
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
