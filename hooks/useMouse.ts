import { useEffect, useRef, useState } from 'react';
import {
  EventListenerTarget,
  resolveTargetElement,
} from './useEventListener';

export interface MousePositionState {
  /** Horizontal coordinate relative to the whole document (`pageX`) */
  x: number;
  /** Vertical coordinate relative to the whole document (`pageY`) */
  y: number;
  /** Horizontal coordinate relative to the viewport (`clientX`) */
  clientX: number;
  /** Vertical coordinate relative to the viewport (`clientY`) */
  clientY: number;
  /** Horizontal coordinate relative to the user's screen (`screenX`) */
  screenX: number;
  /** Vertical coordinate relative to the user's screen (`screenY`) */
  screenY: number;
  /** Horizontal coordinate relative to the target element */
  elementX: number;
  /** Vertical coordinate relative to the target element */
  elementY: number;
  /** Target element's horizontal document offset */
  elementPositionX: number;
  /** Target element's vertical document offset */
  elementPositionY: number;
}

const INITIAL_STATE: MousePositionState = {
  x: 0,
  y: 0,
  clientX: 0,
  clientY: 0,
  screenX: 0,
  screenY: 0,
  elementX: 0,
  elementY: 0,
  elementPositionX: 0,
  elementPositionY: 0,
};

/**
 * Tracks mouse cursor coordinates across the document, viewport, screen, and an optional target element using `requestAnimationFrame`.
 *
 * @category Sensors
 * @param target - Optional target DOM element or React ref for computing element-relative coordinates
 * @returns Mouse position coordinates (`x`, `y`, `clientX`, `clientY`, `screenX`, `screenY`, `elementX`, `elementY`, `elementPositionX`, `elementPositionY`)
 *
 * @example
 * ```tsx
 * const { x, y, elementX, elementY } = useMouse(boxRef);
 * ```
 */
export function useMouse(
  target?: EventListenerTarget<HTMLElement>
): MousePositionState {
  const [state, setState] = useState<MousePositionState>(INITIAL_STATE);
  const rafIdRef: { current: number | null } = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleMouseMove = (event: MouseEvent) => {
      if (rafIdRef.current !== null) {
        window.cancelAnimationFrame(rafIdRef.current);
      }

      rafIdRef.current = window.requestAnimationFrame(() => {
        rafIdRef.current = null;

        let elementX = 0;
        let elementY = 0;
        let elementPositionX = 0;
        let elementPositionY = 0;

        const targetElement = resolveTargetElement(target);
        if (targetElement) {
          const rect = targetElement.getBoundingClientRect();
          elementPositionX = rect.left + window.scrollX;
          elementPositionY = rect.top + window.scrollY;
          elementX = event.pageX - elementPositionX;
          elementY = event.pageY - elementPositionY;
        }

        setState({
          x: event.pageX,
          y: event.pageY,
          clientX: event.clientX,
          clientY: event.clientY,
          screenX: event.screenX,
          screenY: event.screenY,
          elementX,
          elementY,
          elementPositionX,
          elementPositionY,
        });
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafIdRef.current !== null) {
        window.cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [target]);

  return state;
}

export default useMouse;
