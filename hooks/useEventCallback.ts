import { useCallback } from "react";
import { useLatest } from "./useLatest";

export function useEventCallback<Args extends unknown[], R>(
  fn: (...args: Args) => R,
): (...args: Args) => R {
  const fnRef = useLatest(fn);

  return useCallback((...args: Args): R => fnRef.current(...args), [fnRef])
}
