import { useSyncExternalStore } from 'react';

export interface VisualViewportState {
  isSupported: boolean;
  width: number;
  height: number;
  offsetTop: number;
  offsetLeft: number;
  pageTop: number;
  pageLeft: number;
  scale: number;
}

const SERVER_SNAPSHOT: VisualViewportState = {
  isSupported: false,
  width: 0,
  height: 0,
  offsetTop: 0,
  offsetLeft: 0,
  pageTop: 0,
  pageLeft: 0,
  scale: 1,
};

let cachedSnapshot: VisualViewportState = SERVER_SNAPSHOT;

function subscribe(onStoreChange: () => void): () => void {
  if (typeof window === 'undefined' || !window.visualViewport) {
    return () => {};
  }

  const vv = window.visualViewport;
  vv.addEventListener('resize', onStoreChange);
  vv.addEventListener('scroll', onStoreChange);

  return () => {
    vv.removeEventListener('resize', onStoreChange);
    vv.removeEventListener('scroll', onStoreChange);
  };
}

function getSnapshot(): VisualViewportState {
  if (typeof window === 'undefined') {
    return SERVER_SNAPSHOT;
  }

  const vv = window.visualViewport;
  if (!vv) {
    const fallback: VisualViewportState = {
      isSupported: false,
      width: window.innerWidth,
      height: window.innerHeight,
      offsetTop: 0,
      offsetLeft: 0,
      pageTop: window.scrollY,
      pageLeft: window.scrollX,
      scale: 1,
    };

    if (
      cachedSnapshot.isSupported === fallback.isSupported &&
      cachedSnapshot.width === fallback.width &&
      cachedSnapshot.height === fallback.height &&
      cachedSnapshot.pageTop === fallback.pageTop &&
      cachedSnapshot.pageLeft === fallback.pageLeft
    ) {
      return cachedSnapshot;
    }

    cachedSnapshot = fallback;
    return cachedSnapshot;
  }

  if (
    cachedSnapshot.isSupported &&
    cachedSnapshot.width === vv.width &&
    cachedSnapshot.height === vv.height &&
    cachedSnapshot.offsetTop === vv.offsetTop &&
    cachedSnapshot.offsetLeft === vv.offsetLeft &&
    cachedSnapshot.pageTop === vv.pageTop &&
    cachedSnapshot.pageLeft === vv.pageLeft &&
    cachedSnapshot.scale === vv.scale
  ) {
    return cachedSnapshot;
  }

  cachedSnapshot = {
    isSupported: true,
    width: vv.width,
    height: vv.height,
    offsetTop: vv.offsetTop,
    offsetLeft: vv.offsetLeft,
    pageTop: vv.pageTop,
    pageLeft: vv.pageLeft,
    scale: vv.scale,
  };

  return cachedSnapshot;
}

function getServerSnapshot(): VisualViewportState {
  return SERVER_SNAPSHOT;
}

export function useVisualViewport(): VisualViewportState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
