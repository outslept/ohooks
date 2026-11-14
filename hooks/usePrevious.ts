import { useEffect, useRef } from "react";

/**
 * Returns the value passed on the previous render.
 *
 * @category State
 * @param value - The value to track across renders
 * @returns The value from the previous render, or `undefined` on the initial render
 *
 * @example
 * ```tsx
 * const prevCount = usePrevious(count);
 * ```
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  // oxlint-disable-next-line react/refs
  // eslint-disable-next-line react/refs, react-hooks/refs
  return ref.current;
}
