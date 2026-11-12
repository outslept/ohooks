import { useState } from 'react';
import { useEventCallback } from './useEventCallback';
import {
  type EventListenerTarget,
  useEventListener,
} from './useEventListener';
import { useThrottleCallback } from './useThrottleCallback';

export interface MouseState {
  screenX: number;
  screenY: number;
  clientX: number;
  clientY: number;
  pageX: number;
  pageY: number;
  elementX: number;
  elementY: number;
  elementPositionX: number;
  elementPositionY: number;
  elementWidth: number;
  elementHeight: number;
  isInside: boolean;
}

export interface UseMouseOptions {
  throttleMs?: number;
}

const INITIAL_MOUSE_STATE: MouseState = {
  screenX: 0,
  screenY: 0,
  clientX: 0,
  clientY: 0,
  pageX: 0,
  pageY: 0,
  elementX: 0,
  elementY: 0,
  elementPositionX: 0,
  elementPositionY: 0,
  elementWidth: 0,
  elementHeight: 0,
  isInside: false,
};

function resolveElement<T extends Element>(
  target?: EventListenerTarget<T>,
): T | null {
  if (!target) {
    return null;
  }
  if (typeof target === 'object' && 'current' in target) {
    return target.current;
  }
  return target;
}

export function useMouse<T extends Element = HTMLElement>(
  target?: EventListenerTarget<T>,
  options: UseMouseOptions = {},
): MouseState {
  const { throttleMs = 0 } = options;

  const [state, setState] = useState<MouseState>(INITIAL_MOUSE_STATE);

  const updateMouseState = useEventCallback((event: MouseEvent) => {
    const baseState: MouseState = {
      screenX: event.screenX,
      screenY: event.screenY,
      clientX: event.clientX,
      clientY: event.clientY,
      pageX: event.pageX,
      pageY: event.pageY,
      elementX: 0,
      elementY: 0,
      elementPositionX: 0,
      elementPositionY: 0,
      elementWidth: 0,
      elementHeight: 0,
      isInside: false,
    };

    const element = resolveElement(target);
    if (element && typeof window !== 'undefined') {
      const rect = element.getBoundingClientRect();
      const elementPositionX = rect.left + window.scrollX;
      const elementPositionY = rect.top + window.scrollY;
      const elementX = event.pageX - elementPositionX;
      const elementY = event.pageY - elementPositionY;
      const isInside =
        rect.width > 0 &&
        rect.height > 0 &&
        elementX >= 0 &&
        elementY >= 0 &&
        elementX <= rect.width &&
        elementY <= rect.height;

      baseState.elementX = elementX;
      baseState.elementY = elementY;
      baseState.elementPositionX = elementPositionX;
      baseState.elementPositionY = elementPositionY;
      baseState.elementWidth = rect.width;
      baseState.elementHeight = rect.height;
      baseState.isInside = isInside;
    }

    setState(baseState);
  });

  const throttledUpdate = useThrottleCallback(updateMouseState, throttleMs);

  const handleMouseMove = (event: MouseEvent): void => {
    if (throttleMs > 0) {
      throttledUpdate(event);
    } else {
      updateMouseState(event);
    }
  };

  useEventListener('mousemove', handleMouseMove, undefined, { passive: true });

  return state;
}
