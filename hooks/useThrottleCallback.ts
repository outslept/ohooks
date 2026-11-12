import { useMemo, useRef } from 'react';
import { useLatest } from './useLatest';
import { useUnmount } from './useUnmount';

export interface UseThrottleOptions {
  leading?: boolean;
  trailing?: boolean;
}

export interface ThrottledFunction<T extends (...args: never[]) => unknown> {
  (...args: Parameters<T>): ReturnType<T> | undefined;
  cancel: () => void;
  flush: () => ReturnType<T> | undefined;
  isPending: () => boolean;
}

export function useThrottleCallback<T extends (...args: never[]) => unknown>(
  fn: T,
  wait: number,
  options: UseThrottleOptions = {},
): ThrottledFunction<T> {
  const { leading = true, trailing = true } = options;

  const fnRef = useLatest(fn);
  const timerIdRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastInvokeTimeRef = useRef<number>(0);
  const lastArgsRef = useRef<Parameters<T> | null>(null);
  const resultRef = useRef<ReturnType<T> | undefined>(undefined);

  const throttled = useMemo(() => {
    const interval = Math.max(0, wait);

    const invokeFunc = (
      time: number,
      args: Parameters<T>,
    ): ReturnType<T> | undefined => {
      lastInvokeTimeRef.current = time;
      lastArgsRef.current = null;
      resultRef.current = fnRef.current(...args) as ReturnType<T>;
      return resultRef.current;
    };

    const trailingEdge = (): ReturnType<T> | undefined => {
      timerIdRef.current = null;
      if (trailing && lastArgsRef.current !== null) {
        return invokeFunc(leading ? Date.now() : 0, lastArgsRef.current);
      }
      lastArgsRef.current = null;
      return resultRef.current;
    };

    const cancel = (): void => {
      if (timerIdRef.current !== null) {
        clearTimeout(timerIdRef.current);
        timerIdRef.current = null;
      }
      lastInvokeTimeRef.current = 0;
      lastArgsRef.current = null;
    };

    const flush = (): ReturnType<T> | undefined => {
      if (timerIdRef.current === null) {
        return resultRef.current;
      }
      clearTimeout(timerIdRef.current);
      return trailingEdge();
    };

    const isPending = (): boolean => {
      return timerIdRef.current !== null;
    };

    const throttledFn = (
      ...args: Parameters<T>
    ): ReturnType<T> | undefined => {
      if (!leading && !trailing) {
        return resultRef.current;
      }

      const now = Date.now();
      const isFirstCall = lastInvokeTimeRef.current === 0;

      if (isFirstCall && !leading) {
        lastInvokeTimeRef.current = now;
      }

      const remaining = interval - (now - lastInvokeTimeRef.current);
      lastArgsRef.current = args;

      if (
        (!isFirstCall || leading) &&
        (remaining <= 0 || remaining > interval)
      ) {
        if (timerIdRef.current !== null) {
          clearTimeout(timerIdRef.current);
          timerIdRef.current = null;
        }
        return invokeFunc(now, args);
      }

      if (timerIdRef.current === null && trailing) {
        timerIdRef.current = setTimeout(
          trailingEdge,
          Math.max(0, remaining),
        );
      }

      return resultRef.current;
    };

    throttledFn.cancel = cancel;
    throttledFn.flush = flush;
    throttledFn.isPending = isPending;

    return throttledFn;
  }, [wait, leading, trailing, fnRef]);

  useUnmount(() => {
    throttled.cancel();
  });

  return throttled;
}
