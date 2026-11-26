import { useCallback } from "react";
import { EventListenerTarget } from "./useEventListener";
import { useHydrated } from "./useHydrated";
import { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect";
import { useLocalStorage } from "./useLocalStorage";
import { useMediaQuery } from "./useMediaQuery";
import { resolveTargetElement } from "@/lib/utils";

export type ColorSchemePreference = "light" | "dark" | "system";

export interface UseDarkModeOptions {
  /** Fallback dark mode state used during SSR and before hydration (default: `false`) */
  defaultValue?: boolean;
  /** `localStorage` key used to persist the color scheme preference (default: `'color-scheme-preference'`) */
  storageKey?: string;
  /** CSS class name toggled on the target element when dark mode is active (default: `'dark'`) */
  darkClassName?: string;
  /** Whether to automatically toggle `darkClassName` on the target element (default: `true`) */
  applyDarkClass?: boolean;
  /** Target DOM element to apply `darkClassName` to (default: `document.documentElement`) */
  target?: EventListenerTarget<HTMLElement>;
  /** Read from `localStorage` and `matchMedia` immediately on initial render (default: `false`) */
  initializeWithValue?: boolean;
}

export interface UseDarkModeReturn {
  /** Whether dark mode is currently active */
  isDarkMode: boolean;
  /** Current user preference (`'light'`, `'dark'`, or `'system'`) */
  preference: ColorSchemePreference;
  /** Toggles between `'light'` and `'dark'` preferences */
  toggle: () => void;
  /** Explicitly sets the preference to `'dark'` */
  enable: () => void;
  /** Explicitly sets the preference to `'light'` */
  disable: () => void;
  /** Sets the color scheme preference directly */
  setPreference: (preference: ColorSchemePreference) => void;
  /** Resets the preference back to `'system'` */
  resetToSystem: () => void;
}

const COLOR_SCHEME_QUERY = "(prefers-color-scheme: dark)";

/**
 * Manages dark mode state with system preference detection, `localStorage` persistence, and automatic DOM class toggling.
 *
 * @category Browser
 * @param options - Configuration for storage key, CSS class syncing, and SSR hydration
 * @returns Dark mode state (`isDarkMode`, `preference`) and control helpers (`toggle`, `enable`, `disable`, `setPreference`, `resetToSystem`)
 *
 * @example
 * ```tsx
 * const { isDarkMode, preference, toggle, resetToSystem } = useDarkMode();
 * ```
 */
export function useDarkMode(options: UseDarkModeOptions = {}): UseDarkModeReturn {
  const {
    defaultValue = false,
    storageKey = "color-scheme-preference",
    darkClassName = "dark",
    applyDarkClass = true,
    target,
    initializeWithValue = false,
  } = options;

  const isHydrated = useHydrated();
  const isSystemDark = useMediaQuery(COLOR_SCHEME_QUERY, {
    defaultValue,
  });

  const [preference, setPreference] = useLocalStorage<ColorSchemePreference>(storageKey, "system", {
    initializeWithValue,
  });

  const resolvedDarkMode = preference === "system" ? isSystemDark : preference === "dark";

  const isDarkMode = initializeWithValue || isHydrated ? resolvedDarkMode : defaultValue;

  const enable = useCallback(() => {
    setPreference("dark");
  }, [setPreference]);

  const disable = useCallback(() => {
    setPreference("light");
  }, [setPreference]);

  const toggle = useCallback(() => {
    setPreference(resolvedDarkMode ? "light" : "dark");
  }, [resolvedDarkMode, setPreference]);

  const resetToSystem = useCallback(() => {
    setPreference("system");
  }, [setPreference]);

  useIsomorphicLayoutEffect(() => {
    if (!applyDarkClass || !darkClassName || typeof document === "undefined") {
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
