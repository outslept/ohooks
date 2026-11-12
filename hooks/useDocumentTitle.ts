import { useRef } from 'react';
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';
import { useUnmount } from './useUnmount';

export interface UseDocumentTitleOptions {
  restoreOnUnmount?: boolean;
}

export function useDocumentTitle(
  title: string,
  options: UseDocumentTitleOptions = {},
): void {
  const { restoreOnUnmount = false } = options;
  const originalTitleRef = useRef<string | null>(null);

  useIsomorphicLayoutEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    if (originalTitleRef.current === null) {
      originalTitleRef.current = document.title;
    }

    if (document.title !== title) {
      document.title = title;
    }
  }, [title]);

  useUnmount(() => {
    if (
      restoreOnUnmount &&
      typeof document !== 'undefined' &&
      originalTitleRef.current !== null
    ) {
      document.title = originalTitleRef.current;
    }
  });
}
