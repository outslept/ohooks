import { useCallback, useRef, useState } from "react";

export interface UseHistoryStateReturn<T> {
  /** Current present state value */
  state: T;
  /** Array of previous state snapshots */
  past: readonly T[];
  /** Array of undone state snapshots available for redo */
  future: readonly T[];
  /** Whether there is at least one past state to undo to */
  canUndo: boolean;
  /** Whether there is at least one future state to redo to */
  canRedo: boolean;
  /** Updates the present state and pushes the previous state onto `past` */
  set: (nextState: T | ((prevPresent: T) => T)) => void;
  /** Steps backward to the most recent state in `past` */
  undo: () => void;
  /** Steps forward to the next state in `future` */
  redo: () => void;
  /** Clears `past` and `future` history while keeping the current `state` */
  clear: () => void;
  /** Resets `state` to the initial value (or a new provided value) and clears history */
  reset: (...args: [newInitialValue?: T]) => void;
}

interface HistorySnapshot<T> {
  past: T[];
  present: T;
  future: T[];
}

/**
 * Manages state with undo/redo history tracking and configurable history capacity.
 *
 * @category State
 * @param initialPresent - Initial state value or lazy initializer function
 * @param capacity - Maximum number of past states to retain (default: `100`)
 * @returns Current `state`, `past`/`future` stacks, `canUndo`/`canRedo` flags, and history actions
 *
 * @example
 * ```tsx
 * const { state, set, undo, redo, canUndo, canRedo } = useHistoryState('');
 * ```
 */
export function useHistoryState<T>(
  initialPresent: T | (() => T),
  capacity: number = 100,
): UseHistoryStateReturn<T> {
  const safeCapacity = Math.max(1, capacity);

  const [history, setHistory] = useState<HistorySnapshot<T>>(() => {
    const resolved =
      typeof initialPresent === "function" ? (initialPresent as () => T)() : initialPresent;
    return {
      past: [],
      present: resolved,
      future: [],
    };
  });

  const initialValueRef: { current: T } = useRef(history.present);

  const set = useCallback(
    (nextState: T | ((prevPresent: T) => T)) => {
      setHistory((curr) => {
        const resolvedNext =
          typeof nextState === "function"
            ? (nextState as (prevPresent: T) => T)(curr.present)
            : nextState;

        if (Object.is(resolvedNext, curr.present)) {
          return curr;
        }

        const nextPast = [...curr.past, curr.present].slice(-safeCapacity);
        return {
          past: nextPast,
          present: resolvedNext,
          future: [],
        };
      });
    },
    [safeCapacity],
  );

  const undo = useCallback(() => {
    setHistory((curr) => {
      if (curr.past.length === 0) {
        return curr;
      }
      const previous = curr.past[curr.past.length - 1] as T;
      const newPast = curr.past.slice(0, curr.past.length - 1);
      return {
        past: newPast,
        present: previous,
        future: [curr.present, ...curr.future],
      };
    });
  }, []);

  const redo = useCallback(() => {
    setHistory((curr) => {
      if (curr.future.length === 0) {
        return curr;
      }
      const next = curr.future[0] as T;
      const newFuture = curr.future.slice(1);
      const nextPast = [...curr.past, curr.present].slice(-safeCapacity);
      return {
        past: nextPast,
        present: next,
        future: newFuture,
      };
    });
  }, [safeCapacity]);

  const clear = useCallback(() => {
    setHistory((curr) => ({
      past: [],
      present: curr.present,
      future: [],
    }));
  }, []);

  const reset = useCallback((...args: [newInitialValue?: T]) => {
    const resolvedResetValue = args.length > 0 ? (args[0] as T) : initialValueRef.current;
    initialValueRef.current = resolvedResetValue;
    setHistory({
      past: [],
      present: resolvedResetValue,
      future: [],
    });
  }, []);

  return {
    state: history.present,
    past: history.past,
    future: history.future,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
    set,
    undo,
    redo,
    clear,
    reset,
  };
}

export default useHistoryState;
