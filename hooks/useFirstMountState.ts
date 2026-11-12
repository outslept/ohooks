import { useRef } from 'react';
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';

export function useFirstMountState(): boolean {
  const isFirst = useRef(true);

  useIsomorphicLayoutEffect(() => {
    isFirst.current = false;
  }, []);

  return isFirst.current;
}
