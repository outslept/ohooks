import { useState } from 'react';
import { useBoolean } from './useBoolean';
import { useEventCallback } from './useEventCallback';
import { useInterval } from './useInterval';
import { useLatest } from './useLatest';

export interface UseCountdownOptions {
  /** Starting count value */
  countStart: number;
  /** Target count value where the timer stops (default: `0`) */
  countStop?: number;
  /** Tick interval in milliseconds (default: `1000`) */
  intervalMs?: number;
  /** Count up instead of down (default: `false`) */
  isIncrement?: boolean;
  /** Start the countdown automatically on mount (default: `false`) */
  autoStart?: boolean;
  /** Callback fired on every tick with the updated count */
  onTick?: (count: number) => void;
  /** Callback fired when the countdown reaches `countStop` */
  onComplete?: () => void;
}

export interface UseCountdownReturn {
  /** Current count value */
  count: number;
  /** Whether the countdown timer is currently active */
  isRunning: boolean;
  /** Starts or resumes the countdown */
  start: () => void;
  /** Pauses the countdown */
  pause: () => void;
  /** Stops the countdown and resets `count` back to `countStart` */
  reset: () => void;
}

/**
 * Manages a configurable countdown (or count-up) timer with start, pause, and reset controls.
 *
 * @category Effects
 * @param options - Countdown boundaries, interval duration, direction, and lifecycle callbacks
 * @returns Current `count`, `isRunning` flag, and timer control methods (`start`, `pause`, `reset`)
 *
 * @example
 * ```tsx
 * const { count, isRunning, start, pause, reset } = useCountdown({
 *   countStart: 60,
 *   countStop: 0,
 *   intervalMs: 1000,
 * });
 * ```
 */
export function useCountdown(
  options: UseCountdownOptions,
): UseCountdownReturn {
  const {
    countStart,
    countStop = 0,
    intervalMs = 1000,
    isIncrement = false,
    autoStart = false,
    onTick,
    onComplete,
  } = options;

  const [count, setCount] = useState<number>(countStart);
  const {
    value: isRunning,
    setTrue: startRunning,
    setFalse: stopRunning,
  } = useBoolean(autoStart);

  const onTickRef = useLatest(onTick);
  const onCompleteRef = useLatest(onComplete);

  const isCompleted = isIncrement ? count >= countStop : count <= countStop;

  const start = useEventCallback(() => {
    if (isCompleted) {
      return;
    }
    startRunning();
  });

  const pause = useEventCallback(() => {
    stopRunning();
  });

  const reset = useEventCallback(() => {
    stopRunning();
    setCount(countStart);
  });

  const tick = useEventCallback(() => {
    if (isCompleted) {
      stopRunning();
      onCompleteRef.current?.();
      return;
    }

    const nextCount = isIncrement ? count + 1 : count - 1;
    setCount(nextCount);
    onTickRef.current?.(nextCount);

    const reachedEnd = isIncrement
      ? nextCount >= countStop
      : nextCount <= countStop;

    if (reachedEnd) {
      stopRunning();
      onCompleteRef.current?.();
    }
  });

  useInterval(tick, isRunning ? intervalMs : null);

  return {
    count,
    isRunning,
    start,
    pause,
    reset,
  };
}
