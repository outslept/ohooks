import { useRef } from "react";
import { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect";

/**
 * Returns `true` during the initial render of a component and `false` on all subsequent renders.
 *
 * @category Effects
 * @returns `true` on the first mount render, `false` thereafter
 *
 * @example
 * ```tsx
 * const isFirstMount = useFirstMountState();
 * ```
 */
export function useFirstMountState(): boolean {
  const isFirst = useRef(true);

  useIsomorphicLayoutEffect(() => {
    isFirst.current = false;
  }, []);

  // oxlint-disable-next-line react/refs
  // eslint-disable-next-line react/refs, react-hooks/refs
  return isFirst.current;
}
