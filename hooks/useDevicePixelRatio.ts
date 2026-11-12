import { useCallback, useSyncExternalStore } from 'react';

export interface UseDevicePixelRatioOptions {
  defaultValue?: number;
}

function subscribe(onStoreChange: () => void): () => void {
  if (
    typeof window === 'undefined' ||
    typeof window.matchMedia !== 'function'
  ) {
    return () => {};
  }

  let mediaQueryList: MediaQueryList | null = null;

  const cleanup = (): void => {
    if (!mediaQueryList) {
      return;
    }
    if (typeof mediaQueryList.removeEventListener === 'function') {
      mediaQueryList.removeEventListener('change', handleChange);
    } else {
      mediaQueryList.removeListener(handleChange);
    }
    mediaQueryList = null;
  };

  const listen = (): void => {
    cleanup();
    const dpr = window.devicePixelRatio || 1;
    mediaQueryList = window.matchMedia(`(resolution: ${dpr}dppx)`);

    if (typeof mediaQueryList.addEventListener === 'function') {
      mediaQueryList.addEventListener('change', handleChange);
    } else {
      mediaQueryList.addListener(handleChange);
    }
  };

  function handleChange(): void {
    listen();
    onStoreChange();
  }

  listen();

  return cleanup;
}

export function useDevicePixelRatio(
  options: UseDevicePixelRatioOptions = {},
): number {
  const { defaultValue = 1 } = options;

  const getSnapshot = useCallback((): number => {
    if (typeof window === 'undefined') {
      return defaultValue;
    }
    return window.devicePixelRatio || defaultValue;
  }, [defaultValue]);

  const getServerSnapshot = useCallback((): number => {
    return defaultValue;
  }, [defaultValue]);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
