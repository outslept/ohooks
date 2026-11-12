import { useSyncExternalStore } from 'react';

function subscribe(onStoreChange: () => void): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  window.addEventListener('online', onStoreChange);
  window.addEventListener('offline', onStoreChange);

  return () => {
    window.removeEventListener('online', onStoreChange);
    window.removeEventListener('offline', onStoreChange);
  };
}

function getSnapshot(): boolean {
  if (
    typeof navigator === 'undefined' ||
    typeof navigator.onLine !== 'boolean'
  ) {
    return true;
  }
  return navigator.onLine;
}

function getServerSnapshot(): boolean {
  return true;
}

export function useOnline(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
