import { useEffect, useRef, useState } from 'react';
import {
  EventListenerTarget,
  resolveTargetElement,
} from './useEventListener';
import { useLatest } from './useLatest';

/** Allowed movement axes for pointer dragging. */
export type PointerDragAxis = 'both' | 'x' | 'y';

/** Reactive state representing the current pointer drag operation. */
export interface PointerDragState {
  /** Whether a drag gesture is currently active. */
  isDragging: boolean;
  /** Current pointer X coordinate (`clientX`). */
  x: number;
  /** Current pointer Y coordinate (`clientY`). */
  y: number;
  /** Initial pointer X coordinate where the drag started. */
  startX: number;
  /** Initial pointer Y coordinate where the drag started. */
  startY: number;
  /** Total horizontal displacement from `startX`. */
  deltaX: number;
  /** Total vertical displacement from `startY`. */
  deltaY: number;
  /** Horizontal distance moved since the previous pointer move event. */
  movementX: number;
  /** Vertical distance moved since the previous pointer move event. */
  movementY: number;
}

/** Configuration options for `usePointerDrag`. */
export interface UsePointerDragOptions {
  /** Whether pointer drag tracking is enabled (default: `true`). */
  enabled?: boolean;
  /** Constrain drag deltas to a specific axis (default: `'both'`). */
  axis?: PointerDragAxis;
  /** Minimum distance in pixels before dragging starts (default: `0`). */
  threshold?: number;
  /** Disable text selection on `document.body` while dragging (default: `true`). */
  preventUserSelect?: boolean;
  /** Call `event.preventDefault()` on pointer events (default: `false`). */
  preventDefault?: boolean;
  /** Callback fired when dragging begins. */
  onDragStart?: (state: PointerDragState, event: PointerEvent) => void;
  /** Callback fired on each pointer move while dragging. */
  onDragMove?: (state: PointerDragState, event: PointerEvent) => void;
  /** Callback fired when the drag operation ends or is cancelled. */
  onDragEnd?: (state: PointerDragState, event: PointerEvent) => void;
}

const INITIAL_STATE: PointerDragState = {
  isDragging: false,
  x: 0,
  y: 0,
  startX: 0,
  startY: 0,
  deltaX: 0,
  deltaY: 0,
  movementX: 0,
  movementY: 0,
};

/**
 * Tracks pointer drag gestures on a target element with axis locking and movement thresholds.
 *
 * @category Sensors
 * @param target - Ref, element, or getter for the draggable element
 * @param options - Drag configuration and lifecycle callbacks
 * @returns Current pointer drag coordinates, deltas, and status
 *
 * @example
 * ```tsx
 * const boxRef = useRef<HTMLDivElement>(null);
 * const { isDragging, deltaX, deltaY } = usePointerDrag(boxRef);
 * ```
 */
