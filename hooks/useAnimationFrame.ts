import { useCallback, useEffect, useRef, useState } from "react";
import { useLatest } from "./useLatest";

export interface AnimationFrameInfo {
  /** High-resolution timestamp passed by `requestAnimationFrame` */
  timestamp: DOMHighResTimeStamp;
  /** Time elapsed in milliseconds since the previous frame */
  deltaTime: number;
  /** Total time elapsed in milliseconds since the loop started */
  elapsedTime: number;
}

export interface UseAnimationFrameOptions {
  /** Start the animation loop immediately on mount (default: `true`) */
  immediate?: boolean;
  /** Optional maximum frames per second limit */
  fpsLimit?: number;
}

export interface UseAnimationFrameControls {
  /** Starts the animation frame loop */
  start: () => void;
  /** Stops the animation frame loop and resets timing counters */
  stop: () => void;
  /** Toggles the animation frame loop between active and stopped states */
  toggle: () => void;
  /** Whether the animation frame loop is currently running */
  isActive: boolean;
}

/**
 * Runs a callback on every `requestAnimationFrame` tick with delta time tracking, FPS limiting, and playback controls.
 *
 * @category Effects
 * @param callback - Function invoked on each animation frame with timing metadata
 * @param options - Configuration for immediate start and FPS throttling
 * @returns Playback control methods (`start`, `stop`, `toggle`) and `isActive` state
 *
 * @example
 * ```tsx
 * const { isActive, toggle } = useAnimationFrame(({ deltaTime }) => {
 *   updatePosition(deltaTime);
 * }, { fpsLimit: 60 });
 * ```
 */
export function useAnimationFrame(
  callback: (info: AnimationFrameInfo) => void,
  options: UseAnimationFrameOptions = {},
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
    if (rafIdRef.current !== null && typeof window !== "undefined") {
      window.cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
  }, []);

  const step = useCallback(
    function stepFrame(timestamp: DOMHighResTimeStamp) {
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
            rafIdRef.current = window.requestAnimationFrame(stepFrame);
            return;
          }
          previousTimeRef.current = timestamp - (deltaTime % minFrameInterval);
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

      if (isActiveRef.current && typeof window !== "undefined") {
        rafIdRef.current = window.requestAnimationFrame(stepFrame);
      }
    },
    [callbackRef, fpsLimitRef],
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
    if (!isActive || typeof window === "undefined") {
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
