import { useRef } from 'react';
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';

export type EqualityComparator<T> = (prev: T, next: T) => boolean;

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
