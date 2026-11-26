import { useRef } from "react";
import { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect";
import { useUnmount } from "./useUnmount";

export interface UseDocumentTitleOptions {
  /** Restore the previous `document.title` when the component unmounts (default: `false`) */
  restoreOnUnmount?: boolean;
}

/**
 * Updates `document.title` reactively and optionally restores the original title on unmount.
 *
 * @category DOM
 * @param title - Document title string to set
 * @param options - Configuration for restoring the previous title on unmount
 *
 * @example
 * ```tsx
 * useDocumentTitle(`Inbox (${unreadCount})`, { restoreOnUnmount: true });
 * ```
 */
export function useDocumentTitle(title: string, options: UseDocumentTitleOptions = {}): void {
  const { restoreOnUnmount = false } = options;
  const originalTitleRef = useRef<string | null>(null);

  useIsomorphicLayoutEffect(() => {
    if (typeof document === "undefined") {
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
    if (restoreOnUnmount && typeof document !== "undefined" && originalTitleRef.current !== null) {
      document.title = originalTitleRef.current;
    }
  });
}
