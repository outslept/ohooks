import { useBoolean } from './useBoolean';
import {
  type EventListenerTarget,
  useEventListener,
} from './useEventListener';

export interface UseFocusOptions {
  within?: boolean;
  onFocus?: (event: FocusEvent) => void;
  onBlur?: (event: FocusEvent) => void;
}

export function useFocus<T extends HTMLElement = HTMLElement>(
  target: EventListenerTarget<T>,
  options: UseFocusOptions = {},
): boolean {
  const { within = false, onFocus, onBlur } = options;
  const { value: isFocused, setTrue, setFalse } = useBoolean(false);

  useEventListener(
    within ? 'focusin' : 'focus',
    (event: FocusEvent) => {
      if (!isFocused) {
        setTrue();
      }
      onFocus?.(event);
    },
    target,
  );

  useEventListener(
    within ? 'focusout' : 'blur',
    (event: FocusEvent) => {
      if (within) {
        const currentTarget = event.currentTarget as Node | null;
        const relatedTarget = event.relatedTarget as Node | null;
        if (
          currentTarget &&
          relatedTarget &&
          currentTarget.contains(relatedTarget)
        ) {
          return;
        }
      }
      setFalse();
      onBlur?.(event);
    },
    target,
  );

  return isFocused;
}
