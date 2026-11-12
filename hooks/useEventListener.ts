import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';
import { useLatest } from './useLatest';

export type EventListenerTarget<T> =
  | T
  | { readonly current: T | null }
  | null;

export function isRefObject<T>(
  target: EventListenerTarget<T> | undefined,
): target is { readonly current: T | null } {
  return (
    target !== null &&
    target !== undefined &&
    typeof target === 'object' &&
    'current' in target &&
    !(
      'addEventListener' in target &&
      typeof (target as unknown as EventTarget).addEventListener === 'function'
    ) &&
    !(
      'nodeType' in target &&
      typeof (target as unknown as Node).nodeType === 'number'
    )
  );
}

export function resolveTargetElement<T>(
  target: EventListenerTarget<T> | undefined,
  fallback?: T | null,
): T | null {
  if (target === undefined) {
    return fallback ?? null;
  }
  if (target === null) {
    return null;
  }
  return isRefObject(target) ? target.current : target;
}

export function useEventListener<K extends keyof WindowEventMap>(
  eventName: K,
  handler: (event: WindowEventMap[K]) => void,
  element?: EventListenerTarget<Window> | undefined,
  options?: boolean | AddEventListenerOptions | undefined,
): void;

export function useEventListener<K extends keyof DocumentEventMap>(
  eventName: K,
  handler: (event: DocumentEventMap[K]) => void,
  element: EventListenerTarget<Document>,
  options?: boolean | AddEventListenerOptions | undefined,
): void;

export function useEventListener<
  K extends keyof HTMLElementEventMap,
  T extends HTMLElement = HTMLElement,
>(
  eventName: K,
  handler: (event: HTMLElementEventMap[K]) => void,
  element: EventListenerTarget<T>,
  options?: boolean | AddEventListenerOptions | undefined,
): void;

export function useEventListener<
  K extends keyof SVGElementEventMap,
  T extends SVGElement = SVGElement,
>(
  eventName: K,
  handler: (event: SVGElementEventMap[K]) => void,
  element: EventListenerTarget<T>,
  options?: boolean | AddEventListenerOptions | undefined,
): void;

export function useEventListener<K extends keyof MediaQueryListEventMap>(
  eventName: K,
  handler: (event: MediaQueryListEventMap[K]) => void,
  element: EventListenerTarget<MediaQueryList>,
  options?: boolean | AddEventListenerOptions | undefined,
): void;

export function useEventListener<K extends string, E extends Event = Event>(
  eventName: K,
  handler: (event: E) => void,
  element?: EventListenerTarget<EventTarget> | undefined,
  options?: boolean | AddEventListenerOptions | undefined,
): void;

export function useEventListener(
  eventName: string,
  handler: (event: never) => void,
  element?: EventListenerTarget<EventTarget> | undefined,
  options?: boolean | AddEventListenerOptions | undefined,
): void {
  const savedHandler = useLatest(handler);

  const isBooleanOptions = typeof options === 'boolean';
  const capture = isBooleanOptions ? options : options?.capture;
  const passive = isBooleanOptions ? undefined : options?.passive;
  const once = isBooleanOptions ? undefined : options?.once;
  const signal = isBooleanOptions ? undefined : options?.signal;

  useIsomorphicLayoutEffect(() => {
    const defaultWindow =
      typeof window !== 'undefined' ? (window as EventTarget) : null;
    const targetElement = resolveTargetElement(element, defaultWindow);

    if (
      !targetElement ||
      typeof targetElement.addEventListener !== 'function'
    ) {
      return;
    }

    let listenerOptions: boolean | AddEventListenerOptions | undefined;
    if (isBooleanOptions) {
      listenerOptions = capture;
    } else if (
      capture !== undefined ||
      passive !== undefined ||
      once !== undefined ||
      signal !== undefined
    ) {
      listenerOptions = {};
      if (capture !== undefined) listenerOptions.capture = capture;
      if (passive !== undefined) listenerOptions.passive = passive;
      if (once !== undefined) listenerOptions.once = once;
      if (signal !== undefined) listenerOptions.signal = signal;
    }

    const listener: EventListener = (event) => {
      (savedHandler.current as (event: Event) => void)(event);
    };

    targetElement.addEventListener(eventName, listener, listenerOptions);

    return () => {
      targetElement.removeEventListener(eventName, listener, listenerOptions);
    };
  }, [
    eventName,
    element,
    isBooleanOptions,
    capture,
    passive,
    once,
    signal,
    savedHandler,
  ]);
}
