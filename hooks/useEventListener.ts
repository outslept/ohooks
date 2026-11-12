import { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect";
import { useLatest } from "./useLatest";

export type EventListenerTarget<T extends EventTarget> = T | { readonly current: T | null } | null;

function isRefObject<T extends EventTarget>(
  target: EventListenerTarget<T>,
): target is { readonly current: T | null } {
  return (
    target !== null &&
    typeof target === "object" &&
    "current" in target &&
    !("addEventListener" in target && typeof target.addEventListener === "function")
  );
}

export function useEventListener<K extends keyof WindowEventMap>(
  eventName: K,
  handler: (event: WindowEventMap[K]) => void,
  element?: Window | null,
  options?: boolean | AddEventListenerOptions,
): void;

export function useEventListener<K extends keyof DocumentEventMap>(
  eventName: K,
  handler: (event: DocumentEventMap[K]) => void,
  element: EventListenerTarget<Document>,
  options?: boolean | AddEventListenerOptions,
): void;

export function useEventListener<
  K extends keyof HTMLElementEventMap,
  T extends HTMLElement = HTMLElement,
>(
  eventName: K,
  handler: (event: HTMLElementEventMap[K]) => void,
  element: EventListenerTarget<T>,
  options?: boolean | AddEventListenerOptions,
): void;

export function useEventListener<
  K extends keyof SVGElementEventMap,
  T extends SVGElement = SVGElement,
>(
  eventName: K,
  handler: (event: SVGElementEventMap[K]) => void,
  element: EventListenerTarget<T>,
  options?: boolean | AddEventListenerOptions,
): void;

export function useEventListener<K extends keyof MediaQueryListEventMap>(
  eventName: K,
  handler: (event: MediaQueryListEventMap[K]) => void,
  element: EventListenerTarget<MediaQueryList>,
  options?: boolean | AddEventListenerOptions,
): void;

export function useEventListener<K extends string, E extends Event = Event>(
  eventName: K,
  handler: (event: E) => void,
  element?: EventListenerTarget<EventTarget>,
  options?: boolean | AddEventListenerOptions,
): void;

export function useEventListener(
  eventName: string,
  handler: (event: never) => void,
  element?: EventListenerTarget<EventTarget>,
  options?: boolean | AddEventListenerOptions,
): void {
  const savedHandler = useLatest(handler);

  const capture = typeof options === "boolean" ? options : options?.capture;
  const passive = typeof options === "boolean" ? undefined : options?.passive;
  const once = typeof options === "boolean" ? undefined : options?.once;
  const signal = typeof options === "boolean" ? undefined : options?.signal;

  useIsomorphicLayoutEffect(() => {
    const targetElement =
      element === undefined
        ? typeof window !== "undefined"
          ? window
          : null
        : isRefObject(element)
          ? element.current
          : element;

    if (!targetElement || typeof targetElement.addEventListener !== "function") {
      return;
    }

    let listenerOptions: boolean | AddEventListenerOptions | undefined;
    if (typeof options === "boolean") {
      listenerOptions = options;
    } else if (options !== undefined) {
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
  }, [eventName, element, capture, passive, once, signal, savedHandler]);
}
