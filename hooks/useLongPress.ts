import {
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  useMemo,
  useRef,
} from "react";
import { useEventCallback } from "./useEventCallback";
import { useUnmount } from "./useUnmount";

export interface UseLongPressOptions<T extends Element = Element> {
  /** Hold duration in milliseconds required to trigger the long press callback (default: `400`) */
  threshold?: number;
  /** Maximum pointer movement in pixels allowed before canceling the long press (default: `10`) */
  moveThreshold?: number;
  /** Suppress the subsequent `click` event after a long press triggers (default: `true`) */
  preventClick?: boolean;
  /** Cancel the pending long press if the pointer leaves the element (default: `true`) */
  cancelOnLeave?: boolean;
  /** Predicate to filter which pointer events can initiate a long press */
  filterEvents?: (event: ReactPointerEvent<T>) => boolean;
  /** Callback fired when the pointer press starts */
  onStart?: (event: ReactPointerEvent<T>) => void;
  /** Callback fired when the pointer is released after a completed long press */
  onFinish?: (event: ReactPointerEvent<T>) => void;
  /** Callback fired if the press is released, moved, or canceled before `threshold` elapses */
  onCancel?: (event: ReactPointerEvent<T>) => void;
}

export interface UseLongPressHandlers<T extends Element = Element> {
  /** Pointer down handler to spread onto the target element */
  onPointerDown: (event: ReactPointerEvent<T>) => void;
  /** Pointer move handler to cancel the press if movement exceeds `moveThreshold` */
  onPointerMove: (event: ReactPointerEvent<T>) => void;
  /** Pointer up handler to finish or cancel the press */
  onPointerUp: (event: ReactPointerEvent<T>) => void;
  /** Pointer leave handler to cancel the press when leaving the element */
  onPointerLeave: (event: ReactPointerEvent<T>) => void;
  /** Pointer cancel handler */
  onPointerCancel: (event: ReactPointerEvent<T>) => void;
  /** Click capture handler to suppress synthetic clicks after a long press */
  onClickCapture: (event: ReactMouseEvent<T>) => void;
}

/**
 * Detects long-press pointer gestures with movement threshold cancellation and click suppression.
 *
 * @category Sensors
 * @param callback - Function invoked when the pointer is held down for `threshold` milliseconds
 * @param options - Hold duration, movement tolerance, click suppression, and lifecycle callbacks
 * @returns Pointer and click event handlers to spread onto a JSX element
 *
 * @example
 * ```tsx
 * const longPressProps = useLongPress(() => {
 *   openContextMenu();
 * }, { threshold: 500 });
 * // <button {...longPressProps}>Hold me</button>
 * ```
 */
export function useLongPress<T extends Element = Element>(
  callback: (event: ReactPointerEvent<T>) => void,
  options: UseLongPressOptions<T> = {},
): UseLongPressHandlers<T> {
  const {
    threshold = 400,
    moveThreshold = 10,
    preventClick = true,
    cancelOnLeave = true,
    filterEvents,
    onStart,
    onFinish,
    onCancel,
  } = options;

  const timerIdRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isPressedRef = useRef<boolean>(false);
  const isLongPressTriggeredRef = useRef<boolean>(false);
  const suppressNextClickRef = useRef<boolean>(false);
  const startCoordRef = useRef<{ x: number; y: number } | null>(null);

  const clearTimer = (): void => {
    if (timerIdRef.current !== null) {
      clearTimeout(timerIdRef.current);
      timerIdRef.current = null;
    }
  };

  const handlePointerDown = useEventCallback((event: ReactPointerEvent<T>) => {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }
    if (filterEvents && !filterEvents(event)) {
      return;
    }

    clearTimer();
    isPressedRef.current = true;
    isLongPressTriggeredRef.current = false;
    suppressNextClickRef.current = false;
    startCoordRef.current = { x: event.clientX, y: event.clientY };

    onStart?.(event);

    timerIdRef.current = setTimeout(
      () => {
        timerIdRef.current = null;
        isLongPressTriggeredRef.current = true;
        if (preventClick) {
          suppressNextClickRef.current = true;
        }
        callback(event);
      },
      Math.max(0, threshold),
    );
  });

  const handlePointerMove = useEventCallback((event: ReactPointerEvent<T>) => {
    if (!isPressedRef.current || timerIdRef.current === null || startCoordRef.current === null) {
      return;
    }

    const distance = Math.hypot(
      event.clientX - startCoordRef.current.x,
      event.clientY - startCoordRef.current.y,
    );

    if (distance > moveThreshold) {
      clearTimer();
      isPressedRef.current = false;
      startCoordRef.current = null;
      onCancel?.(event);
    }
  });

  const finishInteraction = useEventCallback(
    (event: ReactPointerEvent<T>, resetClickSuppression: boolean) => {
      if (!isPressedRef.current) {
        return;
      }

      const wasPending = timerIdRef.current !== null;
      clearTimer();
      isPressedRef.current = false;
      startCoordRef.current = null;

      if (resetClickSuppression) {
        suppressNextClickRef.current = false;
      }

      if (isLongPressTriggeredRef.current) {
        isLongPressTriggeredRef.current = false;
        onFinish?.(event);
      } else if (wasPending) {
        onCancel?.(event);
      }
    },
  );

  const handlePointerUp = useEventCallback((event: ReactPointerEvent<T>) => {
    finishInteraction(event, false);
  });

  const handlePointerLeave = useEventCallback((event: ReactPointerEvent<T>) => {
    if (cancelOnLeave) {
      finishInteraction(event, true);
    }
  });

  const handlePointerCancel = useEventCallback((event: ReactPointerEvent<T>) => {
    finishInteraction(event, true);
  });

  const handleClickCapture = useEventCallback((event: ReactMouseEvent<T>) => {
    if (suppressNextClickRef.current) {
      suppressNextClickRef.current = false;
      event.preventDefault();
      event.stopPropagation();
    }
  });

  useUnmount(clearTimer);

  return useMemo(
    () => ({
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerLeave: handlePointerLeave,
      onPointerCancel: handlePointerCancel,
      onClickCapture: handleClickCapture,
    }),
    [
      handlePointerDown,
      handlePointerMove,
      handlePointerUp,
      handlePointerLeave,
      handlePointerCancel,
      handleClickCapture,
    ],
  );
}
