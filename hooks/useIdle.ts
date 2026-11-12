import { useEffect, useRef } from 'react';
import { useBoolean } from './useBoolean';
import { useEventCallback } from './useEventCallback';
import { useThrottleCallback } from './useThrottleCallback';

export interface UseIdleOptions {
  initialState?: boolean;
  events?: ReadonlyArray<keyof WindowEventMap>;
  throttleMs?: number;
}

const DEFAULT_EVENTS: ReadonlyArray<keyof WindowEventMap> = [
  'mousemove',
  'mousedown',
  'resize',
  'keydown',
  'touchstart',
  'wheel',
];

export function useIdle(
  timeout = 60_000,
  options: UseIdleOptions = {},
): boolean {
  const {
    initialState = false,
    events = DEFAULT_EVENTS,
    throttleMs = 200,
  } = options;

  const { value: isIdle, setTrue, setFalse } = useBoolean(initialState);
  const timerIdRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetTimer = useEventCallback(() => {
    if (isIdle) {
      setFalse();
    }

    if (timerIdRef.current !== null) {
      clearTimeout(timerIdRef.current);
    }

    timerIdRef.current = setTimeout(() => {
      setTrue();
    }, Math.max(0, timeout));
  });

  const handleActivity = useThrottleCallback(resetTimer, throttleMs);

  const eventsKey = events.join(',');

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    timerIdRef.current = setTimeout(() => {
      setTrue();
    }, Math.max(0, timeout));

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

    for (const eventName of events) {
      window.addEventListener(eventName, listener, { passive: true });
    }
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (timerIdRef.current !== null) {
        clearTimeout(timerIdRef.current);
        timerIdRef.current = null;
      }
      handleActivity.cancel();
      for (const eventName of events) {
        window.removeEventListener(eventName, listener);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [timeout, throttleMs, eventsKey, handleActivity, resetTimer, setTrue]);

  return isIdle;
}
