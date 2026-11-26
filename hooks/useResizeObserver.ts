import { useEffect } from "react";
import { EventListenerTarget } from "./useEventListener";
import { useLatest } from "./useLatest";
import { resolveTargetElement } from "@/lib/utils";

/** Configuration options for `useResizeObserver`. */
export interface UseResizeObserverOptions extends ResizeObserverOptions {
  /** Whether the `ResizeObserver` is active (default: `true`). */
  enabled?: boolean;
}

/**
 * Observes size changes on a target DOM element using the `ResizeObserver` API.
 *
 * @category DOM
 * @param target - Ref, DOM element, or getter to observe
 * @param callback - Invoked with the `ResizeObserverEntry` whenever the element resizes
 * @param options - Observer box model and enablement options
 *
 * @example
 * ```tsx
 * const boxRef = useRef<HTMLDivElement>(null);
 * useResizeObserver(boxRef, (entry) => {
 *   console.log(entry.contentRect.width);
 * });
 * ```
 */
export function useResizeObserver<T extends Element = HTMLElement>(
  target: EventListenerTarget<T>,
  callback: (entry: ResizeObserverEntry, observer: ResizeObserver) => void,
  options: UseResizeObserverOptions = {},
): void {
  const { box = "content-box", enabled = true } = options;
  const callbackRef = useLatest(callback);

  useEffect(() => {
    if (!enabled || typeof window === "undefined" || typeof ResizeObserver === "undefined") {
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
