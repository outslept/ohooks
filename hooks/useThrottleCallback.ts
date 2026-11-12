import { useEffect, useMemo, useRef } from 'react';
import { useLatest } from './useLatest';

export interface ThrottleOptions {
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
  options: ThrottleOptions = {}
): ThrottledFunction<T> {
  const { leading = true, trailing = true } = options;

  const fnRef = useLatest(fn);
  const timerIdRef: { current: ReturnType<typeof setTimeout> | null } =
    useRef(null);
  const lastArgsRef: { current: Parameters<T> | null } = useRef(null);
  const lastInvokeTimeRef: { current: number } = useRef(0);
  const resultRef: { current: ReturnType<T> | undefined } = useRef(undefined);

  const throttled = useMemo<ThrottledFunction<T>>(() => {
    const safeWait = Math.max(0, wait);

    const invokeFunc = (time: number): ReturnType<T> | undefined => {
      const args = lastArgsRef.current;
      lastArgsRef.current = null;
      lastInvokeTimeRef.current = time;
      if (args !== null) {
        resultRef.current = fnRef.current(...args) as ReturnType<T>;
      }
      return resultRef.current;
    };

    const trailingEdge = (time: number): ReturnType<T> | undefined => {
      timerIdRef.current = null;
      if (trailing && lastArgsRef.current !== null) {
        return invokeFunc(time);
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
      timerIdRef.current = null;
      return trailingEdge(Date.now());
    };

    const isPending = (): boolean => {
      return timerIdRef.current !== null;
    };

    const throttledFn = (...args: Parameters<T>): ReturnType<T> | undefined => {
      const now = Date.now();

      if (lastInvokeTimeRef.current === 0 && !leading) {
        lastInvokeTimeRef.current = now;
      }

      const remaining = safeWait - (now - lastInvokeTimeRef.current);
      lastArgsRef.current = args;

      if (remaining <= 0 || remaining > safeWait) {
        if (timerIdRef.current !== null) {
          clearTimeout(timerIdRef.current);
          timerIdRef.current = null;
        }
        return invokeFunc(now);
      }

      if (timerIdRef.current === null && trailing) {
        timerIdRef.current = setTimeout(() => {
          trailingEdge(Date.now());
        }, remaining);
      }

      return resultRef.current;
    };

    throttledFn.cancel = cancel;
    throttledFn.flush = flush;
    throttledFn.isPending = isPending;

    return throttledFn;
  }, [wait, leading, trailing, fnRef]);

  useEffect(() => {
    return () => {
      throttled.cancel();
    };
  }, [throttled]);

  return throttled;
}

export default useThrottleCallback;
