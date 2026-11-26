import { useMemo, useSyncExternalStore } from "react";

const getServerSnapshot = (): string | null => null;

function createObjectUrlStore(source: Blob | MediaSource | null | undefined) {
  let currentUrl: string | null = null;

  return {
    getSnapshot: (): string | null => currentUrl,
    subscribe: (notify: () => void): (() => void) => {
      if (!source || typeof URL === "undefined" || typeof URL.createObjectURL !== "function") {
        currentUrl = null;
        return () => {};
      }

      const url = URL.createObjectURL(source);
      currentUrl = url;
      notify();

      return () => {
        currentUrl = null;
        if (typeof URL.revokeObjectURL === "function") {
          URL.revokeObjectURL(url);
        }
      };
    },
  };
}

/**
 * Creates a temporary object URL (`URL.createObjectURL`) for a `Blob`, `File`, or `MediaSource` and automatically revokes it on change or unmount.
 *
 * @category Browser
 * @param source - `Blob`, `File`, or `MediaSource` instance, or `null`/`undefined`
 * @returns Generated object URL string, or `null` when `source` is empty
 *
 * @example
 * ```tsx
 * const previewUrl = useObjectUrl(selectedFile);
 * // {previewUrl && <img src={previewUrl} alt="Preview" />}
 * ```
 */
export function useObjectUrl(source: Blob | MediaSource | null | undefined): string | null {
  const store = useMemo(() => createObjectUrlStore(source), [source]);

  return useSyncExternalStore(store.subscribe, store.getSnapshot, getServerSnapshot);
}
