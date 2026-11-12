import { useEffect, useRef, useState } from 'react';
import {
  EventListenerTarget,
  resolveTargetElement,
} from './useEventListener';
import { useLatest } from './useLatest';

export type SwipeDirection = 'up' | 'down' | 'left' | 'right' | 'none';

export interface SwipeState {
  isSwiping: boolean;
  direction: SwipeDirection;
  lengthX: number;
  lengthY: number;
}

export interface UseSwipeOptions {
  threshold?: number;
  enabled?: boolean;
  preventDefault?: boolean;
  onSwipeStart?: (event: PointerEvent) => void;
  onSwipe?: (state: SwipeState, event: PointerEvent) => void;
  onSwipeEnd?: (state: SwipeState, event: PointerEvent) => void;
  onSwipeLeft?: (event: PointerEvent) => void;
  onSwipeRight?: (event: PointerEvent) => void;
  onSwipeUp?: (event: PointerEvent) => void;
  onSwipeDown?: (event: PointerEvent) => void;
}

const INITIAL_SWIPE_STATE: SwipeState = {
  isSwiping: false,
  direction: 'none',
  lengthX: 0,
  lengthY: 0,
};

function computeDirection(
  lengthX: number,
  lengthY: number,
  threshold: number
): SwipeDirection {
  const absX = Math.abs(lengthX);
  const absY = Math.abs(lengthY);

  if (Math.max(absX, absY) < threshold) {
    return 'none';
  }

  if (absX >= absY) {
    return lengthX > 0 ? 'left' : 'right';
  }
  return lengthY > 0 ? 'up' : 'down';
}

export function useSwipe(
  target: EventListenerTarget<HTMLElement | Document | Window>,
  options: UseSwipeOptions = {}
): SwipeState {
  const {
    threshold = 50,
    enabled = true,
    preventDefault = false,
  } = options;

  const optionsRef = useLatest(options);
  const [state, setState] = useState<SwipeState>(INITIAL_SWIPE_STATE);

  const activePointerIdRef: { current: number | null } = useRef(null);
  const startCoordsRef: { current: { x: number; y: number } } = useRef({
    x: 0,
    y: 0,
  });
  const latestStateRef: { current: SwipeState } = useRef(INITIAL_SWIPE_STATE);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') {
      return;
    }

    const targetElement = resolveTargetElement(target);
    if (!targetElement) {
      return;
    }

    const handlePointerDown = (rawEvent: Event) => {
      const event = rawEvent as PointerEvent;
      if (activePointerIdRef.current !== null) {
        return;
      }

      activePointerIdRef.current = event.pointerId;
      startCoordsRef.current = { x: event.clientX, y: event.clientY };

      const nextState: SwipeState = {
        isSwiping: true,
        direction: 'none',
        lengthX: 0,
        lengthY: 0,
      };
      latestStateRef.current = nextState;
      setState(nextState);
      optionsRef.current.onSwipeStart?.(event);
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (activePointerIdRef.current !== event.pointerId) {
        return;
      }

      if (preventDefault) {
        event.preventDefault();
      }

      const lengthX = startCoordsRef.current.x - event.clientX;
      const lengthY = startCoordsRef.current.y - event.clientY;
      const direction = computeDirection(lengthX, lengthY, threshold);

      const nextState: SwipeState = {
        isSwiping: true,
        direction,
        lengthX,
        lengthY,
      };

      latestStateRef.current = nextState;
      setState(nextState);

      if (direction !== 'none') {
        optionsRef.current.onSwipe?.(nextState, event);
      }
    };

    const handlePointerUpOrCancel = (event: PointerEvent) => {
      if (activePointerIdRef.current !== event.pointerId) {
        return;
      }

      activePointerIdRef.current = null;
      const finalDirection = latestStateRef.current.direction;

      const endState: SwipeState = {
        ...latestStateRef.current,
        isSwiping: false,
      };
      latestStateRef.current = endState;
      setState(endState);

      optionsRef.current.onSwipeEnd?.(endState, event);

      if (finalDirection === 'left') {
        optionsRef.current.onSwipeLeft?.(event);
      } else if (finalDirection === 'right') {
        optionsRef.current.onSwipeRight?.(event);
      } else if (finalDirection === 'up') {
        optionsRef.current.onSwipeUp?.(event);
      } else if (finalDirection === 'down') {
        optionsRef.current.onSwipeDown?.(event);
      }
    };

    targetElement.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove, {
      passive: !preventDefault,
    });
    window.addEventListener('pointerup', handlePointerUpOrCancel);
    window.addEventListener('pointercancel', handlePointerUpOrCancel);

    return () => {
      targetElement.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUpOrCancel);
      window.removeEventListener('pointercancel', handlePointerUpOrCancel);
      activePointerIdRef.current = null;
    };
  }, [target, enabled, threshold, preventDefault, optionsRef]);

  return state;
}

export default useSwipe;
