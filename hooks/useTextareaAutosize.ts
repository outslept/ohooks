import { useCallback, useEffect } from 'react';
import {
  EventListenerTarget,
  resolveTargetElement,
} from './useEventListener';
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';
import { useLatest } from './useLatest';

/** Configuration options for `useTextareaAutosize`. */
export interface UseTextareaAutosizeOptions {
  /** Minimum height of the textarea in pixels. */
  minHeight?: number;
  /** Maximum height of the textarea in pixels before vertical scrolling is enabled. */
  maxHeight?: number;
  /** Callback fired with the new pixel height whenever the textarea resizes. */
  onResize?: (height: number) => void;
}

/** Return value of `useTextareaAutosize`. */
export interface UseTextareaAutosizeReturn {
  /** Imperatively recalculates and applies the textarea height. */
  resize: () => void;
}

/**
 * Automatically adjusts the height of a `<textarea>` element to fit its content.
 *
 * @category DOM
 * @param target - Ref, element, or getter for the `<textarea>`
 * @param value - Optional controlled text value that triggers a resize on change
 * @param options - Minimum/maximum height constraints and `onResize` callback
 * @returns An object containing the manual `resize` trigger function
 *
 * @example
 * ```tsx
 * const textareaRef = useRef<HTMLTextAreaElement>(null);
 * useTextareaAutosize(textareaRef, text, { maxHeight: 300 });
 * ```
 */
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
