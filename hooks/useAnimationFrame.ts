import { useEffect } from 'react';
import { useLatest } from './useLatest';

export interface AnimationFrameInfo {
  timestamp: DOMHighResTimeStamp;
  deltaTime: number;
  elapsedTime: number;
}

export interface UseAnimationFrameOptions {
  enabled?: boolean;
  fpsLimit?: number;
}

export function useAnimationFrame(
  callback: (info: AnimationFrameInfo) => void,
  options: boolean | UseAnimationFrameOptions = true,
): void {
  const normalizedOptions: UseAnimationFrameOptions =
    typeof options === 'boolean' ? { enabled: options } : options;

  const { enabled = true, fpsLimit } = normalizedOptions;
  const callbackRef = useLatest(callback);

  useEffect(() => {
    if (
      !enabled ||
      typeof window === 'undefined' ||
      typeof window.requestAnimationFrame !== 'function'
    ) {
      return;
    }

    let frameId = 0;
    let startTime: DOMHighResTimeStamp | null = null;
    let prevTime: DOMHighResTimeStamp | null = null;

    const minFrameInterval =
      fpsLimit !== undefined && fpsLimit > 0 ? 1000 / fpsLimit : 0;

    const loop = (timestamp: DOMHighResTimeStamp): void => {
      if (startTime === null) {
        startTime = timestamp;
      }

      const deltaTime = prevTime === null ? 0 : timestamp - prevTime;

      if (prevTime === null || deltaTime >= minFrameInterval) {
        prevTime = timestamp;
        callbackRef.current({
          timestamp,
          deltaTime,
          elapsedTime: timestamp - startTime,
        });
      }

      frameId = window.requestAnimationFrame(loop);
    };

    frameId = window.requestAnimationFrame(loop);

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [enabled, fpsLimit, callbackRef]);
}
