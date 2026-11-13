import { useCallback, useState } from 'react';
import { useEventCallback } from './useEventCallback';

export interface UseMapActions<K, V> {
  /** Sets or updates the value for `key` */
  set: (key: K, value: V) => void;
  /** Replaces the entire map with the provided entries */
  setAll: (entries: Iterable<readonly [K, V]>) => void;
  /** Deletes `key` from the map if present */
  remove: (key: K) => void;
  /** Removes all entries from the map */
  clear: () => void;
  /** Resets the map back to `initialValue` */
  reset: () => void;
  /** Returns the value associated with `key`, or `undefined` */
  get: (key: K) => V | undefined;
  /** Returns `true` if `key` exists in the map */
  has: (key: K) => boolean;
}

/**
 * Manages a reactive `Map` state with immutable helper actions for setting, deleting, clearing, and querying entries.
 *
 * @category State
 * @param initialValue - Optional initial iterable of `[key, value]` pairs
 * @returns Tuple of `[map, actions]`
 *
 * @example
 * ```tsx
 * const [map, { set, remove, clear }] = useMap<string, number>([['a', 1]]);
 * ```
 */
export function useMap<K, V>(
  initialValue?: Iterable<readonly [K, V]>,
): [ReadonlyMap<K, V>, UseMapActions<K, V>] {
  const [map, setMap] = useState<Map<K, V>>(() => new Map(initialValue));

  const set = useEventCallback((key: K, value: V) => {
    setMap((prev) => {
      if (prev.has(key) && Object.is(prev.get(key), value)) {
        return prev;
      }
      const next = new Map(prev);
      next.set(key, value);
      return next;
    });
  });

  const setAll = useEventCallback((entries: Iterable<readonly [K, V]>) => {
    setMap(() => new Map(entries));
  });

  const remove = useEventCallback((key: K) => {
    setMap((prev) => {
      if (!prev.has(key)) {
        return prev;
      }
      const next = new Map(prev);
      next.delete(key);
      return next;
    });
  });

  const clear = useEventCallback(() => {
    setMap((prev) => {
      if (prev.size === 0) {
        return prev;
      }
      return new Map();
    });
  });

  const reset = useEventCallback(() => {
    setMap(() => new Map(initialValue));
  });

  const get = useCallback(
    (key: K): V | undefined => {
      return map.get(key);
    },
    [map],
  );

  const has = useCallback(
    (key: K): boolean => {
      return map.has(key);
    },
    [map],
  );

  return [
    map,
    {
      set,
      setAll,
      remove,
      clear,
      reset,
      get,
      has,
    },
  ];
}
