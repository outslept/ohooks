import { useRef, useState } from 'react';
import { useEventCallback } from './useEventCallback';
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';

export interface UseQueueReturn<T> {
  queue: readonly T[];
  size: number;
  first: T | undefined;
  last: T | undefined;
  isEmpty: boolean;
  enqueue: (...items: T[]) => void;
  dequeue: () => T | undefined;
  peek: () => T | undefined;
  clear: () => void;
  reset: () => void;
}

export function useQueue<T>(
  initialValue: ReadonlyArray<T> | (() => ReadonlyArray<T>) = [],
): UseQueueReturn<T> {
  const resolveInitial = (): T[] => {
    const resolved =
      typeof initialValue === 'function' ? initialValue() : initialValue;
    return [...resolved];
  };

  const [queue, setQueue] = useState<T[]>(resolveInitial);
  const queueRef = useRef<T[]>(queue);

  useIsomorphicLayoutEffect(() => {
    queueRef.current = queue;
  });

  const enqueue = useEventCallback((...items: T[]) => {
    if (items.length === 0) {
      return;
    }
    const next = [...queueRef.current, ...items];
    queueRef.current = next;
    setQueue(next);
  });

  const dequeue = useEventCallback((): T | undefined => {
    if (queueRef.current.length === 0) {
      return undefined;
    }
    const [removed, ...rest] = queueRef.current;
    queueRef.current = rest;
    setQueue(rest);
    return removed;
  });

  const peek = useEventCallback((): T | undefined => {
    return queueRef.current[0];
  });

  const clear = useEventCallback(() => {
    if (queueRef.current.length === 0) {
      return;
    }
    queueRef.current = [];
    setQueue([]);
  });

  const reset = useEventCallback(() => {
    const next = resolveInitial();
    queueRef.current = next;
    setQueue(next);
  });

  return {
    queue,
    size: queue.length,
    first: queue[0],
    last: queue.length > 0 ? queue[queue.length - 1] : undefined,
    isEmpty: queue.length === 0,
    enqueue,
    dequeue,
    peek,
    clear,
    reset,
  };
}
