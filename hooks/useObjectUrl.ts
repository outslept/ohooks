import { useEffect, useState } from 'react';

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
export function useObjectUrl(
  source: Blob | MediaSource | null | undefined,
): string | null {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    if (
      !source ||
      typeof URL === 'undefined' ||
      typeof URL.createObjectURL !== 'function'
    ) {
      setObjectUrl(null);
      return;
    }

    const url = URL.createObjectURL(source);
    setObjectUrl(url);

    return () => {
      if (typeof URL.revokeObjectURL === 'function') {
        URL.revokeObjectURL(url);
      }
    };
  }, [source]);

  return objectUrl;
}
