import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';
import { useLatest } from './useLatest';

export interface UseControllableStateOptions<T> {
  value?: T;
  defaultValue: T | (() => T);
  onChange?: (value: T) => void;
  shouldUpdate?: (prev: T, next: T) => boolean;
}

export function useControllableState<T>(
  options: UseControllableStateOptions<T>
): [
  value: T,
  setValue: Dispatch<SetStateAction<T>>,
  isControlled: boolean,
] {
  const {
    value: controlledValue,
    defaultValue,
    onChange,
    shouldUpdate = Object.is,
  } = options;

  const isControlled = controlledValue !== undefined;
  const wasControlledRef: { current: boolean } = useRef(isControlled);

  useEffect(() => {
    if (
      typeof process !== 'undefined' &&
      process.env?.NODE_ENV !== 'production'
    ) {
      if (wasControlledRef.current !== isControlled) {
        console.warn(
          `Warning: useControllableState switched from ${
            wasControlledRef.current ? 'controlled' : 'uncontrolled'
          } to ${
            isControlled ? 'controlled' : 'uncontrolled'
          } mode. Components should not switch between controlled and uncontrolled during their lifetime.`
        );
      }
    }
    wasControlledRef.current = isControlled;
  }, [isControlled]);

  const [uncontrolledValue, setUncontrolledValue] = useState<T>(defaultValue);
  const currentValue = isControlled
    ? (controlledValue as T)
    : uncontrolledValue;

  const valueRef: { current: T } = useRef(currentValue);
  useIsomorphicLayoutEffect(() => {
    valueRef.current = currentValue;
  });

  const isControlledRef = useLatest(isControlled);
  const onChangeRef = useLatest(onChange);
  const shouldUpdateRef = useLatest(shouldUpdate);

  const setValue: Dispatch<SetStateAction<T>> = useCallback(
    (nextAction: SetStateAction<T>) => {
      const prev = valueRef.current;
      const next =
        typeof nextAction === 'function'
          ? (nextAction as (prevState: T) => T)(prev)
          : nextAction;

      if (shouldUpdateRef.current(prev, next)) {
        return;
      }

      if (!isControlledRef.current) {
        valueRef.current = next;
        setUncontrolledValue(next);
      }

      onChangeRef.current?.(next);
    },
    [isControlledRef, onChangeRef, shouldUpdateRef]
  );

  return [currentValue, setValue, isControlled];
}

export default useControllableState;
