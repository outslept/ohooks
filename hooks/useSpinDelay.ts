import { useEffect, useRef, useState } from 'react';

export interface UseSpinDelayOptions {
  delay?: number;
  minDuration?: number;
  ssr?: boolean;
}

export function useSpinDelay(
  isLoading: boolean,
  options: UseSpinDelayOptions = {},
): boolean {
  const { delay = 150, minDuration = 300, ssr = false } = options;

  const initiallyVisible =
    isLoading && (delay <= 0 || (ssr && typeof window === 'undefined'));

  const [isSpinning, setIsSpinning] = useState<boolean>(initiallyVisible);
  const isSpinningRef = useRef<boolean>(initiallyVisible);
  const shownAtRef = useRef<number | null>(
    initiallyVisible ? Date.now() : null,
  );

  useEffect(() => {
    const safeDelay = Math.max(0, delay);
    const safeMinDuration = Math.max(0, minDuration);

    if (isLoading) {
      if (isSpinningRef.current) {
        return;
      }

      if (safeDelay === 0) {
        shownAtRef.current = Date.now();
        isSpinningRef.current = true;
        setIsSpinning(true);
        return;
      }

      const timerId = setTimeout(() => {
        shownAtRef.current = Date.now();
        isSpinningRef.current = true;
        setIsSpinning(true);
      }, safeDelay);

      return () => {
        clearTimeout(timerId);
      };
    }

    if (!isSpinningRef.current) {
      return;
    }

    const elapsed =
      shownAtRef.current !== null
        ? Date.now() - shownAtRef.current
        : safeMinDuration;
    const remaining = Math.max(0, safeMinDuration - elapsed);

    if (remaining === 0) {
      shownAtRef.current = null;
      isSpinningRef.current = false;
      setIsSpinning(false);
      return;
    }

    const timerId = setTimeout(() => {
      shownAtRef.current = null;
      isSpinningRef.current = false;
      setIsSpinning(false);
    }, remaining);

    return () => {
      clearTimeout(timerId);
    };
  }, [isLoading, delay, minDuration]);

  return isSpinning;
}
