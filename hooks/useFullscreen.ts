import { useBoolean } from './useBoolean';
import { useEventCallback } from './useEventCallback';
import {
  type EventListenerTarget,
  useEventListener,
} from './useEventListener';
import { useLatest } from './useLatest';

export interface UseFullscreenOptions {
  onEnter?: () => void;
  onExit?: () => void;
}

export interface UseFullscreenReturn {
  isFullscreen: boolean;
  isEnabled: boolean;
  enter: () => Promise<void>;
  exit: () => Promise<void>;
  toggle: () => Promise<void>;
}

interface VendorDocument extends Document {
  webkitFullscreenElement?: Element | null;
  mozFullScreenElement?: Element | null;
  msFullscreenElement?: Element | null;
  webkitFullscreenEnabled?: boolean;
  mozFullScreenEnabled?: boolean;
  msFullscreenEnabled?: boolean;
  webkitExitFullscreen?: () => Promise<void> | void;
  mozCancelFullScreen?: () => Promise<void> | void;
  msExitFullscreen?: () => Promise<void> | void;
}

interface VendorElement extends Element {
  webkitRequestFullscreen?: () => Promise<void> | void;
  mozRequestFullScreen?: () => Promise<void> | void;
  msRequestFullscreen?: () => Promise<void> | void;
}

function resolveElement<T extends Element>(
  target?: EventListenerTarget<T>,
): Element | null {
  if (typeof document === 'undefined') {
    return null;
  }
  if (target === undefined) {
    return document.documentElement;
  }
  if (target === null) {
    return null;
  }
  if (typeof target === 'object' && 'current' in target) {
    return target.current;
  }
  return target;
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

function isFullscreenEnabled(): boolean {
  if (typeof document === 'undefined') {
    return false;
  }
  const doc = document as VendorDocument;
  return Boolean(
    doc.fullscreenEnabled ??
      doc.webkitFullscreenEnabled ??
      doc.mozFullScreenEnabled ??
      doc.msFullscreenEnabled ??
      false,
  );
}

export function useFullscreen<T extends Element = HTMLElement>(
  target?: EventListenerTarget<T>,
  options: UseFullscreenOptions = {},
): UseFullscreenReturn {
  const { onEnter, onExit } = options;
  const { value: isFullscreen, setValue: setIsFullscreen } = useBoolean(false);

  const onEnterRef = useLatest(onEnter);
  const onExitRef = useLatest(onExit);

  const handleFullscreenChange = (): void => {
    const currentFullscreenElement = getFullscreenElement();
    const targetElement = resolveElement(target);
    const active =
      currentFullscreenElement !== null &&
      (targetElement === null || currentFullscreenElement === targetElement);

    setIsFullscreen((prev) => {
      if (prev !== active) {
        if (active) {
          onEnterRef.current?.();
        } else {
          onExitRef.current?.();
        }
      }
      return active;
    });
  };

  const doc = typeof document !== 'undefined' ? document : null;

  useEventListener('fullscreenchange', handleFullscreenChange, doc);
  useEventListener('webkitfullscreenchange', handleFullscreenChange, doc);
  useEventListener('mozfullscreenchange', handleFullscreenChange, doc);
  useEventListener('MSFullscreenChange', handleFullscreenChange, doc);

  const enter = useEventCallback(async (): Promise<void> => {
    if (!isFullscreenEnabled()) {
      return;
    }

    const element = resolveElement(target) as VendorElement | null;
    if (!element) {
      return;
    }

    const requestMethod =
      element.requestFullscreen ??
      element.webkitRequestFullscreen ??
      element.mozRequestFullScreen ??
      element.msRequestFullscreen;

    if (typeof requestMethod === 'function') {
      await requestMethod.call(element);
    }
  });

  const exit = useEventCallback(async (): Promise<void> => {
    if (typeof document === 'undefined' || !getFullscreenElement()) {
      return;
    }

    const vendorDoc = document as VendorDocument;
    const exitMethod =
      vendorDoc.exitFullscreen ??
      vendorDoc.webkitExitFullscreen ??
      vendorDoc.mozCancelFullScreen ??
      vendorDoc.msExitFullscreen;

    if (typeof exitMethod === 'function') {
      await exitMethod.call(vendorDoc);
    }
  });

  const toggle = useEventCallback(async (): Promise<void> => {
    if (isFullscreen) {
      await exit();
    } else {
      await enter();
    }
  });

  return {
    isFullscreen,
    isEnabled: isFullscreenEnabled(),
    enter,
    exit,
    toggle,
  };
}
