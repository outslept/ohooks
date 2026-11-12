import { useEffect, useState } from 'react';
import {
  EventListenerTarget,
  isRefObject,
  resolveTargetElement,
} from './useEventListener';
import { useLatest } from './useLatest';

export type ScrollSpyTarget = string | EventListenerTarget<HTMLElement>;

export interface UseScrollSpyOptions {
  root?: EventListenerTarget<HTMLElement>;
  rootMargin?: string;
  threshold?: number | number[];
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
