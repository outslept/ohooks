import { Dispatch, SetStateAction, useCallback, useState } from "react";

export function useToggle(
  defaultValue = false,
): [boolean, (nextValue?: unknown) => void, Dispatch<SetStateAction<boolean>>] {
  const [value, setValue] = useState<boolean>(defaultValue);

  const toggle = useCallback((nextValue?: unknown) => {
    setValue((prev) => (typeof nextValue === 'boolean' ? nextValue : !prev))
  }, []);

  return [value, toggle, setValue]
}
