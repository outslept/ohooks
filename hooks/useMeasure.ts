import { type RefCallback, useCallback, useEffect, useState } from 'react';
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';

export interface MeasureRect {
  /** Horizontal offset of the measured box in pixels */
  x: number;
  /** Vertical offset of the measured box in pixels */
  y: number;
  /** Width of the measured box in pixels */
  width: number;
  /** Height of the measured box in pixels */
  height: number;
  /** Top inset of the measured box in pixels */
  top: number;
  /** Right edge coordinate (`left + width`) in pixels */
  right: number;
  /** Bottom edge coordinate (`top + height`) in pixels */
  bottom: number;
  /** Left inset of the measured box in pixels */
  left: number;
}

export interface UseMeasureOptions {
  /** CSS box model to observe (default: `'content-box'`) */
  box?: ResizeObserverBoxOptions;
  /** Whether measurement observation is active (default: `true`) */
  enabled?: boolean;
}

export type UseMeasureReturn<T extends Element = HTMLElement> = [
  RefCallback<T>,
  MeasureRect,
];

const INITIAL_RECT: MeasureRect = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
};

function areRectsEqual(a: MeasureRect, b: MeasureRect): boolean {
  return (
    a.x === b.x &&
    a.y === b.y &&
    a.width === b.width &&
    a.height === b.height &&
    a.top === b.top &&
    a.right === b.right &&
    a.bottom === b.bottom &&
    a.left === b.left
  );
}

function readInitialRect(
  element: Element,
  box: ResizeObserverBoxOptions,
): MeasureRect {
  if (box === 'border-box') {
    if (element instanceof HTMLElement) {
      const width = element.offsetWidth;
      const height = element.offsetHeight;
      return {
        x: 0,
        y: 0,
        width,
        height,
        top: 0,
        left: 0,
        right: width,
        bottom: height,
      };
    }
    const domRect = element.getBoundingClientRect();
    return {
      x: 0,
      y: 0,
      width: domRect.width,
      height: domRect.height,
      top: 0,
      left: 0,
      right: domRect.width,
      bottom: domRect.height,
    };
  }

  if (typeof window !== 'undefined' && element instanceof HTMLElement) {
    const style = window.getComputedStyle(element);
    const paddingLeft = parseFloat(style.paddingLeft) || 0;
    const paddingRight = parseFloat(style.paddingRight) || 0;
    const paddingTop = parseFloat(style.paddingTop) || 0;
    const paddingBottom = parseFloat(style.paddingBottom) || 0;
    const width = Math.max(
      0,
      element.clientWidth - paddingLeft - paddingRight,
    );
    const height = Math.max(
      0,
      element.clientHeight - paddingTop - paddingBottom,
    );

    return {
      x: paddingLeft,
      y: paddingTop,
      width,
      height,
      top: paddingTop,
      left: paddingLeft,
      right: paddingLeft + width,
      bottom: paddingTop + height,
    };
  }

  const domRect = element.getBoundingClientRect();
  return {
    x: 0,
    y: 0,
    width: domRect.width,
    height: domRect.height,
    top: 0,
    left: 0,
    right: domRect.width,
    bottom: domRect.height,
  };
}

/**
 * Measures the dimensions and box insets of a DOM element via a callback ref and `ResizeObserver`.
 *
 * @category DOM
 * @param options - Configuration for the observed CSS box model and `enabled` flag
 * @returns Tuple of `[refCallback, rect]`
 *
 * @example
 * ```tsx
 * const [ref, { width, height }] = useMeasure<HTMLDivElement>();
 * ```
 */
export function useMeasure<T extends Element = HTMLElement>(
  options: UseMeasureOptions = {},
): UseMeasureReturn<T> {
  const { box = 'content-box', enabled = true } = options;

  const [element, setElement] = useState<T | null>(null);
  const [rect, setRect] = useState<MeasureRect>(INITIAL_RECT);

  const ref: RefCallback<T> = useCallback((node: T | null) => {
    setElement(node);
  }, []);

  useIsomorphicLayoutEffect(() => {
    if (!enabled || !element) {
      return;
    }

    const nextRect = readInitialRect(element, box);
    setRect((prev) => (areRectsEqual(prev, nextRect) ? prev : nextRect));
  }, [element, box, enabled]);

  useEffect(() => {
    if (
      !enabled ||
      !element ||
      typeof window === 'undefined' ||
      typeof window.ResizeObserver !== 'function'
    ) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) {
        return;
      }

      const { x, y, top, left } = entry.contentRect;
      let width = entry.contentRect.width;
      let height = entry.contentRect.height;

      if (box === 'border-box' && entry.borderBoxSize?.length > 0) {
        const boxSize = entry.borderBoxSize[0];
        if (boxSize) {
          width = boxSize.inlineSize;
          height = boxSize.blockSize;
        }
      } else if (
        box === 'device-pixel-content-box' &&
        entry.devicePixelContentBoxSize?.length > 0
      ) {
        const boxSize = entry.devicePixelContentBoxSize[0];
        if (boxSize) {
          width = boxSize.inlineSize;
          height = boxSize.blockSize;
        }
      } else if (entry.contentBoxSize?.length > 0) {
        const boxSize = entry.contentBoxSize[0];
        if (boxSize) {
          width = boxSize.inlineSize;
          height = boxSize.blockSize;
        }
      }

      const nextRect: MeasureRect =
        box === 'border-box'
          ? {
              x: 0,
              y: 0,
              width,
              height,
              top: 0,
              left: 0,
              right: width,
              bottom: height,
            }
          : {
              x,
              y,
              width,
              height,
              top,
              left,
              right: left + width,
              bottom: top + height,
            };

      setRect((prev) => (areRectsEqual(prev, nextRect) ? prev : nextRect));
    });

    observer.observe(element, { box });

    return () => {
      observer.disconnect();
    };
  }, [element, box, enabled]);

  return [ref, rect];
}
