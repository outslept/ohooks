import { useEventCallback } from './useEventCallback';
import { type EventListenerTarget } from './useEventListener';
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';
import { useLatest } from './useLatest';
import { useResizeObserver } from './useResizeObserver';

export interface UseTextareaAutosizeOptions {
  minRows?: number;
  maxRows?: number;
  enabled?: boolean;
  onResize?: (height: number) => void;
}

function resolveTextarea(
  target: EventListenerTarget<HTMLTextAreaElement>,
): HTMLTextAreaElement | null {
  if (!target) {
    return null;
  }
  if (typeof target === 'object' && 'current' in target) {
    return target.current;
  }
  return target;
}

export function useTextareaAutosize(
  target: EventListenerTarget<HTMLTextAreaElement>,
  value: string,
  options: UseTextareaAutosizeOptions = {},
): void {
  const { minRows = 1, maxRows = Infinity, enabled = true, onResize } = options;
  const onResizeRef = useLatest(onResize);

  const resizeTextarea = useEventCallback(() => {
    if (
      !enabled ||
      typeof window === 'undefined' ||
      typeof window.getComputedStyle !== 'function'
    ) {
      return;
    }

    const textarea = resolveTextarea(target);
    if (!textarea) {
      return;
    }

    const style = window.getComputedStyle(textarea);
    const isBorderBox = style.boxSizing === 'border-box';
    const paddingSize =
      (parseFloat(style.paddingTop) || 0) +
      (parseFloat(style.paddingBottom) || 0);
    const borderSize =
      (parseFloat(style.borderTopWidth) || 0) +
      (parseFloat(style.borderBottomWidth) || 0);
    const lineHeight =
      parseFloat(style.lineHeight) ||
      (parseFloat(style.fontSize) || 16) * 1.2;

    const previousOverflow = textarea.style.overflowY;
    textarea.style.overflowY = 'hidden';
    textarea.style.height = 'auto';

    const contentScrollHeight = textarea.scrollHeight - paddingSize;
    const minContentHeight = Math.max(1, minRows) * lineHeight;
    const maxContentHeight =
      maxRows < Infinity ? Math.max(minRows, maxRows) * lineHeight : Infinity;

    const clampedContentHeight = Math.min(
      Math.max(contentScrollHeight, minContentHeight),
      maxContentHeight,
    );

    const finalHeight = isBorderBox
      ? clampedContentHeight + paddingSize + borderSize
      : clampedContentHeight;

    textarea.style.height = `${finalHeight}px`;
    textarea.style.overflowY =
      contentScrollHeight > maxContentHeight ? 'auto' : previousOverflow || 'hidden';

    onResizeRef.current?.(finalHeight);
  });

  useIsomorphicLayoutEffect(() => {
    resizeTextarea();
  }, [target, value, minRows, maxRows, enabled]);

  useResizeObserver(
    target,
    () => {
      resizeTextarea();
    },
    { enabled, box: 'border-box' },
  );
}
