import { useCallback, useRef, useSyncExternalStore } from 'react';

/** Reactive snapshot of `window.visualViewport` metrics. */
export interface VisualViewportState {
  /** Visual viewport width in CSS pixels. */
  width: number;
  /** Visual viewport height in CSS pixels. */
  height: number;
  /** Horizontal offset of the visual viewport relative to the layout viewport. */
  offsetLeft: number;
  /** Vertical offset of the visual viewport relative to the layout viewport. */
  offsetTop: number;
  /** Horizontal coordinate of the visual viewport relative to the document. */
  pageLeft: number;
  /** Vertical coordinate of the visual viewport relative to the document. */
  pageTop: number;
  /** Pinch-zoom scaling factor applied to the visual viewport. */
  scale: number;
  /** Whether `window.visualViewport` is natively supported in the current browser. */
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

/**
 * Tracks the browser's `VisualViewport` dimensions, offsets, and pinch-zoom scale (useful for virtual keyboards).
 *
 * @category DOM
 * @returns Reactive `VisualViewportState` snapshot
 *
 * @example
 * ```tsx
 * const { width, height, scale } = useVisualViewport();
 * ```
 */
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
