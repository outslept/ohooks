import { useCallback, useSyncExternalStore } from "react";
import { useEventCallback } from "./useEventCallback";

export interface SetHashOptions {
  /** Use `history.replaceState` instead of `history.pushState` (default: `false`) */
  replace?: boolean;
}

export interface UseHashOptions {
  /** Fallback hash string used during SSR (default: `''`) */
  defaultHash?: string;
}

const CUSTOM_HASH_EVENT = "custom-hash-change";

function normalizeHash(rawHash: string): string {
  if (!rawHash || rawHash === "#") {
    return "";
  }
  return rawHash.startsWith("#") ? rawHash : `#${rawHash}`;
}

function subscribe(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener("hashchange", onStoreChange);
  window.addEventListener("popstate", onStoreChange);
  window.addEventListener(CUSTOM_HASH_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("hashchange", onStoreChange);
    window.removeEventListener("popstate", onStoreChange);
    window.removeEventListener(CUSTOM_HASH_EVENT, onStoreChange);
  };
}

/**
 * Reads and updates `window.location.hash` reactively using `useSyncExternalStore`.
 *
 * @category Storage
 * @param options - Configuration for the SSR fallback hash
 * @returns Tuple of `[hash, setHash]` where `hash` is normalized with a leading `'#'` (or `''` when empty)
 *
 * @example
 * ```tsx
 * const [hash, setHash] = useHash();
 * // setHash('section-2', { replace: true });
 * ```
 */
export function useHash(
  options: UseHashOptions = {},
): [string, (nextHash: string, navOptions?: SetHashOptions) => void] {
  const { defaultHash = "" } = options;
  const normalizedDefault = normalizeHash(defaultHash);

  const getSnapshot = useCallback((): string => {
    if (typeof window === "undefined") {
      return normalizedDefault;
    }
    return normalizeHash(window.location.hash);
  }, [normalizedDefault]);

  const getServerSnapshot = useCallback((): string => {
    return normalizedDefault;
  }, [normalizedDefault]);

  const hash = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setHash = useEventCallback((nextHash: string, navOptions: SetHashOptions = {}) => {
    if (typeof window === "undefined") {
      return;
    }

    const { replace = false } = navOptions;
    const formatted = normalizeHash(nextHash);
    const current = normalizeHash(window.location.hash);

    if (formatted === current) {
      return;
    }

    const nextUrl = `${window.location.pathname}${window.location.search}${formatted}`;

    if (replace) {
      window.history.replaceState(window.history.state, "", nextUrl);
    } else {
      window.history.pushState(window.history.state, "", nextUrl);
    }

    window.dispatchEvent(new CustomEvent(CUSTOM_HASH_EVENT));
  });

  return [hash, setHash];
}
