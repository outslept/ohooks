import { useEffect, useState } from 'react';
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

  const safeDelay = Math.max(0, delay);
  const safeMinDuration = Math.max(0, minDuration);

  const [state, setState] = useState<SpinState>(() => {
    if (!loading) {
      return 'IDLE';
    }
    if (ssr || safeDelay === 0) {
      return 'DISPLAY';
    }
    return 'DELAY';
  });

  if (loading && state === 'IDLE') {
    setState(safeDelay === 0 ? 'DISPLAY' : 'DELAY');
  } else if (loading && state === 'DELAY' && safeDelay === 0) {
    setState('DISPLAY');
  } else if (!loading && state === 'DELAY') {
    setState('IDLE');
  } else if (!loading && state === 'DISPLAY') {
    setState(safeMinDuration === 0 ? 'IDLE' : 'EXPIRE');
  } else if (!loading && state === 'EXPIRE' && safeMinDuration === 0) {
    setState('IDLE');
  } else if (loading && state === 'EXPIRE') {
    setState('DISPLAY');
  }

  useEffect(() => {
    if (state === 'DELAY') {
      const id = setTimeout(() => {
        setState('DISPLAY');
      }, safeDelay);
      return () => {
        clearTimeout(id);
      };
    }

    if (state === 'EXPIRE') {
      const id = setTimeout(() => {
        setState('IDLE');
      }, safeMinDuration);
      return () => {
        clearTimeout(id);
      };
    }

    return undefined;
  }, [state, safeDelay, safeMinDuration]);

  if (!isHydrated && ssr) {
    return loading;
  }

  return state === 'DISPLAY' || state === 'EXPIRE';
}

export default useSpinDelay;
