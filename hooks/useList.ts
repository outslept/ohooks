import { type Dispatch, type SetStateAction, useState } from 'react';
import { useEventCallback } from './useEventCallback';

export interface UseListActions<T> {
  /** Standard React state setter for replacing or updating the array */
  set: Dispatch<SetStateAction<T[]>>;
  /** Appends one or more items to the end of the list */
  push: (...items: T[]) => void;
  /** Replaces the item at `index` (supports negative indices) */
  updateAt: (index: number, item: T) => void;
  /** Inserts an item at `index` (clamped to list bounds, supports negative indices) */
  insertAt: (index: number, item: T) => void;
  /** Removes the item at `index` (supports negative indices) */
  removeAt: (index: number) => void;
  /** Keeps only items that satisfy the predicate function */
  filter: (
    predicate: (value: T, index: number, array: T[]) => boolean,
  ) => void;
  /** Sorts the list in place (immutably) using an optional comparator */
  sort: (compareFn?: (a: T, b: T) => number) => void;
  /** Empties the list */
  clear: () => void;
  /** Resets the list back to `initialValue` */
  reset: () => void;
}

/**
 * Manages an array state with immutable helper methods for pushing, inserting, updating, removing, filtering, and sorting items.
 *
 * @category State
 * @param initialValue - Initial array or lazy initializer function (default: `[]`)
 * @returns Tuple of `[list, actions]`
 *
 * @example
 * ```tsx
 * const [items, { push, removeAt, clear }] = useList<string>(['a', 'b']);
 * ```
 */
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
