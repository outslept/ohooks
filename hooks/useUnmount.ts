import { useEffect } from "react";
import { useLatest } from "./useLatest";

export function useUnmount(fn: () => void): void {
  const fnRef = useLatest(fn);

  useEffect(
    () => () => {
      fnRef.current();
    },
    [fnRef],
  );
}
