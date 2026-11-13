import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useState,
} from 'react';

/** Function that toggles a boolean state or sets it to an explicit boolean value. */
export interface ToggleFn {
  /** Flips the current boolean value, or sets it to `nextValue` when a boolean is passed. */
  (nextValue?: boolean): void;
  /** Safely ignores non-boolean event arguments so `toggle` can be passed directly to `onClick`. */
  (event: unknown): void;
}

/**
 * Manages a boolean state with a `toggle` function that also accepts an explicit boolean or DOM event.
 *
 * @category State
 * @param defaultValue - Initial boolean state (default: `false`)
 * @returns A tuple of `[value, toggle, setValue]`
 *
 * @example
 * ```tsx
 * const [isOpen, toggleOpen, setOpen] = useToggle(false);
 * ```
 */
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
