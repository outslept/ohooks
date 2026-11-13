import { useState } from 'react';
import {
  type DebouncedFunction,
  type DebounceOptions,
  useDebounceCallback,
} from './useDebounceCallback';
import { useUpdateEffect } from './useUpdateEffect';

/**
 * Debounces a reactive value and provides a debounced setter with `.cancel()`, `.flush()`, and `.isPending()` controls.
 *
 * @category Effects
 * @param value - Value to debounce
 * @param delay - Delay in milliseconds
 * @param options - Debounce options (`leading`, `trailing`, `maxWait`)
 * @returns Tuple of `[debouncedValue, updateDebouncedValue]`
 *
 * @example
 * ```tsx
 * const [debouncedQuery, setDebouncedQuery] = useDebounceValue(searchQuery, 300);
 * ```
 */
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
