import { type PointerEvent as ReactPointerEvent, useRef, useState } from 'react';
import { useEventCallback } from './useEventCallback';

export type SwipeDirection = 'left' | 'right' | 'up' | 'down';

export interface UseSwipeOptions<T = Element> {
  threshold?: number;
  disabled?: boolean;
  onSwipeStart?: (event: ReactPointerEvent<T>) => void;
  onSwipeMove?: (
    delta: { x: number; y: number },
    direction: SwipeDirection | null,
    event: ReactPointerEvent<T>,
  ) => void;
  onSwipeEnd?: (
    direction: SwipeDirection | null,
    delta: { x: number; y: number },
    event: ReactPointerEvent<T>,
  ) => void;
  onSwipe?: (
    direction: SwipeDirection,
    delta: { x: number; y: number },
    event: ReactPointerEvent<T>,
  ) => void;
  onSwipeLeft?: (event: ReactPointerEvent<T>) => void;
  onSwipeRight?: (event: ReactPointerEvent<T>) => void;
  onSwipeUp?: (event: ReactPointerEvent<T>) => void;
  onSwipeDown?: (event: ReactPointerEvent<T>) => void;
}

export interface UseSwipeBindings<T = Element> {
  onPointerDown: (event: ReactPointerEvent<T>) => void;
  onPointerMove: (event: ReactPointerEvent<T>) => void;
  onPointerUp: (event: ReactPointerEvent<T>) => void;
  onPointerCancel: (event: ReactPointerEvent<T>) => void;
}

export interface UseSwipeReturn<T = Element> {
  isSwiping: boolean;
  direction: SwipeDirection | null;
  deltaX: number;
  deltaY: number;
  bindings: UseSwipeBindings<T>;
}

function getSwipeDirection(
  dx: number,
  dy: number,
  threshold: number,
): SwipeDirection | null {
  const absX = Math.abs(dx);
  const absY = Math.abs(dy);

  if (Math.max(absX, absY) < threshold) {
    return null;
  }

  if (absX >= absY) {
    return dx > 0 ? 'right' : 'left';
  }
  return dy > 0 ? 'down' : 'up';
}

export function useSwipe<T extends Element = HTMLElement>(
  options: UseSwipeOptions<T> = {},
): UseSwipeReturn<T> {
  const {
    threshold = 40,
    disabled = false,
    onSwipeStart,
    onSwipeMove,
    onSwipeEnd,
    onSwipe,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
  } = options;

  const [state, setState] = useState<{
    isSwiping: boolean;
    direction: SwipeDirection | null;
    deltaX: number;
    deltaY: number;
  }>({
    isSwiping: false,
    direction: null,
    deltaX: 0,
    deltaY: 0,
  });

  const pointerIdRef = useRef<number | null>(null);
  const startCoordsRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const onPointerDown = useEventCallback((event: ReactPointerEvent<T>) => {
    if (disabled || (event.pointerType === 'mouse' && event.button !== 0)) {
      return;
    }

    pointerIdRef.current = event.pointerId;
    startCoordsRef.current = { x: event.clientX, y: event.clientY };

    setState({
      isSwiping: true,
      direction: null,
      deltaX: 0,
      deltaY: 0,
    });

    onSwipeStart?.(event);
  });

  const onPointerMove = useEventCallback((event: ReactPointerEvent<T>) => {
    if (disabled || pointerIdRef.current !== event.pointerId) {
      return;
    }

    const deltaX = event.clientX - startCoordsRef.current.x;
    const deltaY = event.clientY - startCoordsRef.current.y;
    const direction = getSwipeDirection(deltaX, deltaY, threshold);

    setState({
      isSwiping: true,
      direction,
      deltaX,
      deltaY,
    });

    onSwipeMove?.({ x: deltaX, y: deltaY }, direction, event);
  });

  const finishSwipe = useEventCallback((event: ReactPointerEvent<T>) => {
    if (pointerIdRef.current !== event.pointerId) {
      return;
    }

    pointerIdRef.current = null;
    const deltaX = event.clientX - startCoordsRef.current.x;
    const deltaY = event.clientY - startCoordsRef.current.y;
    const direction = getSwipeDirection(deltaX, deltaY, threshold);

    setState({
      isSwiping: false,
      direction,
      deltaX: 0,
      deltaY: 0,
    });

    if (direction !== null) {
      onSwipe?.(direction, { x: deltaX, y: deltaY }, event);
      if (direction === 'left') onSwipeLeft?.(event);
      if (direction === 'right') onSwipeRight?.(event);
      if (direction === 'up') onSwipeUp?.(event);
      if (direction === 'down') onSwipeDown?.(event);
    }

    onSwipeEnd?.(direction, { x: deltaX, y: deltaY }, event);
  });

  return {
    isSwiping: state.isSwiping,
    direction: state.direction,
    deltaX: state.deltaX,
    deltaY: state.deltaY,
    bindings: {
      onPointerDown,
      onPointerMove,
      onPointerUp: finishSwipe,
      onPointerCancel: finishSwipe,
    },
  };
}
