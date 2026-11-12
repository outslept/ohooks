import { useMemo, useRef } from 'react';
import { useLatest } from './useLatest';
import { useUnmount } from './useUnmount';

export interface RafScheduledFunction<T extends (...args: never[]) => unknown> {
  (...args: Parameters<T>): void;
  cancel: () => void;
  flush: () => ReturnType<T> | undefined;
  isPending: () => boolean;
}

export function useRafCallback<T extends (...args: never[]) => unknown>(
  fn: T,
): RafScheduledFunction<T> {
  const fnRef = useLatest(fn);
  const frameIdRef = useRef<number | null>(null);
  const lastArgsRef = useRef<Parameters<T> | null>(null);
  const resultRef = useRef<ReturnType<T> | undefined>(undefined);

  const scheduled = useMemo(() => {
    const invoke = (): ReturnType<T> | undefined => {
      const args = lastArgsRef.current;
      lastArgsRef.current = null;
      if (args !== null) {
        resultRef.current = fnRef.current(...args) as ReturnType<T>;
      }
      return resultRef.current;
    };

    const cancel = (): void => {
      if (
        frameIdRef.current !== null &&
        typeof window !== 'undefined' &&
        typeof window.cancelAnimationFrame === 'function'
      ) {
        window.cancelAnimationFrame(frameIdRef.current);
      }
      frameIdRef.current = null;
      lastArgsRef.current = null;
    };

    const flush = (): ReturnType<T> | undefined => {
      if (frameIdRef.current === null) {
        return resultRef.current;
      }
      if (
        typeof window !== 'undefined' &&
        typeof window.cancelAnimationFrame === 'function'
      ) {
        window.cancelAnimationFrame(frameIdRef.current);
      }
      frameIdRef.current = null;
      return invoke();
    };

    const isPending = (): boolean => {
      return frameIdRef.current !== null;
    };

    const rafFn = (...args: Parameters<T>): void => {
      lastArgsRef.current = args;

      if (frameIdRef.current !== null) {
        return;
      }

      if (
        typeof window === 'undefined' ||
        typeof window.requestAnimationFrame !== 'function'
      ) {
        return;
      }

      frameIdRef.current = window.requestAnimationFrame(() => {
        frameIdRef.current = null;
        invoke();
      });
    };

    rafFn.cancel = cancel;
    rafFn.flush = flush;
    rafFn.isPending = isPending;

    return rafFn;
  }, [fnRef]);

  useUnmount(() => {
    scheduled.cancel();
  });

  return scheduled;
}
