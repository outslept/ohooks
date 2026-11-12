import { useEffect } from 'react';
import { type EventListenerTarget } from './useEventListener';

export interface UseFocusTrapOptions {
  enabled?: boolean;
  autoFocus?: boolean;
  restoreFocus?: boolean;
  initialFocus?: EventListenerTarget<HTMLElement>;
}

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'area[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'iframe',
  'object',
  'embed',
  '[contenteditable="true"]',
  '[contenteditable=""]',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

function resolveElement<T extends HTMLElement>(
  target?: EventListenerTarget<T>,
): T | null {
  if (!target) {
    return null;
  }
  if (
    typeof target === 'object' &&
    'current' in target &&
    !('addEventListener' in target)
  ) {
    return target.current;
  }
  return target as T;
}

function getTabbableElements(container: HTMLElement): HTMLElement[] {
  const candidates = Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  );

  return candidates.filter((el) => {
    if (el.hidden || el.closest('[inert]')) {
      return false;
    }
    if (typeof window !== 'undefined') {
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') {
        return false;
      }
    }
    return true;
  });
}

export function useFocusTrap<T extends HTMLElement = HTMLElement>(
  target: EventListenerTarget<T>,
  options: boolean | UseFocusTrapOptions = true,
): void {
  const normalizedOptions: UseFocusTrapOptions =
    typeof options === 'boolean' ? { enabled: options } : options;

  const {
    enabled = true,
    autoFocus = true,
    restoreFocus = true,
    initialFocus,
  } = normalizedOptions;

  useEffect(() => {
    if (!enabled || typeof document === 'undefined') {
      return;
    }

    const container = resolveElement(target);
    if (!container) {
      return;
    }

    const previouslyFocused = document.activeElement as HTMLElement | null;
    let addedTabIndex = false;

    if (autoFocus) {
      const preferredInitial = resolveElement(initialFocus);
      if (preferredInitial && container.contains(preferredInitial)) {
        preferredInitial.focus();
      } else if (!container.contains(document.activeElement)) {
        const tabbables = getTabbableElements(container);
        const firstTabbable = tabbables[0];
        if (firstTabbable) {
          firstTabbable.focus();
        } else {
          if (!container.hasAttribute('tabindex')) {
            container.setAttribute('tabindex', '-1');
            addedTabIndex = true;
          }
          container.focus();
        }
      }
    }

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== 'Tab') {
        return;
      }

      const tabbables = getTabbableElements(container);
      if (tabbables.length === 0) {
        event.preventDefault();
        return;
      }

      const first = tabbables[0] as HTMLElement;
      const last = tabbables[tabbables.length - 1] as HTMLElement;
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey) {
        if (active === first || !active || !container.contains(active)) {
          event.preventDefault();
          last.focus();
        }
      } else {
        if (active === last || !active || !container.contains(active)) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);

      if (addedTabIndex) {
        container.removeAttribute('tabindex');
      }

      if (
        restoreFocus &&
        previouslyFocused &&
        previouslyFocused.isConnected &&
        typeof previouslyFocused.focus === 'function'
      ) {
        previouslyFocused.focus();
      }
    };
  }, [target, enabled, autoFocus, restoreFocus, initialFocus]);
}
