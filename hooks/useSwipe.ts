import { useEffect, useRef, useState } from 'react';
import {
  EventListenerTarget,
  resolveTargetElement,
} from './useEventListener';
import { useLatest } from './useLatest';

/** Detected cardinal direction of a swipe gesture. */
export type SwipeDirection = 'up' | 'down' | 'left' | 'right' | 'none';

/** Reactive state representing the current or most recent swipe gesture. */
export interface SwipeState {
  /** Whether a pointer swipe gesture is currently in progress. */
  isSwiping: boolean;
  /** Detected swipe direction once `threshold` is exceeded. */
  direction: SwipeDirection;
  /** Horizontal distance swiped (`startX - currentX`). */
  lengthX: number;
  /** Vertical distance swiped (`startY - currentY`). */
  lengthY: number;
}

/** Configuration options and directional callbacks for `useSwipe`. */
export interface UseSwipeOptions {
  /** Minimum distance in pixels required to recognize a swipe direction (default: `50`). */
  threshold?: number;
  /** Whether swipe detection is active (default: `true`). */
  enabled?: boolean;
  /** Call `event.preventDefault()` during pointer movement (default: `false`). */
  preventDefault?: boolean;
  /** Callback fired when a pointer down initiates a swipe. */
  onSwipeStart?: (event: PointerEvent) => void;
  /** Callback fired during pointer movement once `threshold` is exceeded. */
  onSwipe?: (state: SwipeState, event: PointerEvent) => void;
  /** Callback fired when the pointer is released or cancelled. */
  onSwipeEnd?: (state: SwipeState, event: PointerEvent) => void;
  /** Callback fired when a swipe finishes in the `'left'` direction. */
  onSwipeLeft?: (event: PointerEvent) => void;
  /** Callback fired when a swipe finishes in the `'right'` direction. */
  onSwipeRight?: (event: PointerEvent) => void;
  /** Callback fired when a swipe finishes in the `'up'` direction. */
  onSwipeUp?: (event: PointerEvent) => void;
  /** Callback fired when a swipe finishes in the `'down'` direction. */
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

/**
 * Detects pointer swipe gestures and directions on a target element.
 *
 * @category Sensors
 * @param target - Ref, element, `document`, or `window` to attach swipe listeners to
 * @param options - Distance threshold and directional swipe callbacks
 * @returns Current `SwipeState` (`isSwiping`, `direction`, `lengthX`, `lengthY`)
 *
 * @example
 * ```tsx
 * const cardRef = useRef<HTMLDivElement>(null);
 * const { direction } = useSwipe(cardRef, {
 *   onSwipeLeft: () => nextSlide(),
 *   onSwipeRight: () => prevSlide(),
 * });
 * ```
 */
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
