import { useCallback, useEffect, useState } from 'react';
import {
  EventListenerTarget,
} from './useEventListener';
import { useLatest } from './useLatest';
import { resolveTargetElement } from '@/lib/utils';

export interface UseFocusOptions {
  /** Only mark as focused when the element matches `:focus-visible` (default: `false`) */
  focusVisible?: boolean;
  /** Callback fired when the element receives focus */
  onFocus?: (event: FocusEvent) => void;
  /** Callback fired when the element loses focus */
  onBlur?: (event: FocusEvent) => void;
}

export interface UseFocusReturn {
  /** Whether the target element is currently focused */
  isFocused: boolean;
  /** Programmatically focuses the target element */
  focus: (options?: FocusOptions) => void;
  /** Programmatically removes focus from the target element */
  blur: () => void;
}

function checkIsTargetFocused<T extends HTMLElement>(
  target: EventListenerTarget<T>,
  focusVisible: boolean
): boolean {
  if (typeof document === 'undefined') {
    return false;
  }
  const element = resolveTargetElement(target);
  if (!element || document.activeElement !== element) {
    return false;
  }
  if (focusVisible) {
    try {
      return element.matches(':focus-visible');
    } catch {
      return true;
    }
  }
  return true;
}

/**
 * Tracks and controls the focus state of a target DOM element, with optional `:focus-visible` filtering.
 *
 * @category DOM
 * @param target - Target DOM element or React ref
 * @param options - Configuration for `:focus-visible` matching and focus/blur callbacks
 * @returns Focus state (`isFocused`) and programmatic `focus` / `blur` methods
 *
 * @example
 * ```tsx
 * const { isFocused, focus, blur } = useFocus(inputRef, { focusVisible: true });
 * ```
 */
export function useFocus<T extends HTMLElement = HTMLElement>(
  target: EventListenerTarget<T>,
  options: UseFocusOptions = {}
): UseFocusReturn {
  const { focusVisible = false, onFocus, onBlur } = options;
  const [isFocused, setIsFocused] = useState<boolean>(() =>
    checkIsTargetFocused(target, focusVisible)
  );
  const [prevTarget, setPrevTarget] = useState<EventListenerTarget<T>>(target);
  const [prevFocusVisible, setPrevFocusVisible] =
    useState<boolean>(focusVisible);

  if (prevTarget !== target || prevFocusVisible !== focusVisible) {
    setPrevTarget(target);
    setPrevFocusVisible(focusVisible);
    const nextFocused = checkIsTargetFocused(target, focusVisible);
    if (isFocused !== nextFocused) {
      setIsFocused(nextFocused);
    }
  }

  const onFocusRef = useLatest(onFocus);
  const onBlurRef = useLatest(onBlur);

  const focus = useCallback(
    (focusOptions?: FocusOptions) => {
      const element = resolveTargetElement(target);
      element?.focus(focusOptions);
    },
    [target]
  );

  const blur = useCallback(() => {
    const element = resolveTargetElement(target);
    element?.blur();
  }, [target]);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    const element = resolveTargetElement(target);
    if (!element) {
      return;
    }

    const handleFocus = (event: FocusEvent) => {
      if (focusVisible) {
        try {
          if (!element.matches(':focus-visible')) {
            return;
          }
        } catch {
        }
      }
      setIsFocused(true);
      onFocusRef.current?.(event);
    };

    const handleBlur = (event: FocusEvent) => {
      setIsFocused(false);
      onBlurRef.current?.(event);
    };

    element.addEventListener('focus', handleFocus);
    element.addEventListener('blur', handleBlur);

    return () => {
      element.removeEventListener('focus', handleFocus);
      element.removeEventListener('blur', handleBlur);
    };
  }, [target, focusVisible, onFocusRef, onBlurRef]);

  return {
    isFocused,
    focus,
    blur,
  };
}

export default useFocus;
