import { useEffect, useState } from 'react';
import { type EventListenerTarget } from './useEventListener';
import { useLatest } from './useLatest';

export interface UseResizeObserverOptions {
  box?: ResizeObserverBoxOptions;
  enabled?: boolean;
  onResize?: (entry: ResizeObserverEntry) => void;
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

export function useResizeObserver<T extends Element = HTMLElement>(
  target: EventListenerTarget<T>,
  options: UseResizeObserverOptions = {},
): ResizeObserverEntry | null {
  const { box = 'content-box', enabled = true, onResize } = options;

  const [entry, setEntry] = useState<ResizeObserverEntry | null>(null);
  const onResizeRef = useLatest(onResize);

  useEffect(() => {
    const element = resolveElement(target);

    if (
      !enabled ||
      !element ||
      typeof window === 'undefined' ||
      typeof window.ResizeObserver !== 'function'
    ) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const latestEntry = entries[0];
      if (!latestEntry) {
        return;
      }

      setEntry(latestEntry);
      onResizeRef.current?.(latestEntry);
    });

    observer.observe(element, { box });

    return () => {
      observer.disconnect();
    };
  }, [target, box, enabled, onResizeRef]);

  return entry;
}
