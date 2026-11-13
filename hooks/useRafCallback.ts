import { useMemo, useRef } from 'react';
import { useLatest } from './useLatest';
import { useUnmount } from './useUnmount';

/** A callback scheduled via `requestAnimationFrame` with control methods. */
export interface RafScheduledFunction<T extends (...args: never[]) => unknown> {
  /** Schedules the callback to run on the next animation frame with the latest arguments. */
  (...args: Parameters<T>): void;
  /** Cancels any pending animation frame invocation. */
  cancel: () => void;
  /** Immediately executes a pending invocation and cancels the scheduled frame. */
  flush: () => ReturnType<T> | undefined;
  /** Returns `true` if an animation frame invocation is currently scheduled. */
  isPending: () => boolean;
}

/**
 * Throttles a callback so it executes at most once per `requestAnimationFrame` with the latest arguments.
 *
 * @category Effects
 * @param fn - The function to schedule on animation frames
 * @returns A wrapped function with `cancel`, `flush`, and `isPending` controls
 *
 * @example
 * ```tsx
 * const onPointerMove = useRafCallback((x: number, y: number) => {
 *   updatePosition(x, y);
 * });
 * ```
 */
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
