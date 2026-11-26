import { type RefCallback, useCallback, useState } from "react";

export type UseElementRefReturn<T extends Element = HTMLElement> = [RefCallback<T>, T | null];

/**
 * Provides a callback ref and reactive state for the mounted DOM element so effects re-run when the node attaches or detaches.
 *
 * @category DOM
 * @returns Tuple of `[refCallback, element]`
 *
 * @example
 * ```tsx
 * const [ref, element] = useElementRef<HTMLDivElement>();
 * ```
 */
export function useElementRef<T extends Element = HTMLElement>(): UseElementRefReturn<T> {
  const [element, setElement] = useState<T | null>(null);

  const ref: RefCallback<T> = useCallback((node: T | null) => {
    setElement(node);
  }, []);

  return [ref, element];
}
