import { useCallback, useEffect, useState } from 'react';
import {
  EventListenerTarget,
} from './useEventListener';
import { useLatest } from './useLatest';
import { resolveTargetElement } from '@/lib/utils';

export interface UseFullscreenOptions {
  /** Callback fired when fullscreen mode is entered */
  onEnter?: () => void;
  /** Callback fired when fullscreen mode is exited */
  onExit?: () => void;
  /** Callback fired if entering or exiting fullscreen fails */
  onError?: (error: unknown) => void;
}

export interface UseFullscreenReturn {
  /** Whether the target element (or document) is currently in fullscreen mode */
  isFullscreen: boolean;
  /** Whether the Fullscreen API is supported in the current browser */
  isSupported: boolean;
  /** Requests fullscreen mode for the target element */
  enter: () => Promise<void>;
  /** Exits fullscreen mode */
  exit: () => Promise<void>;
  /** Toggles fullscreen mode on or off */
  toggle: () => Promise<void>;
}

interface VendorDocument extends Document {
  webkitFullscreenEnabled?: boolean;
  mozFullScreenEnabled?: boolean;
  msFullscreenEnabled?: boolean;
  webkitFullscreenElement?: Element | null;
  mozFullScreenElement?: Element | null;
  msFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void> | void;
  mozCancelFullScreen?: () => Promise<void> | void;
  msExitFullscreen?: () => Promise<void> | void;
}

interface VendorElement extends HTMLElement {
  webkitRequestFullscreen?: () => Promise<void> | void;
  mozRequestFullScreen?: () => Promise<void> | void;
  msRequestFullscreen?: () => Promise<void> | void;
}

function getFullscreenElement(): Element | null {
  if (typeof document === 'undefined') {
    return null;
  }
  const doc = document as VendorDocument;
  return (
    doc.fullscreenElement ??
    doc.webkitFullscreenElement ??
    doc.mozFullScreenElement ??
    doc.msFullscreenElement ??
    null
  );
}

function checkIsSupported(): boolean {
  if (typeof document === 'undefined') {
    return false;
  }
  const doc = document as VendorDocument;
  return Boolean(
    doc.fullscreenEnabled ||
      doc.webkitFullscreenEnabled ||
      doc.mozFullScreenEnabled ||
      doc.msFullscreenEnabled
  );
}

function isTargetCurrentlyFullscreen(
  target: EventListenerTarget<HTMLElement> | undefined
): boolean {
  const activeElement = getFullscreenElement();
  if (!activeElement) {
    return false;
  }
  const targetElement = resolveTargetElement(target);
  return targetElement ? activeElement === targetElement : true;
}

/**
 * Manages fullscreen state for a target DOM element (or `document.documentElement`) with vendor prefix support.
 *
 * @category Browser
 * @param target - Optional target DOM element or React ref (defaults to `document.documentElement`)
 * @param options - Lifecycle callbacks (`onEnter`, `onExit`, `onError`)
 * @returns Fullscreen state (`isFullscreen`, `isSupported`) and control methods (`enter`, `exit`, `toggle`)
 *
 * @example
 * ```tsx
 * const { isFullscreen, toggle } = useFullscreen(videoContainerRef);
 * ```
 */
export function useFullscreen(
  target?: EventListenerTarget<HTMLElement>,
  options: UseFullscreenOptions = {}
): UseFullscreenReturn {
  const optionsRef = useLatest(options);
  const isSupported = checkIsSupported();

  const [isFullscreen, setIsFullscreen] = useState<boolean>(() =>
    isTargetCurrentlyFullscreen(target)
  );
  const [prevTarget, setPrevTarget] =
    useState<EventListenerTarget<HTMLElement> | undefined>(target);

  if (prevTarget !== target) {
    setPrevTarget(target);
    const nextIsFullscreen = isTargetCurrentlyFullscreen(target);
    if (isFullscreen !== nextIsFullscreen) {
      setIsFullscreen(nextIsFullscreen);
    }
  }

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    const handleChange = () => {
      const nextIsFullscreen = isTargetCurrentlyFullscreen(target);
      setIsFullscreen((prev) => {
        if (prev !== nextIsFullscreen) {
          if (nextIsFullscreen) {
            optionsRef.current.onEnter?.();
          } else {
            optionsRef.current.onExit?.();
          }
        }
        return nextIsFullscreen;
      });
    };

    const events = [
      'fullscreenchange',
      'webkitfullscreenchange',
      'mozfullscreenchange',
      'MSFullscreenChange',
    ];

    for (const eventName of events) {
      document.addEventListener(eventName, handleChange);
    }

    return () => {
      for (const eventName of events) {
        document.removeEventListener(eventName, handleChange);
      }
    };
  }, [target, optionsRef]);

  const enter = useCallback(async (): Promise<void> => {
    if (!isSupported || typeof document === 'undefined') {
      return;
    }

    const element = resolveTargetElement(
      target,
      document.documentElement
    ) as VendorElement | null;
    if (!element) {
      return;
    }

    try {
      const requestFn =
        element.requestFullscreen ??
        element.webkitRequestFullscreen ??
        element.mozRequestFullScreen ??
        element.msRequestFullscreen;

      if (typeof requestFn === 'function') {
        await requestFn.call(element);
      }
    } catch (error) {
      optionsRef.current.onError?.(error);
    }
  }, [isSupported, target, optionsRef]);

  const exit = useCallback(async (): Promise<void> => {
    if (!isSupported || typeof document === 'undefined') {
      return;
    }

    const activeElement = getFullscreenElement();
    if (!activeElement) {
      return;
    }

    const targetElement = resolveTargetElement(target);
    if (targetElement && activeElement !== targetElement) {
      return;
    }

    const doc = document as VendorDocument;
    try {
      const exitFn =
        doc.exitFullscreen ??
        doc.webkitExitFullscreen ??
        doc.mozCancelFullScreen ??
        doc.msExitFullscreen;

      if (typeof exitFn === 'function') {
        await exitFn.call(doc);
      }
    } catch (error) {
      optionsRef.current.onError?.(error);
    }
  }, [isSupported, target, optionsRef]);

  const toggle = useCallback(async (): Promise<void> => {
    if (isFullscreen) {
      await exit();
    } else {
      await enter();
    }
  }, [isFullscreen, enter, exit]);

  return {
    isFullscreen,
    isSupported,
    enter,
    exit,
    toggle,
  };
}

export default useFullscreen;
