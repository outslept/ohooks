import { type Ref, type RefCallback, RefObject, useCallback } from 'react';

export type PossibleRef<T> = Ref<T> | undefined | null;

export function assignRef<T>(ref: PossibleRef<T>, value: T | null): void {
  if (typeof ref === 'function') {
    ref(value);
  } else if (ref !== null && ref !== undefined && typeof ref === 'object') {
    (ref as RefObject<T | null>).current = value;
  }
}

export function mergeRefs<T>(
  ...refs: ReadonlyArray<PossibleRef<T>>
): RefCallback<T> {
  return (node: T | null) => {
    for (const ref of refs) {
      assignRef(ref, node);
    }
  };
}

export function useMergeRefs<T>(
  ...refs: ReadonlyArray<PossibleRef<T>>
): RefCallback<T> {
  return useCallback(mergeRefs(...refs), refs);
}
