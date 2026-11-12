import { type EventListenerTarget } from './useEventListener';
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';

export interface UseLockBodyScrollOptions {
  target?: EventListenerTarget<HTMLElement>;
  reserveScrollBarGap?: boolean;
}

function resolveElement(
  target?: EventListenerTarget<HTMLElement>,
): HTMLElement | null {
  if (typeof document === 'undefined') {
    return null;
  }
  if (target === undefined) {
    return document.body;
  }
  if (target === null) {
    return null;
  }
  if (typeof target === 'object' && 'current' in target) {
    return target.current;
  }
  return target;
}

export function useLockBodyScroll(
  locked = true,
  options: UseLockBodyScrollOptions = {},
): void {
  const { target, reserveScrollBarGap = true } = options;

  useIsomorphicLayoutEffect(() => {
    if (!locked || typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    const element = resolveElement(target);
    if (!element) {
      return;
    }

    const originalOverflow = element.style.overflow;
    const originalPaddingRight = element.style.paddingRight;

    if (reserveScrollBarGap) {
      const isBody = element === document.body;
      const scrollBarWidth = isBody
        ? window.innerWidth - document.documentElement.clientWidth
        : element.offsetWidth - element.clientWidth;

      if (scrollBarWidth > 0) {
        const computedPaddingRight =
          parseFloat(window.getComputedStyle(element).paddingRight) || 0;
        element.style.paddingRight = `${computedPaddingRight + scrollBarWidth}px`;
      }
    }

    element.style.overflow = 'hidden';

    return () => {
      element.style.overflow = originalOverflow;
      if (reserveScrollBarGap) {
        element.style.paddingRight = originalPaddingRight;
      }
    };
  }, [locked, target, reserveScrollBarGap]);
}
