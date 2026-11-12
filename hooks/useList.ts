import { type Dispatch, type SetStateAction, useState } from 'react';
import { useEventCallback } from './useEventCallback';

export interface UseListActions<T> {
  set: Dispatch<SetStateAction<T[]>>;
  push: (...items: T[]) => void;
  updateAt: (index: number, item: T) => void;
  insertAt: (index: number, item: T) => void;
  removeAt: (index: number) => void;
  filter: (
    predicate: (value: T, index: number, array: T[]) => boolean,
  ) => void;
  sort: (compareFn?: (a: T, b: T) => number) => void;
  clear: () => void;
  reset: () => void;
}

export function useList<T>(
  initialValue: T[] | (() => T[]) = [],
): [T[], UseListActions<T>] {
  const resolveInitial = (): T[] =>
    typeof initialValue === 'function'
      ? (initialValue as () => T[])()
      : initialValue;

  const [list, setList] = useState<T[]>(() => [...resolveInitial()]);

  const push = useEventCallback((...items: T[]) => {
    if (items.length === 0) {
      return;
    }
    setList((prev) => [...prev, ...items]);
  });

  const updateAt = useEventCallback((index: number, item: T) => {
    setList((prev) => {
      const targetIndex = index < 0 ? prev.length + index : index;
      if (targetIndex < 0 || targetIndex >= prev.length) {
        return prev;
      }
      if (Object.is(prev[targetIndex], item)) {
        return prev;
      }
      const next = [...prev];
      next[targetIndex] = item;
      return next;
    });
  });

  const insertAt = useEventCallback((index: number, item: T) => {
    setList((prev) => {
      const clampedIndex = Math.max(
        0,
        Math.min(prev.length, index < 0 ? prev.length + index : index),
      );
      return [
        ...prev.slice(0, clampedIndex),
        item,
        ...prev.slice(clampedIndex),
      ];
    });
  });

  const removeAt = useEventCallback((index: number) => {
    setList((prev) => {
      const targetIndex = index < 0 ? prev.length + index : index;
      if (targetIndex < 0 || targetIndex >= prev.length) {
        return prev;
      }
      return [
        ...prev.slice(0, targetIndex),
        ...prev.slice(targetIndex + 1),
      ];
    });
  });

  const filter = useEventCallback(
    (predicate: (value: T, index: number, array: T[]) => boolean) => {
      setList((prev) => prev.filter(predicate));
    },
  );

  const sort = useEventCallback((compareFn?: (a: T, b: T) => number) => {
    setList((prev) => [...prev].sort(compareFn));
  });

  const clear = useEventCallback(() => {
    setList((prev) => (prev.length === 0 ? prev : []));
  });

  const reset = useEventCallback(() => {
    setList([...resolveInitial()]);
  });

  return [
    list,
    {
      set: setList,
      push,
      updateAt,
      insertAt,
      removeAt,
      filter,
      sort,
      clear,
      reset,
    },
  ];
}
