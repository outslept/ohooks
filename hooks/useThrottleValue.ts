import { useState } from 'react';
import {
  type ThrottledFunction,
  type ThrottleOptions,
  useThrottleCallback,
} from './useThrottleCallback';
import { useUpdateEffect } from './useUpdateEffect';

export function useThrottleValue<T>(
  value: T,
  wait: number,
  options?: ThrottleOptions,
): [T, ThrottledFunction<(value: T) => void>] {
  const [throttledValue, setThrottledValue] = useState<T>(value);

  const updateThrottledValue = useThrottleCallback(
    setThrottledValue,
    wait,
    options,
  );

  useUpdateEffect(() => {
    updateThrottledValue(value);
  }, [value, updateThrottledValue]);

  return [throttledValue, updateThrottledValue];
}
