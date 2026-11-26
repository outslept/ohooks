import { useBoolean } from "./useBoolean";
import { type EventListenerTarget, useEventListener } from "./useEventListener";
import { matchesHotkey } from "./useHotkeys";

export type KeyPressFilter = string | ReadonlyArray<string> | ((event: KeyboardEvent) => boolean);

export interface UseKeyPressOptions {
  /** Target element, document, or window to listen on (default: `window`) */
  target?: EventListenerTarget<EventTarget>;
  /** Call `event.preventDefault()` when a matching key is pressed (default: `false`) */
  preventDefault?: boolean;
}

function matchesKeyFilter(filter: KeyPressFilter, event: KeyboardEvent): boolean {
  if (typeof filter === "function") {
    return filter(event);
  }

  const list = Array.isArray(filter) ? filter : [filter];
  return list.some((hotkey) => matchesHotkey(hotkey, event));
}

/**
 * Tracks whether a specific key, hotkey combination, or custom key predicate is currently held down.
 *
 * @category Sensors
 * @param keyFilter - Key name, hotkey combo, array of keys, or predicate function
 * @param options - Target element and `preventDefault` configuration
 * @returns `true` while the matching key is held down, `false` otherwise
 *
 * @example
 * ```tsx
 * const isShiftPressed = useKeyPress('shift');
 * ```
 */
export function useKeyPress(keyFilter: KeyPressFilter, options: UseKeyPressOptions = {}): boolean {
  const { target, preventDefault = false } = options;
  const { value: isPressed, setTrue, setFalse } = useBoolean(false);

  useEventListener(
    "keydown",
    (event: Event) => {
      if (!(event instanceof KeyboardEvent)) {
        return;
      }

      if (matchesKeyFilter(keyFilter, event)) {
        if (preventDefault) {
          event.preventDefault();
        }
        setTrue();
      }
    },
    target,
  );

  useEventListener(
    "keyup",
    (event: Event) => {
      if (!(event instanceof KeyboardEvent)) {
        return;
      }

      if (
        matchesKeyFilter(keyFilter, event) ||
        event.key === "Meta" ||
        event.key === "Control" ||
        event.key === "Alt" ||
        event.key === "Shift"
      ) {
        setFalse();
      }
    },
    target,
  );

  useEventListener("blur", () => {
    if (isPressed) {
      setFalse();
    }
  });

  return isPressed;
}

export default useKeyPress;
