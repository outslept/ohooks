import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useState,
} from 'react';

export interface ToggleFn {
  (nextValue?: boolean): void;
  (event: unknown): void;
}

export function useToggle(
  defaultValue = false,
): [boolean, ToggleFn, Dispatch<SetStateAction<boolean>>] {
  const [value, setValue] = useState<boolean>(defaultValue);

  const toggle: ToggleFn = useCallback((nextValue?: unknown) => {
    setValue((prev) =>
      typeof nextValue === 'boolean' ? nextValue : !prev,
    );
  }, []);

  return [value, toggle, setValue];
}
