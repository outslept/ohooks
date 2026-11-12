import { DependencyList, EffectCallback, useEffect } from "react";
import { useFirstMountState } from "./useFirstMountState";

export function useUpdateEffect(
  effect: EffectCallback,
  deps?: DependencyList
): void {
  const isFirstMount = useFirstMountState();

  useEffect(() => {
    if (isFirstMount) {
      return;
    }

    return effect();
  }, deps);
}
