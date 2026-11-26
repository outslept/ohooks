import { useSyncExternalStore } from "react";

function emptySubscribe(): () => void {
  return () => {};
}

function getSnapshot(): boolean {
  return true;
}

function getServerSnapshot(): boolean {
  return false;
}

/**
 * Returns `false` during server-side rendering and initial hydration, and `true` once hydrated on the client.
 *
 * @category Effects
 * @returns `true` on the client after hydration, `false` during SSR
 *
 * @example
 * ```tsx
 * const isHydrated = useHydrated();
 * if (!isHydrated) return <Skeleton />;
 * ```
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(emptySubscribe, getSnapshot, getServerSnapshot);
}
