import { type EventListenerTarget } from './useEventListener';
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';

interface InertRestoreRecord {
  count: number;
  originalInert: boolean;
  originalAriaHidden: string | null;
}

const inertRegistry = new WeakMap<HTMLElement, InertRestoreRecord>();

const IGNORED_TAGS = new Set(['SCRIPT', 'STYLE', 'LINK', 'TEMPLATE']);

function resolveElement<T extends HTMLElement>(
  target: EventListenerTarget<T>,
): T | null {
  if (!target) {
    return null;
  }
  if (typeof target === 'object' && 'current' in target) {
    return target.current;
  }
  return target;
}

function lockElementInert(element: HTMLElement): void {
  const existing = inertRegistry.get(element);
  if (existing) {
    existing.count += 1;
    return;
  }

  inertRegistry.set(element, {
    count: 1,
    originalInert: Boolean(element.inert),
    originalAriaHidden: element.getAttribute('aria-hidden'),
  });

  element.inert = true;
  element.setAttribute('aria-hidden', 'true');
}

function unlockElementInert(element: HTMLElement): void {
  const existing = inertRegistry.get(element);
  if (!existing) {
    return;
  }

  existing.count -= 1;
  if (existing.count > 0) {
    return;
  }

  inertRegistry.delete(element);
  element.inert = existing.originalInert;

  if (existing.originalAriaHidden === null) {
    element.removeAttribute('aria-hidden');
  } else {
    element.setAttribute('aria-hidden', existing.originalAriaHidden);
  }
}

export function useInert<T extends HTMLElement = HTMLElement>(
  target: EventListenerTarget<T>,
  enabled = true,
): void {
  useIsomorphicLayoutEffect(() => {
    if (!enabled || typeof document === 'undefined') {
      return;
    }

    const activeContainer = resolveElement(target);
    if (!activeContainer || !document.body.contains(activeContainer)) {
      return;
    }

    const lockedSiblings: HTMLElement[] = [];
    let current: HTMLElement | null = activeContainer;

    while (current && current !== document.body) {
      const parent: HTMLElement | null = current.parentElement;
      if (!parent) {
        break;
      }

      for (const sibling of Array.from(parent.children)) {
        if (
          sibling !== current &&
          sibling instanceof HTMLElement &&
          !IGNORED_TAGS.has(sibling.tagName)
        ) {
          lockElementInert(sibling);
          lockedSiblings.push(sibling);
        }
      }

      current = parent;
    }

    return () => {
      for (const sibling of lockedSiblings) {
        unlockElementInert(sibling);
      }
    };
  }, [target, enabled]);
}
