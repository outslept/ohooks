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
