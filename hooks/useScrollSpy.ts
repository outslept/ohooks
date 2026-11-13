import { useEffect, useState } from 'react';
import {
  EventListenerTarget,
} from './useEventListener';
import { useLatest } from './useLatest';
import { isRefObject, resolveTargetElement } from '@/lib/utils';

/** Section target accepted by `useScrollSpy` (element ID, CSS selector, ref, or DOM element). */
export type ScrollSpyTarget = string | EventListenerTarget<HTMLElement>;

/** Configuration options for `useScrollSpy`. */
export interface UseScrollSpyOptions {
  /** Scrollable root container (defaults to the browser viewport). */
  root?: EventListenerTarget<HTMLElement>;
  /** `IntersectionObserver` root margin (default: `'0px 0px -80% 0px'`). */
  rootMargin?: string;
  /** `IntersectionObserver` visibility threshold(s) (default: `0`). */
  threshold?: number | number[];
  /** Top pixel offset subtracted when ranking visible sections (default: `0`). */
  offset?: number;
}

function resolveSectionElement(target: ScrollSpyTarget): HTMLElement | null {
  if (typeof document === 'undefined') {
    return null;
  }
  if (typeof target === 'string') {
    const trimmed = target.trim();
    if (!trimmed) return null;
    const id = trimmed.startsWith('#') ? trimmed.slice(1) : trimmed;
    return (
      document.getElementById(id) ??
      document.querySelector<HTMLElement>(trimmed)
    );
  }
  return resolveTargetElement(target);
}

/**
 * Observes a list of page sections and returns the `id` of the currently active section in view.
 *
 * @category DOM
 * @param targets - Array of section IDs, selectors, refs, or elements to observe
 * @param options - Intersection root, margin, threshold, and top offset options
 * @returns The `id` of the active section, or `null` if none is active
 *
 * @example
 * ```tsx
 * const activeId = useScrollSpy(['#intro', '#features', '#pricing']);
 * ```
 */
export function useScrollSpy(
  targets: readonly ScrollSpyTarget[],
  options: UseScrollSpyOptions = {}
): string | null {
  const {
    root,
    rootMargin = '0px 0px -80% 0px',
    threshold = 0,
    offset = 0,
  } = options;

  const [activeId, setActiveId] = useState<string | null>(null);
  const targetsRef = useLatest(targets);

  const targetsKey = targets
    .map((t, index) => {
      if (typeof t === 'string') return `s:${t}`;
      if (isRefObject(t)) return `r:${index}:${t.current?.id ?? ''}`;
      return `e:${t?.id ?? index}`;
    })
    .join('|');

  const thresholdKey = Array.isArray(threshold)
    ? threshold.join(',')
    : String(threshold);

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      typeof IntersectionObserver === 'undefined'
    ) {
      return;
    }

    const elements = targetsRef.current
      .map(resolveSectionElement)
      .filter((el): el is HTMLElement => el !== null && Boolean(el.id));

    if (elements.length === 0) {
      setActiveId(null);
      return;
    }

    const rootElement = resolveTargetElement(root);
    const intersectingIds = new Set<string>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = (entry.target as HTMLElement).id;
          if (!id) continue;
          if (entry.isIntersecting) {
            intersectingIds.add(id);
          } else {
            intersectingIds.delete(id);
          }
        }

        if (intersectingIds.size === 0) {
          return;
        }

        const rootTop = rootElement
          ? rootElement.getBoundingClientRect().top
          : 0;

        let bestId: string | null = null;
        let bestTop = Number.POSITIVE_INFINITY;

        for (const el of elements) {
          if (!intersectingIds.has(el.id)) continue;
          const relativeTop = el.getBoundingClientRect().top - rootTop - offset;
          if (relativeTop < bestTop) {
            bestTop = relativeTop;
            bestId = el.id;
          }
        }

        if (bestId !== null) {
          setActiveId(bestId);
        }
      },
      {
        root: rootElement,
        rootMargin,
        threshold,
      }
    );

    for (const element of elements) {
      observer.observe(element);
    }

    return () => {
      observer.disconnect();
    };
  }, [targetsKey, root, rootMargin, thresholdKey, offset]);

  return activeId;
}

export default useScrollSpy;
