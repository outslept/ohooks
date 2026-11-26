import { useEffect, useRef } from "react";

/**
 * Returns a read-only ref whose `current` value is `true` after the component has unmounted.
 *
 * @category Effects
 * @returns A ref object `{ readonly current: boolean }` indicating whether the component is unmounted
 *
 * @example
 * ```tsx
 * const unmountedRef = useUnmountedRef();
 * ```
 */
export function useUnmountedRef(): { readonly current: boolean } {
  const unmountedRef = useRef<boolean>(false);

  useEffect(() => {
    unmountedRef.current = false;
    return () => {
      unmountedRef.current = true;
    };
  }, []);

  return unmountedRef;
}
