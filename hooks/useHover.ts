import { useEffect, useRef, useState } from 'react';
import {
  EventListenerTarget,
  resolveTargetElement,
} from './useEventListener';
import { useLatest } from './useLatest';

export interface UseHoverOptions {
  enterDelay?: number;
  leaveDelay?: number;
  onEnter?: (event: MouseEvent) => void;
  onLeave?: (event: MouseEvent) => void;
}

export function useHover<T extends HTMLElement = HTMLElement>(
  target: EventListenerTarget<T>,
  options: UseHoverOptions = {}
): boolean {
  const { enterDelay = 0, leaveDelay = 0, onEnter, onLeave } = options;

  const [isHovered, setIsHovered] = useState<boolean>(false);
  const onEnterRef = useLatest(onEnter);
  const onLeaveRef = useLatest(onLeave);

  const enterTimerRef: { current: ReturnType<typeof setTimeout> | null } =
    useRef(null);
  const leaveTimerRef: { current: ReturnType<typeof setTimeout> | null } =
    useRef(null);

  useEffect(() => {
    const element = resolveTargetElement(target);
    if (!element) {
      setIsHovered(false);
      return;
    }

    const clearTimers = () => {
      if (enterTimerRef.current !== null) {
        clearTimeout(enterTimerRef.current);
        enterTimerRef.current = null;
      }
      if (leaveTimerRef.current !== null) {
        clearTimeout(leaveTimerRef.current);
        leaveTimerRef.current = null;
      }
    };

    const handleMouseEnter = (event: MouseEvent) => {
      clearTimers();
      if (enterDelay > 0) {
        enterTimerRef.current = setTimeout(() => {
          setIsHovered(true);
          onEnterRef.current?.(event);
        }, enterDelay);
      } else {
        setIsHovered(true);
        onEnterRef.current?.(event);
      }
    };

    const handleMouseLeave = (event: MouseEvent) => {
      clearTimers();
      if (leaveDelay > 0) {
        leaveTimerRef.current = setTimeout(() => {
          setIsHovered(false);
          onLeaveRef.current?.(event);
        }, leaveDelay);
      } else {
        setIsHovered(false);
        onLeaveRef.current?.(event);
      }
    };

    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      clearTimers();
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [target, enterDelay, leaveDelay, onEnterRef, onLeaveRef]);

  return isHovered;
}

export default useHover;
