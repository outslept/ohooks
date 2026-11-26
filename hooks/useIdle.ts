import { useEffect, useRef } from "react";
import { useBoolean } from "./useBoolean";
import { useEventCallback } from "./useEventCallback";
import { useLatest } from "./useLatest";
import { useThrottleCallback } from "./useThrottleCallback";

export interface UseIdleOptions {
  /** Initial idle state before the first timeout elapses (default: `false`) */
  initialState?: boolean;
  /** Window events that reset the idle timer */
  events?: ReadonlyArray<keyof WindowEventMap>;
  /** Throttle interval in milliseconds for activity event listeners (default: `200`) */
  throttleMs?: number;
}

const DEFAULT_EVENTS: ReadonlyArray<keyof WindowEventMap> = [
  "mousemove",
  "mousedown",
  "resize",
  "keydown",
  "touchstart",
  "wheel",
];

/**
 * Tracks whether the user has been inactive for a given duration by listening to window interaction events.
 *
 * @category Sensors
 * @param timeout - Inactivity timeout in milliseconds before marking the user as idle (default: `60000`)
 * @param options - Configuration for initial state, monitored DOM events, and listener throttling
 * @returns `true` when the user is idle, `false` when active
 *
 * @example
 * ```tsx
 * const isIdle = useIdle(30_000);
 * ```
 */
export function useIdle(timeout = 60_000, options: UseIdleOptions = {}): boolean {
  const { initialState = false, events = DEFAULT_EVENTS, throttleMs = 200 } = options;

  const { value: isIdle, setTrue, setFalse } = useBoolean(initialState);
  const timerIdRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const eventsRef = useLatest(events);

  const resetTimer = useEventCallback(() => {
    if (isIdle) {
      setFalse();
    }

    if (timerIdRef.current !== null) {
      clearTimeout(timerIdRef.current);
    }

    timerIdRef.current = setTimeout(
      () => {
        setTrue();
      },
      Math.max(0, timeout),
    );
  });

  const handleActivity = useThrottleCallback(resetTimer, throttleMs);

  const eventsKey = events.join(",");

  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") {
      return;
    }

    const currentEvents = eventsRef.current;

    timerIdRef.current = setTimeout(
      () => {
        setTrue();
      },
      Math.max(0, timeout),
    );

    const listener = (): void => {
      if (throttleMs > 0) {
        handleActivity();
      } else {
        resetTimer();
      }
    };

    const handleVisibilityChange = (): void => {
      if (!document.hidden) {
        listener();
      }
    };

    for (const eventName of currentEvents) {
      window.addEventListener(eventName, listener, { passive: true });
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (timerIdRef.current !== null) {
        clearTimeout(timerIdRef.current);
        timerIdRef.current = null;
      }
      handleActivity.cancel();
      for (const eventName of currentEvents) {
        window.removeEventListener(eventName, listener);
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [timeout, throttleMs, eventsKey, eventsRef, handleActivity, resetTimer, setTrue]);

  return isIdle;
}
