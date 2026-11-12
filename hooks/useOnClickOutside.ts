import { useEffect } from 'react';
import {
  EventListenerTarget,
  resolveTargetElement,
} from './useEventListener';
import { useLatest } from './useLatest';

export type ClickOutsideEvent = MouseEvent | TouchEvent | PointerEvent;

export interface UseOnClickOutsideOptions {
  enabled?: boolean;
  events?: ReadonlyArray<'mousedown' | 'mouseup' | 'touchstart' | 'touchend' | 'pointerdown' | 'click'>;
  capture?: boolean;
}

const DEFAULT_EVENTS: ReadonlyArray<
  'mousedown' | 'mouseup' | 'touchstart' | 'touchend' | 'pointerdown' | 'click'
> = ['pointerdown'];

export function useOnClickOutside<T extends HTMLElement = HTMLElement>(
  target:
    | EventListenerTarget<T>
    | ReadonlyArray<EventListenerTarget<HTMLElement>>,
  handler: (event: ClickOutsideEvent) => void,
  options: UseOnClickOutsideOptions = {}
): void {
  const {
    enabled = true,
    events = DEFAULT_EVENTS,
    capture = true,
  } = options;

  const handlerRef = useLatest(handler);
  const targetRef = useLatest(target);
  const eventsKey = events.join(',');

  useEffect(() => {
    if (!enabled || typeof document === 'undefined') {
      return;
    }

    const listener = (rawEvent: Event) => {
      const event = rawEvent as ClickOutsideEvent;
      const eventTarget = event.target as Node | null;
      if (!eventTarget || !eventTarget.isConnected) {
        return;
      }

      const rawTargets = targetRef.current;
      const targetsArray: ReadonlyArray<EventListenerTarget<HTMLElement>> =
        Array.isArray(rawTargets) ? rawTargets : [rawTargets];

      const composedPath =
        typeof event.composedPath === 'function'
          ? event.composedPath()
          : undefined;

      for (const item of targetsArray) {
        const element = resolveTargetElement(item);
        if (!element) {
          continue;
        }
        if (
          element === eventTarget ||
          element.contains(eventTarget) ||
          (composedPath && composedPath.includes(element))
        ) {
          return;
        }
      }

      handlerRef.current(event);
    };

    for (const eventName of events) {
      document.addEventListener(eventName, listener, { capture });
    }

    return () => {
      for (const eventName of events) {
        document.removeEventListener(eventName, listener, { capture });
      }
    };
  }, [enabled, eventsKey, capture, handlerRef, targetRef]);
}

export default useOnClickOutside;
