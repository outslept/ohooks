import { useCallback } from 'react';
import { useLatest } from './useLatest';

/**
 * Returns a referentially stable callback that always invokes the latest version of `fn`.
 *
 * @category Effects
 * @param fn - Callback function to stabilize
 * @returns Referentially stable wrapper function
 *
 * @example
 * ```tsx
 * const handleSubmit = useEventCallback((data: FormData) => {
 *   send(data, latestProp);
 * });
 * ```
 */
export function useEventCallback<T extends (...args: never[]) => unknown>(
  fn: T,
): T {
  const fnRef = useLatest(fn);

  return useCallback(
    ((...args: never[]) => fnRef.current(...args)) as T,
    [fnRef],
  );
}
