import { useSyncExternalStore } from 'react';

function subscribe(onStoreChange: () => void): () => void {
  if (typeof document === 'undefined') {
    return () => {};
  }

  document.addEventListener('visibilitychange', onStoreChange);

  return () => {
    document.removeEventListener('visibilitychange', onStoreChange);
  };
}

function getSnapshot(): DocumentVisibilityState {
  if (typeof document === 'undefined') {
    return 'visible';
  }
  return document.visibilityState;
}

function getServerSnapshot(): DocumentVisibilityState {
  return 'visible';
}

export function useDocumentVisibility(): DocumentVisibilityState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
