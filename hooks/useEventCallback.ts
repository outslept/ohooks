import { useCallback } from "react";
import { useLatest } from "./useLatest";

export function useEventCallback<T extends Function>(fn: T): T {
  const fnRef = useLatest(fn);

  return useCallback(
    ((...args: unknown[]) =>
      (fnRef.current as unknown as (...args: unknown[]) => unknown)(
        ...args,
      )) as unknown as T,
    [fnRef],
  );
}
