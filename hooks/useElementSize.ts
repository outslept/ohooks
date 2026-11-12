import { useState } from 'react';
import {
  type EventListenerTarget,
  resolveTargetElement,
} from './useEventListener';
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';
import {
  type UseResizeObserverOptions,
  useResizeObserver,
} from './useResizeObserver';

export interface ElementSize {
  width: number;
  height: number;
}

export interface UseElementSizeOptions extends UseResizeObserverOptions {
  initialWidth?: number | undefined;
  initialHeight?: number | undefined;
}

function measureElement(
  element: Element,
  box: ResizeObserverBoxOptions,
): ElementSize {
  const rect = element.getBoundingClientRect();

  if (box === 'border-box') {
    return { width: rect.width, height: rect.height };
  }

  if (
    typeof window === 'undefined' ||
    typeof window.getComputedStyle !== 'function'
  ) {
    return { width: rect.width, height: rect.height };
  }

  const style = window.getComputedStyle(element);
  const paddingX =
    (parseFloat(style.paddingLeft) || 0) +
    (parseFloat(style.paddingRight) || 0);
  const paddingY =
    (parseFloat(style.paddingTop) || 0) +
    (parseFloat(style.paddingBottom) || 0);
  const borderX =
    (parseFloat(style.borderLeftWidth) || 0) +
    (parseFloat(style.borderRightWidth) || 0);
  const borderY =
    (parseFloat(style.borderTopWidth) || 0) +
    (parseFloat(style.borderBottomWidth) || 0);

  const contentWidth = Math.max(0, rect.width - paddingX - borderX);
  const contentHeight = Math.max(0, rect.height - paddingY - borderY);

  if (box === 'device-pixel-content-box') {
    const dpr = window.devicePixelRatio || 1;
    return {
      width: Math.round(contentWidth * dpr),
      height: Math.round(contentHeight * dpr),
    };
  }

  return {
    width: contentWidth,
    height: contentHeight,
  };
}

export function useElementSize<T extends Element = HTMLElement>(
  target: EventListenerTarget<T>,
  options: UseElementSizeOptions = {},
): ElementSize {
  const {
    initialWidth = 0,
    initialHeight = 0,
    box = 'content-box',
    enabled = true,
  } = options;

  const [size, setSize] = useState<ElementSize>({
    width: initialWidth,
    height: initialHeight,
  });

  useIsomorphicLayoutEffect(() => {
    if (!enabled) {
      return;
    }

    const element = resolveTargetElement(target);
    if (!element) {
      return;
    }

    const measured = measureElement(element, box);
    setSize((prev) => {
      if (prev.width === measured.width && prev.height === measured.height) {
        return prev;
      }
      return measured;
    });
  }, [target, box, enabled]);

  useResizeObserver(
    target,
    (entry) => {
      let nextWidth = entry.contentRect.width;
      let nextHeight = entry.contentRect.height;

      if (box === 'border-box' && entry.borderBoxSize?.length > 0) {
        const boxSize = entry.borderBoxSize[0];
        if (boxSize) {
          nextWidth = boxSize.inlineSize;
          nextHeight = boxSize.blockSize;
        }
      } else if (
        box === 'device-pixel-content-box' &&
        entry.devicePixelContentBoxSize?.length > 0
      ) {
        const boxSize = entry.devicePixelContentBoxSize[0];
        if (boxSize) {
          nextWidth = boxSize.inlineSize;
          nextHeight = boxSize.blockSize;
        }
      } else if (box === 'content-box' && entry.contentBoxSize?.length > 0) {
        const boxSize = entry.contentBoxSize[0];
        if (boxSize) {
          nextWidth = boxSize.inlineSize;
          nextHeight = boxSize.blockSize;
        }
      }

      setSize((prev) => {
        if (prev.width === nextWidth && prev.height === nextHeight) {
          return prev;
        }
        return { width: nextWidth, height: nextHeight };
      });
    },
    { box, enabled },
  );

  return size;
}

export default useElementSize;
