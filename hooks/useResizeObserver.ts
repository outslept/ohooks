import { useEffect } from 'react';
import {
  EventListenerTarget,
  resolveTargetElement,
} from './useEventListener';
import { useLatest } from './useLatest';

export interface UseResizeObserverOptions extends ResizeObserverOptions {
  enabled?: boolean;
}

export function useResizeObserver<T extends Element = HTMLElement>(
  target: EventListenerTarget<T>,
  callback: (entry: ResizeObserverEntry, observer: ResizeObserver) => void,
  options: UseResizeObserverOptions = {}
): void {
  const { box = 'content-box', enabled = true } = options;
  const callbackRef = useLatest(callback);

  useEffect(() => {
    if (
      !enabled ||
      typeof window === 'undefined' ||
      typeof ResizeObserver === 'undefined'
    ) {
      return;
    }

    const element = resolveTargetElement(target);
    if (!element) {
      return;
    }

    const observer = new ResizeObserver((entries, obs) => {
      const firstEntry = entries[0];
      if (firstEntry) {
        callbackRef.current(firstEntry, obs);
      }
    });

    observer.observe(element, { box });

    return () => {
      observer.disconnect();
    };
  }, [target, box, enabled, callbackRef]);
}

export default useResizeObserver;
