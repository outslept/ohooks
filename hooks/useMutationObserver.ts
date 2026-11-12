import { useEffect } from 'react';
import { type EventListenerTarget } from './useEventListener';
import { useLatest } from './useLatest';

export interface UseMutationObserverOptions extends MutationObserverInit {
  enabled?: boolean;
}

function resolveNode<T extends Node>(
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

export function useMutationObserver<T extends Node = HTMLElement>(
  target: EventListenerTarget<T>,
  callback: MutationCallback,
  options: UseMutationObserverOptions = {},
): void {
  const {
    enabled = true,
    attributes,
    attributeOldValue,
    attributeFilter,
    characterData,
    characterDataOldValue,
    childList,
    subtree,
  } = options;

  const callbackRef = useLatest(callback);
  const attributeFilterKey = attributeFilter
    ? attributeFilter.join(',')
    : undefined;

  useEffect(() => {
    const node = resolveNode(target);

    if (
      !enabled ||
      !node ||
      typeof window === 'undefined' ||
      typeof window.MutationObserver !== 'function'
    ) {
      return;
    }

    const hasValidTargetType =
      Boolean(childList) || Boolean(attributes) || Boolean(characterData);

    if (!hasValidTargetType) {
      return;
    }

    const observer = new MutationObserver((mutations, obs) => {
      callbackRef.current(mutations, obs);
    });

    observer.observe(node, {
      attributes,
      attributeOldValue,
      attributeFilter,
      characterData,
      characterDataOldValue,
      childList,
      subtree,
    });

    return () => {
      observer.disconnect();
    };
  }, [
    target,
    enabled,
    attributes,
    attributeOldValue,
    attributeFilterKey,
    characterData,
    characterDataOldValue,
    childList,
    subtree,
    callbackRef,
  ]);
}
