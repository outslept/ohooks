import { useEffect } from "react";
import { useLatest } from "./useLatest";

/**
 * Runs a callback repeatedly at a specified millisecond interval, pausing when `delay` is `null`.
 *
 * @category Effects
 * @param callback - Function invoked on each interval tick
 * @param delay - Interval duration in milliseconds, or `null` to pause
 *
 * @example
 * ```tsx
 * useInterval(() => {
 *   pollStatus();
 * }, isPolling ? 5000 : null);
 * ```
 */
export function useInterval(callback: () => void, delay: number | null): void {
  const savedCallback = useLatest(callback);

  useEffect(() => {
    if (delay === null) {
      return;
    }

    const id = setInterval(() => {
      savedCallback.current();
    }, delay);

    return () => {
      clearInterval(id);
    };
  }, [delay, savedCallback]);
}
