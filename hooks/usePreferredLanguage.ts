import { useCallback, useSyncExternalStore } from 'react';

function subscribe(onStoreChange: () => void): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  window.addEventListener('languagechange', onStoreChange);

  return () => {
    window.removeEventListener('languagechange', onStoreChange);
  };
}

/**
 * Tracks the user's preferred browser language (`navigator.language`) and updates on changes.
 *
 * @category Sensors
 * @param defaultLanguage - Fallback language tag used during SSR or when unavailable (default: `'en'`)
 * @returns The active BCP 47 language tag (e.g. `'en-US'`)
 *
 * @example
 * ```tsx
 * const language = usePreferredLanguage('en-US');
 * ```
 */
export function usePreferredLanguage(defaultLanguage = 'en'): string {
  const getSnapshot = useCallback((): string => {
    if (typeof navigator === 'undefined' || !navigator.language) {
      return defaultLanguage;
    }
    return navigator.language;
  }, [defaultLanguage]);

  const getServerSnapshot = useCallback((): string => {
    return defaultLanguage;
  }, [defaultLanguage]);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
