import { useEffect } from 'react';
import { useLatest } from './useLatest';

export function useInterval(
  callback: () => void,
  delay: number | null,
): void {
  const savedCallback = useLatest(callback);

  useEffect(() => {
    if (delay === null) {
      return;
    }

    const id = setInterval(() => {
      savedCallback.current();
    }, delay);

    return () => {
      clearInterval(id);
    };
  }, [delay, savedCallback]);
}
