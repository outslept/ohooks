import { useEffect, useRef } from 'react';

export function useUnmountedRef(): { readonly current: boolean } {
  const unmountedRef = useRef<boolean>(false);

  useEffect(() => {
    unmountedRef.current = false;
    return () => {
      unmountedRef.current = true;
    };
  }, []);

  return unmountedRef;
}
