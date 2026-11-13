import { useRef } from "react";
import { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect";

/**
 * Returns a ref object whose `.current` property is synchronously updated to the latest value after every render.
 *
 * @category Effects
 * @param value - Value to keep synchronized in `.current`
 * @returns Readonly ref object containing the latest `value`
 *
 * @example
 * ```tsx
 * const latestCallbackRef = useLatest(onEvent);
 * ```
 */
export function useLatest<T>(value: T): { readonly current: T } {
  const ref = useRef<T>(value);

  useIsomorphicLayoutEffect(() => {
    ref.current = value;
  });

  return ref;
}
