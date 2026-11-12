import { useCallback, useRef, useSyncExternalStore } from 'react';

export interface VisualViewportState {
  width: number;
  height: number;
  offsetLeft: number;
  offsetTop: number;
  pageLeft: number;
  pageTop: number;
  scale: number;
  isSupported: boolean;
}

const SERVER_SNAPSHOT: VisualViewportState = Object.freeze({
  width: 0,
  height: 0,
  offsetLeft: 0,
  offsetTop: 0,
  pageLeft: 0,
  pageTop: 0,
  scale: 1,
  isSupported: false,
});

function getServerSnapshot(): VisualViewportState {
  return SERVER_SNAPSHOT;
}

function isSameViewportState(
  a: VisualViewportState,
  b: VisualViewportState
): boolean {
  return (
    a.width === b.width &&
    a.height === b.height &&
    a.offsetLeft === b.offsetLeft &&
    a.offsetTop === b.offsetTop &&
    a.pageLeft === b.pageLeft &&
    a.pageTop === b.pageTop &&
    a.scale === b.scale &&
    a.isSupported === b.isSupported
  );
}

function readViewportState(): VisualViewportState {
  if (typeof window === 'undefined') {
    return SERVER_SNAPSHOT;
  }

  const vv = window.visualViewport;
  if (vv) {
    return {
      width: vv.width,
      height: vv.height,
      offsetLeft: vv.offsetLeft,
      offsetTop: vv.offsetTop,
      pageLeft: vv.pageLeft,
      pageTop: vv.pageTop,
      scale: vv.scale,
      isSupported: true,
    };
  }

  return {
    width: window.innerWidth,
    height: window.innerHeight,
    offsetLeft: 0,
    offsetTop: 0,
    pageLeft: window.scrollX,
    pageTop: window.scrollY,
    scale: 1,
    isSupported: false,
  };
}

function subscribe(onStoreChange: () => void): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const vv = window.visualViewport;
  if (vv) {
    vv.addEventListener('resize', onStoreChange, { passive: true });
    vv.addEventListener('scroll', onStoreChange, { passive: true });

    return () => {
      vv.removeEventListener('resize', onStoreChange);
      vv.removeEventListener('scroll', onStoreChange);
    };
  }

  window.addEventListener('resize', onStoreChange, { passive: true });
  window.addEventListener('scroll', onStoreChange, { passive: true });

  return () => {
    window.removeEventListener('resize', onStoreChange);
    window.removeEventListener('scroll', onStoreChange);
  };
}

export function useVisualViewport(): VisualViewportState {
  const cacheRef: { current: VisualViewportState } = useRef(SERVER_SNAPSHOT);

  const getSnapshot = useCallback((): VisualViewportState => {
    const next = readViewportState();
    const prev = cacheRef.current;
    if (isSameViewportState(prev, next)) {
      return prev;
    }
    cacheRef.current = next;
    return next;
  }, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export default useVisualViewport;
