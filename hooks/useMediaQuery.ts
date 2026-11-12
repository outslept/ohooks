import { useCallback, useSyncExternalStore } from 'react';

export interface UseMediaQueryOptions {
  defaultValue?: boolean;
}

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
