import {
  EventListenerTarget,
  resolveTargetElement,
} from './useEventListener';
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';

export interface UseLockBodyScrollOptions {
  reserveScrollBarGap?: boolean;
  target?: EventListenerTarget<HTMLElement>;
}

interface LockState {
  count: number;
  originalOverflow: string;
  originalPaddingRight: string;
}

const lockRegistry = new WeakMap<HTMLElement, LockState>();

export function useLockBodyScroll(
  locked: boolean = true,
  options: UseLockBodyScrollOptions = {}
): void {
  const { reserveScrollBarGap = true, target } = options;

  useIsomorphicLayoutEffect(() => {
    if (!locked || typeof document === 'undefined') {
      return;
    }

    const element = resolveTargetElement(target, document.body);
    if (!element) {
      return;
    }

    const existing = lockRegistry.get(element);

    if (existing) {
      existing.count += 1;
    } else {
      const originalOverflow = element.style.overflow;
      const originalPaddingRight = element.style.paddingRight;

      lockRegistry.set(element, {
        count: 1,
        originalOverflow,
        originalPaddingRight,
      });

      if (reserveScrollBarGap && typeof window !== 'undefined') {
        const isBody =
          element === document.body || element === document.documentElement;
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
    }

    return () => {
      const current = lockRegistry.get(element);
      if (!current) {
        return;
      }

      current.count -= 1;
      if (current.count <= 0) {
        element.style.overflow = current.originalOverflow;
        element.style.paddingRight = current.originalPaddingRight;
        lockRegistry.delete(element);
      }
    };
  }, [locked, reserveScrollBarGap, target]);
}

export default useLockBodyScroll;
