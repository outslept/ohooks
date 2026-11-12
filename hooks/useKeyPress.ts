import { useBoolean } from './useBoolean';
import {
  type EventListenerTarget,
  useEventListener,
} from './useEventListener';
import { matchesHotkey } from './useHotkeys';

export type KeyPressFilter =
  | string
  | ReadonlyArray<string>
  | ((event: KeyboardEvent) => boolean);

export interface UseKeyPressOptions {
  target?: EventListenerTarget<EventTarget>;
  preventDefault?: boolean;
}

function matchesKeyFilter(
  filter: KeyPressFilter,
  event: KeyboardEvent,
): boolean {
  if (typeof filter === 'function') {
    return filter(event);
  }

  const list = Array.isArray(filter) ? filter : [filter];
  return list.some((hotkey) => matchesHotkey(hotkey, event));
}

export function useKeyPress(
  keyFilter: KeyPressFilter,
  options: UseKeyPressOptions = {},
): boolean {
  const { target, preventDefault = false } = options;
  const { value: isPressed, setTrue, setFalse } = useBoolean(false);

  useEventListener(
    'keydown',
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
    'keyup',
    (event: Event) => {
      if (!(event instanceof KeyboardEvent)) {
        return;
      }

      if (
        matchesKeyFilter(keyFilter, event) ||
        event.key === 'Meta' ||
        event.key === 'Control' ||
        event.key === 'Alt' ||
        event.key === 'Shift'
      ) {
        setFalse();
      }
    },
    target,
  );

  useEventListener('blur', () => {
    if (isPressed) {
      setFalse();
    }
  });

  return isPressed;
}
