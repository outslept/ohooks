import { useSyncExternalStore } from "react";

function subscribe(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener("online", onStoreChange);
  window.addEventListener("offline", onStoreChange);

  return () => {
    window.removeEventListener("online", onStoreChange);
    window.removeEventListener("offline", onStoreChange);
  };
}

function getSnapshot(): boolean {
  if (typeof navigator === "undefined" || typeof navigator.onLine !== "boolean") {
    return true;
  }
  return navigator.onLine;
}

function getServerSnapshot(): boolean {
  return true;
}

/**
 * Tracks whether the browser is currently connected to the network (`navigator.onLine`) using `useSyncExternalStore`.
 *
 * @category Sensors
 * @returns `true` when online (and during SSR), `false` when offline
 *
 * @example
 * ```tsx
 * const isOnline = useOnline();
 * ```
 */
export function useOnline(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