export function usePointerDrag(
  target: EventListenerTarget<HTMLElement>,
  options: UsePointerDragOptions = {}
): PointerDragState {
  const {
    enabled = true,
    axis = 'both',
    threshold = 0,
    preventUserSelect = true,
    preventDefault = false,
  } = options;

  const optionsRef = useLatest(options);
  const [dragState, setDragState] = useState<PointerDragState>(INITIAL_STATE);

  const activePointerIdRef: { current: number | null } = useRef(null);
  const hasExceededThresholdRef: { current: boolean } = useRef(false);
  const startPointRef: { current: { x: number; y: number } } = useRef({
    x: 0,
    y: 0,
  });
  const lastPointRef: { current: { x: number; y: number } } = useRef({
    x: 0,
    y: 0,
  });
  const latestStateRef: { current: PointerDragState } = useRef(INITIAL_STATE);
  const savedUserSelectRef: { current: string | null } = useRef(null);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') {
      return;
    }

    const element = resolveTargetElement(target);
    if (!element) {
      return;
    }

    const restoreUserSelect = () => {
      if (
        savedUserSelectRef.current !== null &&
        typeof document !== 'undefined'
      ) {
        document.body.style.userSelect = savedUserSelectRef.current;
        savedUserSelectRef.current = null;
      }
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (activePointerIdRef.current !== null) {
        return;
      }
      if (event.button !== 0 && event.pointerType === 'mouse') {
        return;
      }

      if (preventDefault) {
        event.preventDefault();
      }

      activePointerIdRef.current = event.pointerId;
      hasExceededThresholdRef.current = threshold <= 0;
      startPointRef.current = { x: event.clientX, y: event.clientY };
      lastPointRef.current = { x: event.clientX, y: event.clientY };

      if (preventUserSelect && typeof document !== 'undefined') {
        savedUserSelectRef.current = document.body.style.userSelect;
        document.body.style.userSelect = 'none';
      }

      try {
        element.setPointerCapture?.(event.pointerId);
      } catch {
        // noop
      }

      if (hasExceededThresholdRef.current) {
        const nextState: PointerDragState = {
          isDragging: true,
          x: event.clientX,
          y: event.clientY,
          startX: event.clientX,
          startY: event.clientY,
          deltaX: 0,
          deltaY: 0,
          movementX: 0,
          movementY: 0,
        };
        latestStateRef.current = nextState;
        setDragState(nextState);
        optionsRef.current.onDragStart?.(nextState, event);
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (activePointerIdRef.current !== event.pointerId) {
        return;
      }

      const rawDeltaX = event.clientX - startPointRef.current.x;
      const rawDeltaY = event.clientY - startPointRef.current.y;

      if (!hasExceededThresholdRef.current) {
        const distance = Math.hypot(rawDeltaX, rawDeltaY);
        if (distance < threshold) {
          return;
        }
        hasExceededThresholdRef.current = true;

        const startState: PointerDragState = {
          isDragging: true,
          x: event.clientX,
          y: event.clientY,
          startX: startPointRef.current.x,
          startY: startPointRef.current.y,
          deltaX: axis === 'y' ? 0 : rawDeltaX,
          deltaY: axis === 'x' ? 0 : rawDeltaY,
          movementX: axis === 'y' ? 0 : rawDeltaX,
          movementY: axis === 'x' ? 0 : rawDeltaY,
        };
        lastPointRef.current = { x: event.clientX, y: event.clientY };
        latestStateRef.current = startState;
        setDragState(startState);
        optionsRef.current.onDragStart?.(startState, event);
        return;
      }

      if (preventDefault) {
        event.preventDefault();
      }

      const deltaX = axis === 'y' ? 0 : rawDeltaX;
      const deltaY = axis === 'x' ? 0 : rawDeltaY;
      const movementX =
        axis === 'y' ? 0 : event.clientX - lastPointRef.current.x;
      const movementY =
        axis === 'x' ? 0 : event.clientY - lastPointRef.current.y;

      lastPointRef.current = { x: event.clientX, y: event.clientY };

      const nextState: PointerDragState = {
        isDragging: true,
        x: event.clientX,
        y: event.clientY,
        startX: startPointRef.current.x,
        startY: startPointRef.current.y,
        deltaX,
        deltaY,
        movementX,
        movementY,
      };

      latestStateRef.current = nextState;
      setDragState(nextState);
      optionsRef.current.onDragMove?.(nextState, event);
    };

    const handlePointerUpOrCancel = (event: PointerEvent) => {
      if (activePointerIdRef.current !== event.pointerId) {
        return;
      }

      const wasDragging = hasExceededThresholdRef.current;
      activePointerIdRef.current = null;
      hasExceededThresholdRef.current = false;
      restoreUserSelect();

      try {
        if (element.hasPointerCapture?.(event.pointerId)) {
          element.releasePointerCapture(event.pointerId);
        }
      } catch {
        // noop
      }

      if (wasDragging) {
        const endState: PointerDragState = {
          ...latestStateRef.current,
          isDragging: false,
          movementX: 0,
          movementY: 0,
        };
        latestStateRef.current = endState;
        setDragState(endState);
        optionsRef.current.onDragEnd?.(endState, event);
      }
    };

    element.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUpOrCancel);
    window.addEventListener('pointercancel', handlePointerUpOrCancel);

    return () => {
      element.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUpOrCancel);
      window.removeEventListener('pointercancel', handlePointerUpOrCancel);
      activePointerIdRef.current = null;
      hasExceededThresholdRef.current = false;
      restoreUserSelect();
    };
  }, [
    target,
    enabled,
    axis,
    threshold,
    preventUserSelect,
    preventDefault,
    optionsRef,
  ]);

  return dragState;
}

export default usePointerDrag;
