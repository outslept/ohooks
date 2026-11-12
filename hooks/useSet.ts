import { useState } from 'react';
import { useEventCallback } from './useEventCallback';

export interface UseSetActions<T> {
  add: (value: T) => void;
  remove: (value: T) => void;
  toggle: (value: T) => void;
  clear: () => void;
  reset: () => void;
  has: (value: T) => boolean;
}

export function useSet<T>(
  initialValue?: Iterable<T>,
): [ReadonlySet<T>, UseSetActions<T>] {
  const [set, setSet] = useState<Set<T>>(() => new Set(initialValue));

  const add = useEventCallback((value: T) => {
    setSet((prev) => {
      if (prev.has(value)) {
        return prev;
      }
      const next = new Set(prev);
      next.add(value);
      return next;
    });
  });

  const remove = useEventCallback((value: T) => {
    setSet((prev) => {
      if (!prev.has(value)) {
        return prev;
      }
      const next = new Set(prev);
      next.delete(value);
      return next;
    });
  });

  const toggle = useEventCallback((value: T) => {
    setSet((prev) => {
      const next = new Set(prev);
      if (next.has(value)) {
        next.delete(value);
      } else {
        next.add(value);
      }
      return next;
    });
  });

  const clear = useEventCallback(() => {
    setSet((prev) => {
      if (prev.size === 0) {
        return prev;
      }
      return new Set();
    });
  });

  const reset = useEventCallback(() => {
    setSet(() => new Set(initialValue));
  });

  const has = useEventCallback((value: T): boolean => {
    return set.has(value);
  });

  return [
    set,
    {
      add,
      remove,
      toggle,
      clear,
      reset,
      has,
    },
  ];
}
