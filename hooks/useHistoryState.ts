import { type SetStateAction, useState } from 'react';
import { useEventCallback } from './useEventCallback';

export interface UseHistoryStateOptions {
  capacity?: number;
}

export interface UseHistoryStateReturn<T> {
  state: T;
  history: readonly T[];
  pointer: number;
  canUndo: boolean;
  canRedo: boolean;
  set: (value: SetStateAction<T>) => void;
  undo: (steps?: number) => void;
  redo: (steps?: number) => void;
  go: (index: number) => void;
  clear: () => void;
  reset: (newInitialValue?: T) => void;
}

interface HistorySnapshot<T> {
  history: T[];
  pointer: number;
}

export function useHistoryState<T>(
  initialValue: T | (() => T),
  options: UseHistoryStateOptions = {},
): UseHistoryStateReturn<T> {
  const { capacity = Infinity } = options;
  const maxCapacity = Math.max(1, capacity);

  const resolveInitial = (): T =>
    typeof initialValue === 'function'
      ? (initialValue as () => T)()
      : initialValue;

  const [snapshot, setSnapshot] = useState<HistorySnapshot<T>>(() => ({
    history: [resolveInitial()],
    pointer: 0,
  }));

  const state = snapshot.history[snapshot.pointer] as T;
  const canUndo = snapshot.pointer > 0;
  const canRedo = snapshot.pointer < snapshot.history.length - 1;

  const set = useEventCallback((value: SetStateAction<T>) => {
    setSnapshot((prev) => {
      const current = prev.history[prev.pointer] as T;
      const nextValue =
        typeof value === 'function'
          ? (value as (prevState: T) => T)(current)
          : value;

      if (Object.is(current, nextValue)) {
        return prev;
      }

      const nextHistory = [
        ...prev.history.slice(0, prev.pointer + 1),
        nextValue,
      ];

      if (nextHistory.length > maxCapacity) {
        const overflow = nextHistory.length - maxCapacity;
        const trimmed = nextHistory.slice(overflow);
        return {
          history: trimmed,
          pointer: trimmed.length - 1,
        };
      }

      return {
        history: nextHistory,
        pointer: nextHistory.length - 1,
      };
    });
  });

  const undo = useEventCallback((steps = 1) => {
    if (steps <= 0) {
      return;
    }
    setSnapshot((prev) => {
      if (prev.pointer <= 0) {
        return prev;
      }
      return {
        ...prev,
        pointer: Math.max(0, prev.pointer - steps),
      };
    });
  });

  const redo = useEventCallback((steps = 1) => {
    if (steps <= 0) {
      return;
    }
    setSnapshot((prev) => {
      if (prev.pointer >= prev.history.length - 1) {
        return prev;
      }
      return {
        ...prev,
        pointer: Math.min(prev.history.length - 1, prev.pointer + steps),
      };
    });
  });

  const go = useEventCallback((index: number) => {
    setSnapshot((prev) => {
      const clamped = Math.max(
        0,
        Math.min(prev.history.length - 1, index),
      );
      if (clamped === prev.pointer) {
        return prev;
      }
      return {
        ...prev,
        pointer: clamped,
      };
    });
  });

  const clear = useEventCallback(() => {
    setSnapshot((prev) => {
      if (prev.history.length === 1 && prev.pointer === 0) {
        return prev;
      }
      const current = prev.history[prev.pointer] as T;
      return {
        history: [current],
        pointer: 0,
      };
    });
  });

  const reset = useEventCallback((newInitialValue?: T) => {
    const nextInitial =
      newInitialValue !== undefined ? newInitialValue : resolveInitial();
    setSnapshot({
      history: [nextInitial],
      pointer: 0,
    });
  });

  return {
    state,
    history: snapshot.history,
    pointer: snapshot.pointer,
    canUndo,
    canRedo,
    set,
    undo,
    redo,
    go,
    clear,
    reset,
  };
}
