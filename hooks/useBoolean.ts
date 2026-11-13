import { Dispatch, SetStateAction, useCallback, useState } from "react";

export interface UseBooleanReturn {
  /** Current boolean state */
  value: boolean;
  /** Standard React state setter */
  setValue: Dispatch<SetStateAction<boolean>>;
  /** Sets the state to `true` */
  setTrue: () => void;
  /** Sets the state to `false` */
  setFalse: () => void;
  /** Flips the current boolean state */
  toggle: () => void;
}

/**
 * Manages a boolean state with helper functions to set, reset, and toggle the value.
 *
 * @category State
 * @param defaultValue - Initial boolean value (default: `false`)
 * @returns Object containing the current boolean value and state updater helpers
 *
 * @example
 * ```tsx
 * const { value, setTrue, setFalse, toggle } = useBoolean(false);
 * ```
 */
export function useBoolean(defaultValue = false): UseBooleanReturn {
  const [value, setValue] = useState<boolean>(defaultValue);

  const setTrue = useCallback(() => {
    setValue(true);
  }, []);

  const setFalse = useCallback(() => {
    setValue(false);
  }, []);

  const toggle = useCallback(() => {
    setValue((prev) => !prev);
  }, []);

  return { value, setValue, setTrue, setFalse, toggle };
}
