import { useEffect } from 'react';
import { type EventListenerTarget } from './useEventListener';
import { useLatest } from './useLatest';

export interface UseResizeObserverOptions extends ResizeObserverOptions {
  enabled?: boolean;
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
  callback: ResizeObserverCallback,
  options: UseResizeObserverOptions = {},
): void {
  const { box = 'content-box', enabled = true } = options;
  const callbackRef = useLatest(callback);

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

    const observer = new ResizeObserver((entries, obs) => {
      callbackRef.current(entries, obs);
    });

    observer.observe(element, { box });

    return () => {
      observer.disconnect();
    };
  }, [target, box, enabled, callbackRef]);
}
