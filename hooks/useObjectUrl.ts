import { useEffect, useState } from 'react';

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
