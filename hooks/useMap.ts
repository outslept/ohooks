import { useState } from 'react';
import { useEventCallback } from './useEventCallback';

export interface UseMapActions<K, V> {
  set: (key: K, value: V) => void;
  setAll: (entries: Iterable<readonly [K, V]>) => void;
  remove: (key: K) => void;
  clear: () => void;
  reset: () => void;
  get: (key: K) => V | undefined;
  has: (key: K) => boolean;
}

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

  const get = useEventCallback((key: K): V | undefined => {
    return map.get(key);
  });

  const has = useEventCallback((key: K): boolean => {
    return map.has(key);
  });

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
