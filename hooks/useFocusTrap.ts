import { useEffect, useRef } from 'react';
import {
  EventListenerTarget,
  resolveTargetElement,
} from './useEventListener';
import { useLatest } from './useLatest';

export interface UseFocusTrapOptions {
  /** Whether the focus trap is currently active (default: `true`) */
  enabled?: boolean;
  /** Element, ref, or CSS selector to focus when the trap activates */
  initialFocus?: EventListenerTarget<HTMLElement> | string;
  /** Restore focus to the previously active element on cleanup (default: `true`) */
  restoreFocus?: boolean;
  /** Callback fired when the `Escape` key is pressed while the trap is active */
  onEscape?: (event: KeyboardEvent) => void;
}

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'area[href]',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'button:not([disabled])',
  'iframe',
  'object',
  'embed',
  '[contenteditable]',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const nodes = Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
  );
  return nodes.filter(
    (el) =>
      !el.hasAttribute('disabled') &&
      el.getAttribute('aria-hidden') !== 'true' &&
      !el.hasAttribute('inert') &&
      (el.offsetWidth > 0 ||
        el.offsetHeight > 0 ||
        el.getClientRects().length > 0)
  );
}

/**
 * Traps keyboard `Tab` / `Shift+Tab` focus within a container element and optionally restores focus on unmount.
 *
 * @category DOM
 * @param target - Container DOM element or React ref to trap focus inside
 * @param options - Configuration for initial focus, focus restoration, and `Escape` key handling
 *
 * @example
 * ```tsx
 * useFocusTrap(modalRef, {
 *   enabled: isOpen,
 *   onEscape: () => setIsOpen(false),
 * });
 * ```
 */
export function useFocusTrap(
  target: EventListenerTarget<HTMLElement>,
  options: UseFocusTrapOptions = {}
): void {
  const {
    enabled = true,
    initialFocus,
    restoreFocus = true,
    onEscape,
  } = options;

  const onEscapeRef = useLatest(onEscape);
  const initialFocusRef = useLatest(initialFocus);
  const previousActiveElementRef: { current: HTMLElement | null } =
    useRef(null);

  useEffect(() => {
    if (!enabled || typeof document === 'undefined') {
      return;
    }

    const container = resolveTargetElement(target);
    if (!container) {
      return;
    }

    previousActiveElementRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const focusInitialElement = () => {
      const configuredInitial = initialFocusRef.current;
      if (configuredInitial) {
        if (typeof configuredInitial === 'string') {
          const found =
            container.querySelector<HTMLElement>(configuredInitial);
          if (found) {
            found.focus();
            return;
          }
        } else {
          const resolvedInitial = resolveTargetElement(configuredInitial);
          if (resolvedInitial) {
            resolvedInitial.focus();
            return;
          }
        }
      }

      const focusable = getFocusableElements(container);
      if (focusable.length > 0) {
        focusable[0]?.focus();
      } else {
        if (!container.hasAttribute('tabindex')) {
          container.setAttribute('tabindex', '-1');
        }
        container.focus();
      }
    };

    focusInitialElement();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onEscapeRef.current?.(event);
        return;
      }

      if (event.key !== 'Tab') {
        return;
      }

      const focusable = getFocusableElements(container);
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const firstElement = focusable[0] as HTMLElement;
      const lastElement = focusable[focusable.length - 1] as HTMLElement;
      const activeElement = document.activeElement as HTMLElement | null;

      if (event.shiftKey) {
        if (
          activeElement === firstElement ||
          !activeElement ||
          !container.contains(activeElement)
        ) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        if (
          activeElement === lastElement ||
          !activeElement ||
          !container.contains(activeElement)
        ) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);

      if (restoreFocus && previousActiveElementRef.current) {
        try {
          previousActiveElementRef.current.focus();
        } catch {
          // ignore if previous element was detached from DOM
        }
      }
    };
  }, [target, enabled, restoreFocus, initialFocusRef, onEscapeRef]);
}

export default useFocusTrap;
