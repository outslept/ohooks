import {
  type EventListenerTarget,
  useEventListener,
} from './useEventListener';

export type OnClickOutsideEvent = MouseEvent | TouchEvent | FocusEvent;

export interface UseOnClickOutsideOptions {
  enabled?: boolean;
  detectIframe?: boolean;
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

export function useOnClickOutside<T extends Element = HTMLElement>(
  target: EventListenerTarget<T> | ReadonlyArray<EventListenerTarget<T>>,
  handler: (event: OnClickOutsideEvent) => void,
  options: UseOnClickOutsideOptions = {},
): void {
  const { enabled = true, detectIframe = false } = options;

  const listener = (event: MouseEvent | TouchEvent): void => {
    if (!enabled) {
      return;
    }

    const eventTarget = event.target as Node | null;
    if (!eventTarget || !eventTarget.isConnected) {
      return;
    }

    const targets = Array.isArray(target) ? target : [target];
    const elements = targets
      .map((item) => resolveElement(item as EventListenerTarget<T>))
      .filter((el): el is T => el !== null);

    if (elements.length === 0) {
      return;
    }

    const composedPath =
      typeof event.composedPath === 'function' ? event.composedPath() : null;

    const isInside = elements.some((element) => {
      if (composedPath) {
        return composedPath.includes(element);
      }
      return element.contains(eventTarget);
    });

    if (!isInside) {
      handler(event);
    }
  };

  const doc = typeof document !== 'undefined' ? document : null;

  useEventListener('mousedown', listener, doc);
  useEventListener('touchstart', listener, doc, { passive: true });

  useEventListener('blur', (event: FocusEvent) => {
    if (!enabled || !detectIframe || typeof document === 'undefined') {
      return;
    }

    const activeElement = document.activeElement;
    if (
      !activeElement ||
      activeElement.tagName !== 'IFRAME'
    ) {
      return;
    }

    const targets = Array.isArray(target) ? target : [target];
    const elements = targets
      .map((item) => resolveElement(item as EventListenerTarget<T>))
      .filter((el): el is T => el !== null);

    const isInside = elements.some((element) =>
      element.contains(activeElement),
    );

    if (!isInside) {
      handler(event);
    }
  });
}
