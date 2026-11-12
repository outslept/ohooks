import { type PointerEvent as ReactPointerEvent, useRef, useState } from 'react';
import { useEventCallback } from './useEventCallback';
import { useUnmount } from './useUnmount';

export interface PointerDragState {
  isDragging: boolean;
  x: number;
  y: number;
  startX: number;
  startY: number;
  deltaX: number;
  deltaY: number;
  movementX: number;
  movementY: number;
}

export interface UsePointerDragOptions<T = Element> {
  disabled?: boolean;
  lockUserSelect?: boolean;
  preventDefault?: boolean;
  onStart?: (state: PointerDragState, event: ReactPointerEvent<T>) => void;
  onMove?: (state: PointerDragState, event: ReactPointerEvent<T>) => void;
  onEnd?: (state: PointerDragState, event: ReactPointerEvent<T>) => void;
}

export interface UsePointerDragBindings<T = Element> {
  onPointerDown: (event: ReactPointerEvent<T>) => void;
  onPointerMove: (event: ReactPointerEvent<T>) => void;
  onPointerUp: (event: ReactPointerEvent<T>) => void;
  onPointerCancel: (event: ReactPointerEvent<T>) => void;
  onLostPointerCapture: (event: ReactPointerEvent<T>) => void;
}

export interface UsePointerDragReturn<T = Element> extends PointerDragState {
  bindings: UsePointerDragBindings<T>;
}

const INITIAL_DRAG_STATE: PointerDragState = {
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

export function usePointerDrag<T extends Element = HTMLElement>(
  options: UsePointerDragOptions<T> = {},
): UsePointerDragReturn<T> {
  const {
    disabled = false,
    lockUserSelect = true,
    preventDefault = false,
    onStart,
    onMove,
    onEnd,
  } = options;

  const [state, setState] = useState<PointerDragState>(INITIAL_DRAG_STATE);

  const activePointerIdRef = useRef<number | null>(null);
  const startPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const lastPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const savedUserSelectRef = useRef<string | null>(null);

  const restoreUserSelect = (): void => {
    if (
      savedUserSelectRef.current !== null &&
      typeof document !== 'undefined'
    ) {
      document.body.style.userSelect = savedUserSelectRef.current;
      savedUserSelectRef.current = null;
    }
  };

  const onPointerDown = useEventCallback((event: ReactPointerEvent<T>) => {
    if (disabled || (event.pointerType === 'mouse' && event.button !== 0)) {
      return;
    }

    if (preventDefault) {
      event.preventDefault();
    }

    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Ignore if synthetic target does not support pointer capture
    }

    if (lockUserSelect && typeof document !== 'undefined') {
      savedUserSelectRef.current = document.body.style.userSelect;
      document.body.style.userSelect = 'none';
    }

    activePointerIdRef.current = event.pointerId;
    startPosRef.current = { x: event.clientX, y: event.clientY };
    lastPosRef.current = { x: event.clientX, y: event.clientY };

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

    setState(nextState);
    onStart?.(nextState, event);
  });

  const onPointerMove = useEventCallback((event: ReactPointerEvent<T>) => {
    if (disabled || activePointerIdRef.current !== event.pointerId) {
      return;
    }

    const movementX = event.clientX - lastPosRef.current.x;
    const movementY = event.clientY - lastPosRef.current.y;
    lastPosRef.current = { x: event.clientX, y: event.clientY };

    const nextState: PointerDragState = {
      isDragging: true,
      x: event.clientX,
      y: event.clientY,
      startX: startPosRef.current.x,
      startY: startPosRef.current.y,
      deltaX: event.clientX - startPosRef.current.x,
      deltaY: event.clientY - startPosRef.current.y,
      movementX,
      movementY,
    };

    setState(nextState);
    onMove?.(nextState, event);
  });

  const finishDrag = useEventCallback((event: ReactPointerEvent<T>) => {
    if (activePointerIdRef.current !== event.pointerId) {
      return;
    }

    try {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
    } catch {
      // Ignore if already released
    }

    activePointerIdRef.current = null;
    restoreUserSelect();

    const finalState: PointerDragState = {
      isDragging: false,
      x: event.clientX,
      y: event.clientY,
      startX: startPosRef.current.x,
      startY: startPosRef.current.y,
      deltaX: event.clientX - startPosRef.current.x,
      deltaY: event.clientY - startPosRef.current.y,
      movementX: 0,
      movementY: 0,
    };

    setState(finalState);
    onEnd?.(finalState, event);
  });

  useUnmount(restoreUserSelect);

  return {
    ...state,
    bindings: {
      onPointerDown,
      onPointerMove,
      onPointerUp: finishDrag,
      onPointerCancel: finishDrag,
      onLostPointerCapture: finishDrag,
    },
  };
}
