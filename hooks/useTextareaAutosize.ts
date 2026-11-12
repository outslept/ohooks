import { useCallback, useEffect } from 'react';
import {
  EventListenerTarget,
  resolveTargetElement,
} from './useEventListener';
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';
import { useLatest } from './useLatest';

export interface UseTextareaAutosizeOptions {
  minHeight?: number;
  maxHeight?: number;
  onResize?: (height: number) => void;
}

export interface UseTextareaAutosizeReturn {
  resize: () => void;
}

export function useTextareaAutosize(
  target: EventListenerTarget<HTMLTextAreaElement>,
  value?: string,
  options: UseTextareaAutosizeOptions = {}
): UseTextareaAutosizeReturn {
  const { minHeight, maxHeight, onResize } = options;
  const onResizeRef = useLatest(onResize);

  const resize = useCallback(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const textarea = resolveTargetElement(target);
    if (!textarea) {
      return;
    }

    const computedStyle = window.getComputedStyle(textarea);
    const isBorderBox = computedStyle.boxSizing === 'border-box';
    const borderTop = parseFloat(computedStyle.borderTopWidth) || 0;
    const borderBottom = parseFloat(computedStyle.borderBottomWidth) || 0;
    const paddingTop = parseFloat(computedStyle.paddingTop) || 0;
    const paddingBottom = parseFloat(computedStyle.paddingBottom) || 0;

    const previousOverflow = textarea.style.overflowY;
    textarea.style.height = 'auto';
    textarea.style.overflowY = 'hidden';

    let nextHeight = textarea.scrollHeight;

    if (isBorderBox) {
      nextHeight += borderTop + borderBottom;
    } else {
      nextHeight -= paddingTop + paddingBottom;
    }

    if (minHeight !== undefined) {
      nextHeight = Math.max(nextHeight, minHeight);
    }

    let shouldScroll = false;
    if (maxHeight !== undefined && nextHeight > maxHeight) {
      nextHeight = maxHeight;
      shouldScroll = true;
    }

    textarea.style.height = `${nextHeight}px`;
    textarea.style.overflowY = shouldScroll
      ? 'auto'
      : previousOverflow === 'auto'
        ? 'hidden'
        : previousOverflow;

    onResizeRef.current?.(nextHeight);
  }, [target, minHeight, maxHeight, onResizeRef]);

  useIsomorphicLayoutEffect(() => {
    resize();
  }, [value, resize]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const textarea = resolveTargetElement(target);
    if (!textarea) {
      return;
    }

    textarea.addEventListener('input', resize);
    window.addEventListener('resize', resize);

    return () => {
      textarea.removeEventListener('input', resize);
      window.removeEventListener('resize', resize);
    };
  }, [target, resize]);

  return { resize };
}

export default useTextareaAutosize;
