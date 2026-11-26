import { useState } from "react";
import {
  type ThrottledFunction,
  type ThrottleOptions,
  useThrottleCallback,
} from "./useThrottleCallback";
import { useUpdateEffect } from "./useUpdateEffect";

/**
 * Throttles state updates to a value so it changes at most once per `wait` milliseconds.
 *
 * @category Effects
 * @param value - The reactive value to throttle
 * @param wait - Throttle interval in milliseconds
 * @param options - Leading and trailing edge execution options
 * @returns A tuple of `[throttledValue, updateThrottledValue]`
 *
 * @example
 * ```tsx
 * const [throttledFilter] = useThrottleValue(filterText, 250);
 * ```
 */
export function useThrottleValue<T>(
  value: T,
  wait: number,
  options?: ThrottleOptions,
): [T, ThrottledFunction<(value: T) => void>] {
  const [throttledValue, setThrottledValue] = useState<T>(value);

  const updateThrottledValue = useThrottleCallback(setThrottledValue, wait, options);

  useUpdateEffect(() => {
    updateThrottledValue(value);
  }, [value, updateThrottledValue]);

  return [throttledValue, updateThrottledValue];
}
