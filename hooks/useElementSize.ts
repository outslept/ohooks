import { useState } from 'react';
import { type EventListenerTarget } from './useEventListener';
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';
import {
  type UseResizeObserverOptions,
  useResizeObserver,
} from './useResizeObserver';

export interface ElementSize {
  width: number;
  height: number;
}

export interface UseElementSizeOptions
  extends Omit<UseResizeObserverOptions, 'onResize'> {
  initialWidth?: number;
  initialHeight?: number;
}

function resolveElement<T extends Element>(
  target: EventListenerTarget<T>,
): T | null {
  if (target === null || target === undefined) {
    return null;
  }
  if (typeof target === 'object' && 'current' in target) {
    return target.current;
  }
  return target;
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

    const element = resolveElement(target);
    if (!element) {
      return;
    }

    const rect = element.getBoundingClientRect();
    setSize((prev) => {
      if (prev.width === rect.width && prev.height === rect.height) {
        return prev;
      }
      return { width: rect.width, height: rect.height };
    });
  }, [target, enabled]);

  useResizeObserver(target, {
    box,
    enabled,
    onResize: (entry) => {
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
      } else if (entry.contentBoxSize?.length > 0) {
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
  });

  return size;
}
