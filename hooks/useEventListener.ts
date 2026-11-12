import { useEffect } from 'react';
import { useLatest } from './useLatest';

export type EventListenerTarget<T> = T | { readonly current: T | null } | null;

export function isRefObject<T>(
  target: EventListenerTarget<T> | undefined
): target is { readonly current: T | null } {
  return (
    typeof target === 'object' &&
    target !== null &&
    'current' in target &&
    !('addEventListener' in target) &&
    !('nodeType' in target)
  );
}

export function resolveTargetElement<T>(
  target: EventListenerTarget<T> | undefined,
  fallback: T | null = null
): T | null {
  if (target === undefined) {
    return fallback;
  }
  if (target === null) {
    return null;
  }
  if (isRefObject(target)) {
    return target.current ?? null;
  }
  return target;
}

export function useEventListener<K extends keyof WindowEventMap>(
  eventName: K,
  handler: (event: WindowEventMap[K]) => void,
  element?: EventListenerTarget<Window>,
  options?: boolean | AddEventListenerOptions
): void;

export function useEventListener<K extends keyof DocumentEventMap>(
  eventName: K,
  handler: (event: DocumentEventMap[K]) => void,
  element: EventListenerTarget<Document>,
  options?: boolean | AddEventListenerOptions
): void;

export function useEventListener<
  K extends keyof HTMLElementEventMap,
  T extends HTMLElement = HTMLElement,
>(
  eventName: K,
  handler: (event: HTMLElementEventMap[K]) => void,
  element: EventListenerTarget<T>,
  options?: boolean | AddEventListenerOptions
): void;

export function useEventListener<
  K extends keyof SVGElementEventMap,
  T extends SVGElement = SVGElement,
>(
  eventName: K,
  handler: (event: SVGElementEventMap[K]) => void,
  element: EventListenerTarget<T>,
  options?: boolean | AddEventListenerOptions
): void;

export function useEventListener<K extends keyof MediaQueryListEventMap>(
  eventName: K,
  handler: (event: MediaQueryListEventMap[K]) => void,
  element: EventListenerTarget<MediaQueryList>,
  options?: boolean | AddEventListenerOptions
): void;

export function useEventListener<
  K extends string,
  T extends EventTarget = EventTarget,
  E extends Event = Event,
>(
  eventName: K,
  handler: (event: E) => void,
  element?: EventListenerTarget<
    T extends HTMLElement | SVGElement | Window | Document | MediaQueryList
      ? never
      : T
  >,
  options?: boolean | AddEventListenerOptions
): void;

export function useEventListener(
  eventName: string,
  handler: (event: Event) => void,
  element?: EventListenerTarget<EventTarget>,
  options?: boolean | AddEventListenerOptions
): void {
  const savedHandler = useLatest(handler);

  const isBooleanOptions = typeof options === 'boolean';
  const capture = isBooleanOptions ? options : options?.capture;
  const once = isBooleanOptions ? undefined : options?.once;
  const passive = isBooleanOptions ? undefined : options?.passive;
  const signal = isBooleanOptions ? undefined : options?.signal;

  useEffect(() => {
    const defaultTarget = typeof window !== 'undefined' ? window : null;
    const targetElement = resolveTargetElement<EventTarget>(
      element,
      defaultTarget
    );

    if (!targetElement || typeof targetElement.addEventListener !== 'function') {
      return;
    }

    const listener: EventListener = (event: Event) => {
      savedHandler.current(event);
    };

    const listenerOptions: boolean | AddEventListenerOptions | undefined =
      isBooleanOptions
        ? options
        : capture !== undefined ||
            once !== undefined ||
            passive !== undefined ||
            signal !== undefined
          ? {
              ...(capture !== undefined ? { capture } : {}),
              ...(once !== undefined ? { once } : {}),
              ...(passive !== undefined ? { passive } : {}),
              ...(signal !== undefined ? { signal } : {}),
            }
          : undefined;

    targetElement.addEventListener(eventName, listener, listenerOptions);

    return () => {
      targetElement.removeEventListener(eventName, listener, listenerOptions);
    };
  }, [
    eventName,
    element,
    isBooleanOptions,
    options,
    capture,
    once,
    passive,
    signal,
    savedHandler,
  ]);
}

export default useEventListener;
