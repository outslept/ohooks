import { useState } from 'react';
import { useBoolean } from './useBoolean';
import { useEventCallback } from './useEventCallback';
import { useInterval } from './useInterval';
import { useLatest } from './useLatest';

export interface UseCountdownOptions {
  countStart: number;
  countStop?: number;
  intervalMs?: number;
  isIncrement?: boolean;
  autoStart?: boolean;
  onTick?: (count: number) => void;
  onComplete?: () => void;
}

export interface UseCountdownReturn {
  count: number;
  isRunning: boolean;
  start: () => void;
  pause: () => void;
  reset: () => void;
}

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
