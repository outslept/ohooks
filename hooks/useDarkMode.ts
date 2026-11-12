import { useEventCallback } from './useEventCallback';
import { type EventListenerTarget } from './useEventListener';
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';
import { useLocalStorage } from './useLocalStorage';
import { useMediaQuery } from './useMediaQuery';

export interface UseDarkModeOptions {
  defaultValue?: boolean;
  localStorageKey?: string;
  initializeWithValue?: boolean;
  applyDarkClass?: boolean;
  darkClassName?: string;
  target?: EventListenerTarget<HTMLElement>;
}

export interface UseDarkModeReturn {
  isDarkMode: boolean;
  enable: () => void;
  disable: () => void;
  toggle: () => void;
  set: (value: boolean) => void;
  reset: () => void;
}

const COLOR_SCHEME_QUERY = '(prefers-color-scheme: dark)';

function resolveElement(
  target?: EventListenerTarget<HTMLElement>,
): HTMLElement | null {
  if (typeof document === 'undefined') {
    return null;
  }
  if (target === undefined) {
    return document.documentElement;
  }
  if (target === null) {
    return null;
  }
  if (typeof target === 'object' && 'current' in target) {
    return target.current;
  }
  return target;
}

export function useDarkMode(
  options: UseDarkModeOptions = {},
): UseDarkModeReturn {
  const {
    defaultValue = false,
    localStorageKey = 'use-dark-mode',
    initializeWithValue = true,
    applyDarkClass = true,
    darkClassName = 'dark',
    target,
  } = options;

  const isDarkOS = useMediaQuery(COLOR_SCHEME_QUERY, {
    defaultValue,
  });

  const [storedValue, setStoredValue, removeStoredValue] = useLocalStorage<
    boolean | null
  >(localStorageKey, null, { initializeWithValue });

  const isDarkMode = storedValue ?? isDarkOS;

  useIsomorphicLayoutEffect(() => {
    if (!applyDarkClass) {
      return;
    }

    const element = resolveElement(target);
    if (!element) {
      return;
    }

    if (isDarkMode) {
      element.classList.add(darkClassName);
    } else {
      element.classList.remove(darkClassName);
    }
  }, [applyDarkClass, darkClassName, isDarkMode, target]);

  const enable = useEventCallback(() => {
    setStoredValue(true);
  });

  const disable = useEventCallback(() => {
    setStoredValue(false);
  });

  const toggle = useEventCallback(() => {
    setStoredValue((prev) => !(prev ?? isDarkOS));
  });

  const set = useEventCallback((value: boolean) => {
    setStoredValue(value);
  });

  const reset = useEventCallback(() => {
    removeStoredValue();
  });

  return {
    isDarkMode,
    enable,
    disable,
    toggle,
    set,
    reset,
  };
}
