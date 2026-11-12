import { Dispatch, SetStateAction, useCallback, useState } from "react";

export interface UseBooleanReturn {
  value: boolean;
  setValue: Dispatch<SetStateAction<boolean>>,
  setTrue: () => void;
  setFalse: () => void;
  toggle: () => void;
}

export function useBoolean(defaultValue = false): UseBooleanReturn {
  const [value, setValue] = useState<boolean>(defaultValue)

  const setTrue = useCallback(() => {
    setValue(true);
  }, []);

  const setFalse = useCallback(() => {
    setValue(false);
  }, []);

  const toggle = useCallback(() => {
    setValue((prev) => !prev);
  }, []);

  return { value, setValue, setTrue, setFalse, toggle}
}
