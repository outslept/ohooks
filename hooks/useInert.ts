import {
  EventListenerTarget,
  resolveTargetElement,
} from './useEventListener';
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';

interface InertRestoreState {
  count: number;
  hadInertAttr: boolean;
  originalInertProp: boolean;
  originalAriaHidden: string | null;
}

const inertRegistry = new WeakMap<HTMLElement, InertRestoreState>();

function applyInertToElement(element: HTMLElement): void {
  const existing = inertRegistry.get(element);
  if (existing) {
    existing.count += 1;
    return;
  }

  const elementWithInert = element as HTMLElement & { inert?: boolean };
  inertRegistry.set(element, {
    count: 1,
    hadInertAttr: element.hasAttribute('inert'),
    originalInertProp: Boolean(elementWithInert.inert),
    originalAriaHidden: element.getAttribute('aria-hidden'),
  });

  elementWithInert.inert = true;
  element.setAttribute('inert', '');
  element.setAttribute('aria-hidden', 'true');
}

function releaseInertFromElement(element: HTMLElement): void {
  const state = inertRegistry.get(element);
  if (!state) {
    return;
  }

  state.count -= 1;
  if (state.count > 0) {
    return;
  }

  const elementWithInert = element as HTMLElement & { inert?: boolean };
  elementWithInert.inert = state.originalInertProp;

  if (state.hadInertAttr) {
    element.setAttribute('inert', '');
  } else {
    element.removeAttribute('inert');
  }

  if (state.originalAriaHidden !== null) {
    element.setAttribute('aria-hidden', state.originalAriaHidden);
  } else {
    element.removeAttribute('aria-hidden');
  }

  inertRegistry.delete(element);
}

export function useInert(
  target: EventListenerTarget<HTMLElement>,
  inert: boolean = true,
  options: {
    trapSiblings?: boolean;
  } = {}
): void {
  const { trapSiblings = false } = options;

  useIsomorphicLayoutEffect(() => {
    if (!inert || typeof document === 'undefined') {
      return;
    }

    const targetElement = resolveTargetElement(target);
    if (!targetElement) {
      return;
    }

    const affectedElements: HTMLElement[] = [];

    if (trapSiblings) {
      const bodyChildren = Array.from(document.body.children);
      for (const child of bodyChildren) {
        if (
          child instanceof HTMLElement &&
          child.tagName !== 'SCRIPT' &&
          child.tagName !== 'STYLE' &&
          child !== targetElement &&
          !child.contains(targetElement)
        ) {
          applyInertToElement(child);
          affectedElements.push(child);
        }
      }
    } else {
      applyInertToElement(targetElement);
      affectedElements.push(targetElement);
    }

    return () => {
      for (const el of affectedElements) {
        releaseInertFromElement(el);
      }
    };
  }, [target, inert, trapSiblings]);
}

export default useInert;
