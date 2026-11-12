import {
  type Dispatch,
  type SetStateAction,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useEventCallback } from './useEventCallback';
import { useLatest } from './useLatest';

export interface UseControllableStateParams<T> {
  value?: T;
  defaultValue?: T | (() => T);
  onChange?: (value: T) => void;
}

export function useControllableState<T>(params: {
  value?: T;
  defaultValue: T | (() => T);
  onChange?: (value: T) => void;
}): [T, Dispatch<SetStateAction<T>>];

export function useControllableState<T>(
  params: UseControllableStateParams<T>,
): [T | undefined, Dispatch<SetStateAction<T | undefined>>];

export function useControllableState<T>({
  value,
  defaultValue,
  onChange,
}: UseControllableStateParams<T>): [
  T | undefined,
  Dispatch<SetStateAction<T | undefined>>,
] {
  const [uncontrolledValue, setUncontrolledValue] = useState<T | undefined>(
    defaultValue,
  );
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : uncontrolledValue;

  const prevUncontrolledRef = useRef(uncontrolledValue);
  const onChangeRef = useLatest(onChange);

  useEffect(() => {
    if (!Object.is(prevUncontrolledRef.current, uncontrolledValue)) {
      onChangeRef.current?.(uncontrolledValue as T);
      prevUncontrolledRef.current = uncontrolledValue;
    }
  }, [uncontrolledValue, onChangeRef]);

  const setValue: Dispatch<SetStateAction<T | undefined>> = useEventCallback(
    (next) => {
      if (isControlled) {
        const resolver = next as (prevState?: T) => T;
        const nextValue =
          typeof next === 'function' ? resolver(value) : next;

        if (!Object.is(nextValue, value)) {
          onChangeRef.current?.(nextValue as T);
        }
      } else {
        setUncontrolledValue(next);
      }
    },
  );

  return [currentValue, setValue];
}
