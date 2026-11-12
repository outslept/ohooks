// hooks/useMouse.ts
import { useEffect, useRef, useState } from 'react';
import {
  EventListenerTarget,
  resolveTargetElement,
} from './useEventListener';

export interface MousePositionState {
  x: number;
  y: number;
  clientX: number;
  clientY: number;
  screenX: number;
  screenY: number;
  elementX: number;
  elementY: number;
  elementPositionX: number;
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
