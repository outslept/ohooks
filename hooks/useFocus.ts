import { useCallback, useEffect, useState } from 'react';
import {
  EventListenerTarget,
  resolveTargetElement,
} from './useEventListener';
import { useLatest } from './useLatest';

export interface UseFocusOptions {
  focusVisible?: boolean;
  onFocus?: (event: FocusEvent) => void;
  onBlur?: (event: FocusEvent) => void;
}

export interface UseFocusReturn {
  isFocused: boolean;
  focus: (options?: FocusOptions) => void;
  blur: () => void;
}

export function useFocus<T extends HTMLElement = HTMLElement>(
  target: EventListenerTarget<T>,
  options: UseFocusOptions = {}
): UseFocusReturn {
  const { focusVisible = false, onFocus, onBlur } = options;
  const [isFocused, setIsFocused] = useState<boolean>(false);

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
      setIsFocused(false);
      return;
    }

    const checkIsCurrentlyFocused = (): boolean => {
      if (document.activeElement !== element) {
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
    };

    setIsFocused(checkIsCurrentlyFocused());

    const handleFocus = (event: FocusEvent) => {
      if (focusVisible) {
        try {
          if (!element.matches(':focus-visible')) {
            return;
          }
        } catch {
          // ignore if :focus-visible selector is unsupported
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
