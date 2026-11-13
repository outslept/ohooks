import { useRef } from 'react';
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';

/** Comparator function used to determine if two values are equal. */
export type EqualityComparator<T> = (prev: T, next: T) => boolean;

/**
 * Returns the most recent distinct value prior to the current value.
 *
 * @category State
 * @param value - The value to track
 * @param isEqual - Custom equality comparator (default: `Object.is`)
 * @returns The previous distinct value, or `undefined` before the first change
 *
 * @example
 * ```tsx
 * const prevDistinctId = usePreviousDistinct(selectedId);
 * ```
 */
export function usePreviousDistinct<T>(
  value: T,
  isEqual: EqualityComparator<T> = Object.is,
): T | undefined {
  const committedCurrentRef = useRef<T>(value);
  const committedPrevRef = useRef<T | undefined>(undefined);

  const hasChanged = !isEqual(committedCurrentRef.current, value);
  const previousDistinct = hasChanged
    ? committedCurrentRef.current
    : committedPrevRef.current;

  useIsomorphicLayoutEffect(() => {
    if (!isEqual(committedCurrentRef.current, value)) {
      committedPrevRef.current = committedCurrentRef.current;
      committedCurrentRef.current = value;
    }
  });

  return previousDistinct;
}
