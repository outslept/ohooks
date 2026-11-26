import { useCallback, useState } from "react";
import { useEventCallback } from "./useEventCallback";

/** Mutation and lookup actions returned by `useSet`. */
export interface UseSetActions<T> {
  /** Adds `value` to the set if not already present. */
  add: (value: T) => void;
  /** Removes `value` from the set if present. */
  remove: (value: T) => void;
  /** Adds `value` if absent, or removes it if present. */
  toggle: (value: T) => void;
  /** Removes all values from the set. */
  clear: () => void;
  /** Resets the set back to `initialValue`. */
  reset: () => void;
  /** Returns `true` if `value` is in the set. */
  has: (value: T) => boolean;
}

/**
 * Manages a reactive `Set` in React state with immutable update helpers.
 *
 * @category State
 * @param initialValue - Optional initial iterable of values
 * @returns A tuple of `[set, actions]`
 *
 * @example
 * ```tsx
 * const [tags, { add, remove, toggle, has }] = useSet(['react', 'typescript']);
 * ```
 */
export function useSet<T>(initialValue?: Iterable<T>): [ReadonlySet<T>, UseSetActions<T>] {
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

  const has = useCallback(
    (value: T): boolean => {
      return set.has(value);
    },
    [set],
  );

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
