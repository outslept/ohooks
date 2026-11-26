import { useRef, useState } from "react";
import { useEventCallback } from "./useEventCallback";
import { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect";

/** State and FIFO manipulation helpers returned by `useQueue`. */
export interface UseQueueReturn<T> {
  /** Current items in the queue from front to back. */
  queue: readonly T[];
  /** Number of items currently in the queue. */
  size: number;
  /** First item at the front of the queue, or `undefined` if empty. */
  first: T | undefined;
  /** Last item at the back of the queue, or `undefined` if empty. */
  last: T | undefined;
  /** Whether the queue contains zero items. */
  isEmpty: boolean;
  /** Appends one or more items to the back of the queue. */
  enqueue: (...items: T[]) => void;
  /** Removes and returns the item at the front of the queue. */
  dequeue: () => T | undefined;
  /** Returns the item at the front of the queue without removing it. */
  peek: () => T | undefined;
  /** Removes all items from the queue. */
  clear: () => void;
  /** Restores the queue to its `initialValue`. */
  reset: () => void;
}

/**
 * Manages a reactive FIFO (first-in, first-out) queue in React state.
 *
 * @category State
 * @param initialValue - Initial array or lazy initializer function (default: `[]`)
 * @returns Queue items, metadata, and queue mutation methods
 *
 * @example
 * ```tsx
 * const { queue, enqueue, dequeue, first } = useQueue<string>(['task-1']);
 * ```
 */
export function useQueue<T>(
  initialValue: ReadonlyArray<T> | (() => ReadonlyArray<T>) = [],
): UseQueueReturn<T> {
  const resolveInitial = (): T[] => {
    const resolved = typeof initialValue === "function" ? initialValue() : initialValue;
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
