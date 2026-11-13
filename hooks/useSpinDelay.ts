import { useEffect, useRef, useState } from 'react';
import { useHydrated } from './useHydrated';

/** Configuration options for `useSpinDelay`. */
export interface SpinDelayOptions {
  /** Delay in milliseconds before showing the spinner (default: `500`). */
  delay?: number;
  /** Minimum duration in milliseconds the spinner stays visible once shown (default: `200`). */
  minDuration?: number;
  /** Immediately show the spinner during SSR when `loading` is `true` (default: `true`). */
  ssr?: boolean;
}

type SpinState = 'IDLE' | 'DELAY' | 'DISPLAY' | 'EXPIRE';

/**
 * Prevents loading indicator flashes by delaying appearance and enforcing a minimum display duration.
 *
 * @category Effects
 * @param loading - Raw loading state boolean
 * @param options - Delay, minimum visible duration, and SSR behavior options
 * @returns Whether the loading spinner should currently be rendered
 *
 * @example
 * ```tsx
 * const showSpinner = useSpinDelay(isFetching, { delay: 400, minDuration: 200 });
 * ```
 */
export function useSpinDelay(
  loading: boolean,
  options: SpinDelayOptions = {}
): boolean {
  const { delay = 500, minDuration = 200, ssr = true } = options;
  const isHydrated = useHydrated();

  const [state, setState] = useState<SpinState>(() => {
    if (ssr && loading) {
      return 'DISPLAY';
    }
    return loading ? 'DELAY' : 'IDLE';
  });

  const timeoutRef: { current: ReturnType<typeof setTimeout> | null } =
    useRef(null);

  const clearTimer = () => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  useEffect(() => {
    if (loading && state === 'IDLE') {
      clearTimer();
      const safeDelay = Math.max(0, delay);
      if (safeDelay === 0) {
        setState('DISPLAY');
      } else {
        setState('DELAY');
        timeoutRef.current = setTimeout(() => {
          setState('DISPLAY');
        }, safeDelay);
      }
    } else if (loading && state === 'DELAY' && timeoutRef.current === null) {
      const safeDelay = Math.max(0, delay);
      if (safeDelay === 0) {
        setState('DISPLAY');
      } else {
        timeoutRef.current = setTimeout(() => {
          setState('DISPLAY');
        }, safeDelay);
      }
    } else if (!loading && state === 'DELAY') {
      clearTimer();
      setState('IDLE');
    } else if (!loading && state === 'DISPLAY') {
      clearTimer();
      const safeMinDuration = Math.max(0, minDuration);
      if (safeMinDuration === 0) {
        setState('IDLE');
      } else {
        setState('EXPIRE');
        timeoutRef.current = setTimeout(() => {
          setState('IDLE');
        }, safeMinDuration);
      }
    } else if (loading && state === 'EXPIRE') {
      clearTimer();
      setState('DISPLAY');
    }
  }, [loading, state, delay, minDuration]);

  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, []);

  if (!isHydrated && ssr) {
    return loading;
  }

  return state === 'DISPLAY' || state === 'EXPIRE';
}

export default useSpinDelay;
