import { useEffect, useRef, useState } from 'react';
import {
  EventListenerTarget,
} from './useEventListener';
import { useLatest } from './useLatest';
import { resolveTargetElement } from '@/lib/utils';

export interface UseHoverOptions {
  /** Delay in milliseconds before `isHovered` becomes `true` after `mouseenter` (default: `0`) */
  enterDelay?: number;
  /** Delay in milliseconds before `isHovered` becomes `false` after `mouseleave` (default: `0`) */
  leaveDelay?: number;
  /** Callback fired when the hover state activates */
  onEnter?: (event: MouseEvent) => void;
  /** Callback fired when the hover state deactivates */
  onLeave?: (event: MouseEvent) => void;
}

/**
 * Tracks whether the pointer is hovering over a target DOM element, with optional enter and leave delays.
 *
 * @category Sensors
 * @param target - Target DOM element or React ref
 * @param options - Enter/leave delays and hover lifecycle callbacks
 * @returns `true` while the target element is hovered, `false` otherwise
 *
 * @example
 * ```tsx
 * const isHovered = useHover(cardRef, { enterDelay: 100, leaveDelay: 150 });
 * ```
 */
export function useHover<T extends HTMLElement = HTMLElement>(
  target: EventListenerTarget<T>,
  options: UseHoverOptions = {}
): boolean {
  const { enterDelay = 0, leaveDelay = 0, onEnter, onLeave } = options;

  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [prevTarget, setPrevTarget] = useState<EventListenerTarget<T>>(target);
  const onEnterRef = useLatest(onEnter);
  const onLeaveRef = useLatest(onLeave);

  if (prevTarget !== target) {
    setPrevTarget(target);
    if (isHovered) {
      setIsHovered(false);
    }
  }

  const enterTimerRef: { current: ReturnType<typeof setTimeout> | null } =
    useRef(null);
  const leaveTimerRef: { current: ReturnType<typeof setTimeout> | null } =
    useRef(null);

  useEffect(() => {
    const element = resolveTargetElement(target);
    if (!element) {
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
