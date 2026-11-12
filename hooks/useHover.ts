import { useBoolean } from './useBoolean';
import {
  type EventListenerTarget,
  useEventListener,
} from './useEventListener';

export interface UseHoverOptions {
  onEnter?: (event: MouseEvent) => void;
  onLeave?: (event: MouseEvent) => void;
}

export function useHover<T extends HTMLElement = HTMLElement>(
  target: EventListenerTarget<T>,
  options: UseHoverOptions = {},
): boolean {
  const { value: isHovered, setTrue, setFalse } = useBoolean(false);

  useEventListener(
    'mouseenter',
    (event: MouseEvent) => {
      setTrue();
      options.onEnter?.(event);
    },
    target,
  );

  useEventListener(
    'mouseleave',
    (event: MouseEvent) => {
      setFalse();
      options.onLeave?.(event);
    },
    target,
  );

  return isHovered;
}
