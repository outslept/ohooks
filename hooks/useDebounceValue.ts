import { useState } from 'react';
import {
  type DebouncedFunction,
  type DebounceOptions,
  useDebounceCallback,
} from './useDebounceCallback';
import { useUpdateEffect } from './useUpdateEffect';

export function useDebounceValue<T>(
  value: T,
  delay: number,
  options?: DebounceOptions,
): [T, DebouncedFunction<(value: T) => void>] {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  const updateDebouncedValue = useDebounceCallback(
    setDebouncedValue,
    delay,
    options,
  );

  useUpdateEffect(() => {
    updateDebouncedValue(value);
  }, [value, updateDebouncedValue]);

  return [debouncedValue, updateDebouncedValue];
}
