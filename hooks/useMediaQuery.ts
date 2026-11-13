import { useCallback, useSyncExternalStore } from 'react';

export interface UseMediaQueryOptions {
  /** Fallback match state used during SSR and when `matchMedia` is unavailable (default: `false`) */
  defaultValue?: boolean;
}

/**
 * Evaluates a CSS media query string and subscribes to changes reactively using `useSyncExternalStore`.
 *
 * @category Sensors
 * @param query - CSS media query string (e.g., `'(min-width: 768px)'`)
 * @param options - Configuration for SSR fallback value
 * @returns `true` if the media query currently matches, `false` otherwise
 *
 * @example
 * ```tsx
 * const isDesktop = useMediaQuery('(min-width: 1024px)');
 * ```
 */
export function useMediaQuery(
  query: string,
  options: UseMediaQueryOptions = {},
): boolean {
  const { defaultValue = false } = options;

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (
        typeof window === 'undefined' ||
        typeof window.matchMedia !== 'function'
      ) {
        return () => {};
      }

      const matchMediaList = window.matchMedia(query);

      if (typeof matchMediaList.addEventListener === 'function') {
        matchMediaList.addEventListener('change', onStoreChange);
        return () => {
          matchMediaList.removeEventListener('change', onStoreChange);
        };
      }

      matchMediaList.addListener(onStoreChange);
      return () => {
        matchMediaList.removeListener(onStoreChange);
      };
    },
    [query],
  );

  const getSnapshot = useCallback((): boolean => {
    if (
      typeof window === 'undefined' ||
      typeof window.matchMedia !== 'function'
    ) {
      return defaultValue;
    }

    return window.matchMedia(query).matches;
  }, [query, defaultValue]);

  const getServerSnapshot = useCallback((): boolean => {
    return defaultValue;
  }, [defaultValue]);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
