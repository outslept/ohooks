import {
  type Ref,
  type RefCallback,
  type RefObject,
  useCallback,
  useRef,
} from 'react';
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';

export type PossibleRef<T> = Ref<T> | undefined | null;

export function assignRef<T>(
  ref: PossibleRef<T>,
  value: T | null,
): (() => void) | void {
  if (typeof ref === 'function') {
    return ref(value);
  }
  if (ref !== null && ref !== undefined && typeof ref === 'object') {
    (ref as RefObject<T | null>).current = value;
  }
}

function attachRefWithCleanup<T>(
  ref: PossibleRef<T>,
  node: T,
): { cleanup: () => void; hasExplicitCleanup: boolean } {
  if (typeof ref === 'function') {
    const result = ref(node);
    if (typeof result === 'function') {
      return { cleanup: result, hasExplicitCleanup: true };
    }
    return {
      cleanup: () => {
        ref(null);
      },
      hasExplicitCleanup: false,
    };
  }

  if (ref !== null && ref !== undefined && typeof ref === 'object') {
    (ref as RefObject<T | null>).current = node;
    return {
      cleanup: () => {
        (ref as RefObject<T | null>).current = null;
      },
      hasExplicitCleanup: false,
    };
  }

  return { cleanup: () => {}, hasExplicitCleanup: false };
}

export function mergeRefs<T>(
  ...refs: ReadonlyArray<PossibleRef<T>>
): RefCallback<T> {
  return (node: T | null) => {
    if (node === null) {
      for (const ref of refs) {
        assignRef(ref, null);
      }
      return;
    }

    const cleanups: Array<() => void> = [];
    let hasExplicitCleanup = false;

    for (const ref of refs) {
      const entry = attachRefWithCleanup(ref, node);
      cleanups.push(entry.cleanup);
      if (entry.hasExplicitCleanup) {
        hasExplicitCleanup = true;
      }
    }

    if (hasExplicitCleanup) {
      return () => {
        for (const cleanup of cleanups) {
          cleanup();
        }
      };
    }
  };
}

/**
 * Combines multiple React refs (callback refs, `RefObject`s, or `null`/`undefined`) into a single stable callback ref with React 19 cleanup support.
 *
 * @category DOM
 * @param refs - Refs to merge into a single callback ref
 * @returns Referentially stable `RefCallback<T>`
 *
 * @example
 * ```tsx
 * const mergedRef = useMergeRefs(localRef, forwardedRef);
 * // <div ref={mergedRef} />
 * ```
 */
export function useMergeRefs<T>(
  ...refs: ReadonlyArray<PossibleRef<T>>
): RefCallback<T> {
  const refsRef = useRef<ReadonlyArray<PossibleRef<T>>>(refs);
  const currentNodeRef = useRef<T | null>(null);
  const activeCleanupsRef = useRef<Map<PossibleRef<T>, () => void>>(new Map());

  useIsomorphicLayoutEffect(() => {
    const prevRefs = refsRef.current;
    refsRef.current = refs;

    const node = currentNodeRef.current;
    if (node === null) {
      return;
    }

    const nextSet = new Set(refs);

    for (const prevRef of prevRefs) {
      if (prevRef && !nextSet.has(prevRef)) {
        const cleanup = activeCleanupsRef.current.get(prevRef);
        if (cleanup) {
          cleanup();
          activeCleanupsRef.current.delete(prevRef);
        } else {
          assignRef(prevRef, null);
        }
      }
    }

    const prevSet = new Set(prevRefs);
    for (const nextRef of refs) {
      if (nextRef && !prevSet.has(nextRef)) {
        const { cleanup } = attachRefWithCleanup(nextRef, node);
        activeCleanupsRef.current.set(nextRef, cleanup);
      }
    }
  });

  return useCallback((node: T | null) => {
    currentNodeRef.current = node;

    for (const cleanup of activeCleanupsRef.current.values()) {
      cleanup();
    }
    activeCleanupsRef.current.clear();

    if (node === null) {
      return;
    }

    const currentRefs = refsRef.current;
    let hasExplicitCleanup = false;

    for (const ref of currentRefs) {
      if (!ref) {
        continue;
      }
      const entry = attachRefWithCleanup(ref, node);
      activeCleanupsRef.current.set(ref, entry.cleanup);
      if (entry.hasExplicitCleanup) {
        hasExplicitCleanup = true;
      }
    }

    if (hasExplicitCleanup) {
      return () => {
        currentNodeRef.current = null;
        for (const cleanup of activeCleanupsRef.current.values()) {
          cleanup();
        }
        activeCleanupsRef.current.clear();
      };
    }
  }, []);
}
