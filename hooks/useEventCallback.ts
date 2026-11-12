import { useCallback } from 'react';
import { useLatest } from './useLatest';

export function useEventCallback<T extends (...args: never[]) => unknown>(
  fn: T,
): T {
  const fnRef = useLatest(fn);

  return useCallback(
    ((...args: never[]) => fnRef.current(...args)) as T,
    [fnRef],
  );
}
