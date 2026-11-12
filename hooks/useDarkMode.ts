import { useCallback } from 'react';
import {
  EventListenerTarget,
  resolveTargetElement,
} from './useEventListener';
import { useHydrated } from './useHydrated';
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';
import { useLocalStorage } from './useLocalStorage';
import { useMediaQuery } from './useMediaQuery';

export type ColorSchemePreference = 'light' | 'dark' | 'system';

export interface UseDarkModeOptions {
  defaultValue?: boolean;
  storageKey?: string;
  darkClassName?: string;
  applyDarkClass?: boolean;
  target?: EventListenerTarget<HTMLElement>;
  initializeWithValue?: boolean;
}

export interface UseDarkModeReturn {
  isDarkMode: boolean;
  preference: ColorSchemePreference;
  toggle: () => void;
  enable: () => void;
  disable: () => void;
  setPreference: (preference: ColorSchemePreference) => void;
  resetToSystem: () => void;
}

const COLOR_SCHEME_QUERY = '(prefers-color-scheme: dark)';

export function useDarkMode(
  options: UseDarkModeOptions = {}
): UseDarkModeReturn {
  const {
    defaultValue = false,
    storageKey = 'color-scheme-preference',
    darkClassName = 'dark',
    applyDarkClass = true,
    target,
    initializeWithValue = false,
  } = options;

  const isHydrated = useHydrated();
  const isSystemDark = useMediaQuery(COLOR_SCHEME_QUERY, {
    defaultValue,
    initializeWithValue,
  });

  const [preference, setPreference] = useLocalStorage<ColorSchemePreference>(
    storageKey,
    'system',
    { initializeWithValue }
  );

  const resolvedDarkMode =
    preference === 'system' ? isSystemDark : preference === 'dark';

  const isDarkMode =
    initializeWithValue || isHydrated ? resolvedDarkMode : defaultValue;

  const enable = useCallback(() => {
    setPreference('dark');
  }, [setPreference]);

  const disable = useCallback(() => {
    setPreference('light');
  }, [setPreference]);

  const toggle = useCallback(() => {
    setPreference(resolvedDarkMode ? 'light' : 'dark');
  }, [resolvedDarkMode, setPreference]);

  const resetToSystem = useCallback(() => {
    setPreference('system');
  }, [setPreference]);

  useIsomorphicLayoutEffect(() => {
    if (!applyDarkClass || !darkClassName || typeof document === 'undefined') {
      return;
    }

    const element = resolveTargetElement(target, document.documentElement);
    if (!element) {
      return;
    }

    if (isDarkMode) {
      element.classList.add(darkClassName);
    } else {
      element.classList.remove(darkClassName);
    }

    return () => {
      element.classList.remove(darkClassName);
    };
  }, [isDarkMode, applyDarkClass, darkClassName, target]);

  return {
    isDarkMode,
    preference,
    toggle,
    enable,
    disable,
    setPreference,
    resetToSystem,
  };
}

export default useDarkMode;
