import { DependencyList, EffectCallback, useEffect } from "react";
import { useFirstMountState } from "./useFirstMountState";

/**
 * Runs a `useEffect` callback only on dependency updates, skipping the initial mount.
 *
 * @category Effects
 * @param effect - Effect callback executed on updates
 * @param deps - Dependency list triggering the effect
 *
 * @example
 * ```tsx
 * useUpdateEffect(() => {
 *   saveDraft(content);
 * }, [content]);
 * ```
 */
export function useUpdateEffect(effect: EffectCallback, deps?: DependencyList): void {
  const isFirstMount = useFirstMountState();

  useEffect(() => {
    if (isFirstMount) {
      return;
    }

    return effect();
    // oxlint-disable-next-line react-hooks/exhaustive-deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
