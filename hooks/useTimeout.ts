import { useEffect } from "react";
import { useLatest } from "./useLatest";

/**
 * Declarative `setTimeout` hook that invokes a callback after `delay` milliseconds.
 *
 * @category Effects
 * @param callback - Function to invoke when the timer expires
 * @param delay - Delay in milliseconds, or `null` to pause/disable the timer
 *
 * @example
 * ```tsx
 * useTimeout(() => {
 *   setVisible(false);
 * }, 3000);
 * ```
 */
export function useTimeout(callback: () => void, delay: number | null): void {
  const savedCallback = useLatest(callback);

  useEffect(() => {
    if (delay === null) {
      return;
    }

    const id = setTimeout(() => {
      savedCallback.current();
    }, delay);

    return () => {
      clearTimeout(id);
    };
  }, [delay, savedCallback]);
}
