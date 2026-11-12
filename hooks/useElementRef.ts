import { type RefCallback, useCallback, useState } from 'react';

export type UseElementRefReturn<T extends Element = HTMLElement> = [
  RefCallback<T>,
  T | null,
];

export function useElementRef<
  T extends Element = HTMLElement,
>(): UseElementRefReturn<T> {
  const [element, setElement] = useState<T | null>(null);

  const ref: RefCallback<T> = useCallback((node: T | null) => {
    setElement(node);
  }, []);

  return [ref, element];
}
