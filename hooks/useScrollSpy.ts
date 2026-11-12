import { useEffect, useState } from 'react';
import { type EventListenerTarget } from './useEventListener';
import { useLatest } from './useLatest';

export interface UseScrollSpyOptions {
  root?: EventListenerTarget<HTMLElement> | null;
  rootMargin?: string;
  threshold?: number | number[];
  defaultActiveId?: string | null;
  onChange?: (activeId: string | null) => void;
}

function resolveElement<T extends Element>(
  target: EventListenerTarget<T> | string | undefined | null,
): T | null {
  if (!target) {
    return null;
  }
  if (typeof target === 'string') {
    if (typeof document === 'undefined') {
      return null;
    }
    const cleanId = target.startsWith('#') ? target.slice(1) : target;
    return (document.getElementById(cleanId) ??
      document.querySelector(target)) as T | null;
  }
  if (typeof target === 'object' && 'current' in target) {
    return target.current;
  }
  return target;
}

export function useScrollSpy(
  targets: ReadonlyArray<EventListenerTarget<HTMLElement> | string>,
  options: UseScrollSpyOptions = {},
): string | null {
  const {
    root = null,
    rootMargin = '0px 0px -70% 0px',
    threshold = [0, 0.25, 0.5, 0.75, 1],
    defaultActiveId = null,
    onChange,
  } = options;

  const [activeId, setActiveId] = useState<string | null>(defaultActiveId);
  const onChangeRef = useLatest(onChange);

  const thresholdKey = Array.isArray(threshold)
    ? threshold.join(',')
    : String(threshold);

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      typeof window.IntersectionObserver !== 'function'
    ) {
      return;
    }

    const elements = targets
      .map((t) => resolveElement(t))
      .filter((el): el is HTMLElement => el !== null && Boolean(el.id));

    if (elements.length === 0) {
      return;
    }

    const rootElement = resolveElement(root);
    const visibleMap = new Map<string, IntersectionObserverEntry>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id;
          if (!id) {
            continue;
          }
          if (entry.isIntersecting) {
            visibleMap.set(id, entry);
          } else {
            visibleMap.delete(id);
          }
        }

        if (visibleMap.size === 0) {
          return;
        }

        let nextId: string | null = null;
        let bestTop = Infinity;

        for (const el of elements) {
          const entry = visibleMap.get(el.id);
          if (entry) {
            const top = Math.abs(entry.boundingClientRect.top);
            if (top < bestTop) {
              bestTop = top;
              nextId = el.id;
            }
          }
        }

        if (nextId !== null) {
          setActiveId((prev) => {
            if (prev !== nextId) {
              onChangeRef.current?.(nextId);
            }
            return nextId;
          });
        }
      },
      {
        root: rootElement,
        rootMargin,
        threshold,
      },
    );

    for (const el of elements) {
      observer.observe(el);
    }

    return () => {
      observer.disconnect();
    };
  }, [targets, root, rootMargin, thresholdKey, onChangeRef]);

  return activeId;
}
