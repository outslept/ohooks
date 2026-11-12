import { useEffect } from 'react';
import { useLatest } from './useLatest';

export function useTimeout(
  callback: () => void,
  delay: number | null,
): void {
  const savedCallback = useLatest(callback);

  useEffect(() => {
    if (delay === null) {
      return;
    }

    const id = setTimeout(() => {
      savedCallback.current();
    }, delay);

    return () => {
      clearTimeout(id);
    };
  }, [delay, savedCallback]);
}
