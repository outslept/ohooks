import { useMemo, useRef } from 'react';
import { useLatest } from './useLatest';
import { useUnmount } from './useUnmount';

export interface UseDebounceOptions {
  leading?: boolean;
  trailing?: boolean;
  maxWait?: number;
}

export interface DebouncedFunction<T extends (...args: never[]) => unknown> {
  (...args: Parameters<T>): ReturnType<T> | undefined;
  cancel: () => void;
  flush: () => ReturnType<T> | undefined;
  isPending: () => boolean;
}

export function useDebounceCallback<T extends (...args: never[]) => unknown>(
  fn: T,
  delay: number,
  options: UseDebounceOptions = {},
): DebouncedFunction<T> {
  const { leading = false, trailing = true, maxWait } = options;

  const fnRef = useLatest(fn);
  const timerIdRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastCallTimeRef = useRef<number | null>(null);
  const lastInvokeTimeRef = useRef<number>(0);
  const lastArgsRef = useRef<Parameters<T> | null>(null);
  const resultRef = useRef<ReturnType<T> | undefined>(undefined);

  const debounced = useMemo(() => {
    const wait = Math.max(0, delay);
    const maxing = maxWait !== undefined;
    const maxWaitTime = maxing ? Math.max(maxWait, wait) : 0;

    const invokeFunc = (time: number): ReturnType<T> | undefined => {
      const args = lastArgsRef.current;
      lastArgsRef.current = null;
      lastInvokeTimeRef.current = time;
      if (args !== null) {
        resultRef.current = fnRef.current(...args) as ReturnType<T>;
      }
      return resultRef.current;
    };

    const shouldInvoke = (time: number): boolean => {
      if (lastCallTimeRef.current === null) {
        return true;
      }
      const timeSinceLastCall = time - lastCallTimeRef.current;
      const timeSinceLastInvoke = time - lastInvokeTimeRef.current;

      return (
        timeSinceLastCall >= wait ||
        timeSinceLastCall < 0 ||
        (maxing && timeSinceLastInvoke >= maxWaitTime)
      );
    };

    const remainingWait = (time: number): number => {
      const timeSinceLastCall =
        lastCallTimeRef.current === null ? 0 : time - lastCallTimeRef.current;
      const timeSinceLastInvoke = time - lastInvokeTimeRef.current;
      const timeWaiting = wait - timeSinceLastCall;

      return maxing
        ? Math.min(timeWaiting, maxWaitTime - timeSinceLastInvoke)
        : timeWaiting;
    };

    const trailingEdge = (time: number): ReturnType<T> | undefined => {
      timerIdRef.current = null;

      if (trailing && lastArgsRef.current !== null) {
        return invokeFunc(time);
      }

      lastArgsRef.current = null;
      return resultRef.current;
    };

    const timerExpired = (): void => {
      const time = Date.now();
      if (shouldInvoke(time)) {
        trailingEdge(time);
        return;
      }
      timerIdRef.current = setTimeout(timerExpired, remainingWait(time));
    };

    const leadingEdge = (time: number): ReturnType<T> | undefined => {
      lastInvokeTimeRef.current = time;
      timerIdRef.current = setTimeout(timerExpired, wait);
      return leading ? invokeFunc(time) : resultRef.current;
    };

    const cancel = (): void => {
      if (timerIdRef.current !== null) {
        clearTimeout(timerIdRef.current);
        timerIdRef.current = null;
      }
      lastInvokeTimeRef.current = 0;
      lastArgsRef.current = null;
      lastCallTimeRef.current = null;
    };

    const flush = (): ReturnType<T> | undefined => {
      if (timerIdRef.current === null) {
        return resultRef.current;
      }
      return trailingEdge(Date.now());
    };

    const isPending = (): boolean => {
      return timerIdRef.current !== null;
    };

    const debouncedFn = (
      ...args: Parameters<T>
    ): ReturnType<T> | undefined => {
      const time = Date.now();
      const isInvoking = shouldInvoke(time);

      lastArgsRef.current = args;
      lastCallTimeRef.current = time;

      if (isInvoking) {
        if (timerIdRef.current === null) {
          return leadingEdge(time);
        }
        if (maxing) {
          clearTimeout(timerIdRef.current);
          timerIdRef.current = setTimeout(timerExpired, wait);
          return invokeFunc(time);
        }
      }

      if (timerIdRef.current === null) {
        timerIdRef.current = setTimeout(timerExpired, wait);
      }

      return resultRef.current;
    };

    debouncedFn.cancel = cancel;
    debouncedFn.flush = flush;
    debouncedFn.isPending = isPending;

    return debouncedFn;
  }, [delay, leading, trailing, maxWait, fnRef]);

  useUnmount(() => {
    debounced.cancel();
  });

  return debounced;
}
