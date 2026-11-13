import { useEffect } from "react";
import { useLatest } from "./useLatest";

/**
 * Executes a cleanup callback when the component unmounts, always using the latest function reference.
 *
 * @category Effects
 * @param fn - Cleanup callback invoked on unmount
 *
 * @example
 * ```tsx
 * useUnmount(() => {
 *   analytics.trackExit(latestStep);
 * });
 * ```
 */
export function useUnmount(fn: () => void): void {
  const fnRef = useLatest(fn);

  useEffect(
    () => () => {
      fnRef.current();
    },
    [fnRef],
  );
}
