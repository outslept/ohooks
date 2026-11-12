import { useCallback, useEffect, useRef, useState } from 'react';
import { useLatest } from './useLatest';

export interface AnimationFrameInfo {
  timestamp: DOMHighResTimeStamp;
  deltaTime: number;
  elapsedTime: number;
}

export interface UseAnimationFrameOptions {
  immediate?: boolean;
  fpsLimit?: number;
}

export interface UseAnimationFrameControls {
  start: () => void;
  stop: () => void;
  toggle: () => void;
  isActive: boolean;
}

export function useAnimationFrame(
  callback: (info: AnimationFrameInfo) => void,
  options: UseAnimationFrameOptions = {}
): UseAnimationFrameControls {
  const { immediate = true, fpsLimit } = options;

  const callbackRef = useLatest(callback);
  const fpsLimitRef = useLatest(fpsLimit);

  const [isActive, setIsActive] = useState<boolean>(immediate);
  const isActiveRef: { current: boolean } = useRef(immediate);
  const rafIdRef: { current: number | null } = useRef(null);
  const startTimeRef: { current: number | null } = useRef(null);
  const previousTimeRef: { current: number | null } = useRef(null);

  const cancelFrame = useCallback(() => {
    if (rafIdRef.current !== null && typeof window !== 'undefined') {
      window.cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
  }, []);

  const step = useCallback(
    (timestamp: DOMHighResTimeStamp) => {
      if (!isActiveRef.current) return;

      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }

      if (previousTimeRef.current === null) {
        previousTimeRef.current = timestamp;
        callbackRef.current({
          timestamp,
          deltaTime: 0,
          elapsedTime: 0,
        });
      } else {
        const deltaTime = timestamp - previousTimeRef.current;
        const currentFpsLimit = fpsLimitRef.current;

        if (currentFpsLimit !== undefined && currentFpsLimit > 0) {
          const minFrameInterval = 1000 / currentFpsLimit;
          if (deltaTime < minFrameInterval) {
            rafIdRef.current = window.requestAnimationFrame(step);
            return;
          }
          previousTimeRef.current =
            timestamp - (deltaTime % minFrameInterval);
        } else {
          previousTimeRef.current = timestamp;
        }

        const elapsedTime = timestamp - startTimeRef.current;
        callbackRef.current({
          timestamp,
          deltaTime,
          elapsedTime,
        });
      }

      if (isActiveRef.current && typeof window !== 'undefined') {
        rafIdRef.current = window.requestAnimationFrame(step);
      }
    },
    [callbackRef, fpsLimitRef]
  );

  const start = useCallback(() => {
    if (isActiveRef.current) return;
    isActiveRef.current = true;
    setIsActive(true);
  }, []);

  const stop = useCallback(() => {
    if (!isActiveRef.current) return;
    isActiveRef.current = false;
    cancelFrame();
    startTimeRef.current = null;
    previousTimeRef.current = null;
    setIsActive(false);
  }, [cancelFrame]);

  const toggle = useCallback(() => {
    if (isActiveRef.current) {
      stop();
    } else {
      start();
    }
  }, [start, stop]);

  useEffect(() => {
    if (!isActive || typeof window === 'undefined') {
      cancelFrame();
      return;
    }

    isActiveRef.current = true;
    startTimeRef.current = null;
    previousTimeRef.current = null;
    rafIdRef.current = window.requestAnimationFrame(step);

    return () => {
      cancelFrame();
    };
  }, [isActive, step, cancelFrame]);

  return {
    start,
    stop,
    toggle,
    isActive,
  };
}

export default useAnimationFrame;
