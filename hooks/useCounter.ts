import { type SetStateAction, useState } from 'react';
import { useEventCallback } from './useEventCallback';

export interface UseCounterOptions {
  /** Minimum allowed counter value */
  min?: number;
  /** Maximum allowed counter value */
  max?: number;
}

export interface UseCounterReturn {
  /** Current counter value */
  count: number;
  /** Increments the counter by `delta` (default: `1`) */
  inc: (delta?: number) => void;
  /** Decrements the counter by `delta` (default: `1`) */
  dec: (delta?: number) => void;
  /** Sets the counter to a specific value or updater function (clamped to `min`/`max`) */
  set: (value: SetStateAction<number>) => void;
  /** Resets the counter back to `initialValue` (clamped to `min`/`max`) */
  reset: () => void;
}

function clamp(value: number, min?: number, max?: number): number {
  let result = value;
  if (min !== undefined && result < min) {
    result = min;
  }
  if (max !== undefined && result > max) {
    result = max;
  }
  return result;
}

/**
 * Manages a numeric counter state with optional min/max clamping and helper methods.
 *
 * @category State
 * @param initialValue - Initial counter value (default: `0`)
 * @param options - Optional minimum and maximum bounds
 * @returns Current `count` and updater methods (`inc`, `dec`, `set`, `reset`)
 *
 * @example
 * ```tsx
 * const { count, inc, dec, reset } = useCounter(0, { min: 0, max: 10 });
 * ```
 */
export function useCounter(
  initialValue = 0,
  options: UseCounterOptions = {},
): UseCounterReturn {
  const { min, max } = options;

  const [count, setCount] = useState<number>(() =>
    clamp(initialValue, min, max),
  );

  const set = useEventCallback((value: SetStateAction<number>) => {
    setCount((prev) => {
      const nextValue = typeof value === 'function' ? value(prev) : value;
      return clamp(nextValue, min, max);
    });
  });

  const inc = useEventCallback((delta = 1) => {
    set((prev) => prev + delta);
  });

  const dec = useEventCallback((delta = 1) => {
    set((prev) => prev - delta);
  });

  const reset = useEventCallback(() => {
    setCount(clamp(initialValue, min, max));
  });

  return { count, inc, dec, set, reset };
}
