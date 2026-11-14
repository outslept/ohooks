import { useEffect, useMemo, useRef } from 'react';
import { useLatest } from './useLatest';

export interface DebounceOptions {
  /** Invoke the callback on the leading edge of the timeout (default: `false`) */
  leading?: boolean;
  /** Invoke the callback on the trailing edge of the timeout (default: `true`) */
  trailing?: boolean;
  /** Maximum time in milliseconds the callback is allowed to be delayed before it is invoked */
  maxWait?: number;
}

export interface DebouncedFunction<T extends (...args: never[]) => unknown> {
  /** Invokes the debounced function */
  (...args: Parameters<T>): ReturnType<T> | undefined;
  /** Cancels any pending delayed invocation */
  cancel: () => void;
  /** Immediately invokes any pending delayed invocation and returns the result */
  flush: () => ReturnType<T> | undefined;
  /** Returns `true` if there is a pending delayed invocation */
  isPending: () => boolean;
}

function getNow(): number {
  return Date.now();
}

/**
 * Creates a debounced version of a callback function with `leading`, `trailing`, `maxWait`, `cancel`, and `flush` support.
 *
 * @category Effects
 * @param fn - Callback function to debounce
 * @param delay - Delay in milliseconds
 * @param options - Debounce behavior options (`leading`, `trailing`, `maxWait`)
 * @returns Debounced function with `.cancel()`, `.flush()`, and `.isPending()` methods
 *
 * @example
 * ```tsx
 * const handleSearch = useDebounceCallback((query: string) => {
 *   fetchResults(query);
 * }, 300);
 * ```
 */
export function useDebounceCallback<T extends (...args: never[]) => unknown>(
  fn: T,
  delay: number,
  options: DebounceOptions = {}
): DebouncedFunction<T> {
  const { leading = false, trailing = true, maxWait } = options;

  const fnRef = useLatest(fn);
  const timerIdRef: { current: ReturnType<typeof setTimeout> | null } =
    useRef(null);
  const lastArgsRef: { current: Parameters<T> | null } = useRef(null);
  const lastCallTimeRef: { current: number | null } = useRef(null);
  const lastInvokeTimeRef: { current: number } = useRef(0);
  const resultRef: { current: ReturnType<T> | undefined } = useRef(undefined);

  const debounced = useMemo<DebouncedFunction<T>>(() => {
    const safeDelay = Math.max(0, delay);
    const hasMaxWait = maxWait !== undefined;
    const safeMaxWait = hasMaxWait
      ? Math.max(safeDelay, maxWait)
      : undefined;

    const invokeFunc = (time: number): ReturnType<T> | undefined => {
      const args = lastArgsRef.current;
      lastArgsRef.current = null;
      lastInvokeTimeRef.current = time;
      if (args !== null) {
        resultRef.current = fnRef.current(...args) as ReturnType<T>;
      }
      return resultRef.current;
    };

    const startTimer = (
      pendingFunc: () => void,
      wait: number
    ): ReturnType<typeof setTimeout> => {
      return setTimeout(pendingFunc, wait);
    };

    const remainingWait = (time: number): number => {
      const timeSinceLastCall =
        time - (lastCallTimeRef.current ?? time);
      const timeSinceLastInvoke = time - lastInvokeTimeRef.current;
      const timeWaiting = safeDelay - timeSinceLastCall;

      return safeMaxWait !== undefined
        ? Math.min(timeWaiting, safeMaxWait - timeSinceLastInvoke)
        : timeWaiting;
    };

    const shouldInvoke = (time: number): boolean => {
      if (lastCallTimeRef.current === null) {
        return true;
      }
      const timeSinceLastCall = time - lastCallTimeRef.current;
      const timeSinceLastInvoke = time - lastInvokeTimeRef.current;

      return (
        timeSinceLastCall >= safeDelay ||
        timeSinceLastCall < 0 ||
        (safeMaxWait !== undefined && timeSinceLastInvoke >= safeMaxWait)
      );
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
      const time = getNow();
      if (shouldInvoke(time)) {
        trailingEdge(time);
        return;
      }
      timerIdRef.current = startTimer(timerExpired, remainingWait(time));
    };

    const leadingEdge = (time: number): ReturnType<T> | undefined => {
      lastInvokeTimeRef.current = time;
      timerIdRef.current = startTimer(timerExpired, safeDelay);
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
      clearTimeout(timerIdRef.current);
      timerIdRef.current = null;
      return trailingEdge(getNow());
    };

    const isPending = (): boolean => {
      return timerIdRef.current !== null;
    };

    const debouncedFn = (...args: Parameters<T>): ReturnType<T> | undefined => {
      const time = getNow();
      const isInvoking = shouldInvoke(time);

      lastArgsRef.current = args;
      lastCallTimeRef.current = time;

      if (isInvoking) {
        if (timerIdRef.current === null) {
          return leadingEdge(lastCallTimeRef.current);
        }
        if (safeMaxWait !== undefined) {
          clearTimeout(timerIdRef.current);
          timerIdRef.current = startTimer(timerExpired, safeDelay);
          return invokeFunc(lastCallTimeRef.current);
        }
      }

      if (timerIdRef.current === null) {
        timerIdRef.current = startTimer(timerExpired, safeDelay);
      }

      return resultRef.current;
    };

    debouncedFn.cancel = cancel;
    debouncedFn.flush = flush;
    debouncedFn.isPending = isPending;

    return debouncedFn;
  }, [delay, leading, trailing, maxWait, fnRef]);

  useEffect(() => {
    return () => {
      debounced.cancel();
    };
  }, [debounced]);

  return debounced;
}

export default useDebounceCallback;
