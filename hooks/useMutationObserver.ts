import { useEffect } from 'react';
import {
  EventListenerTarget,
  resolveTargetElement,
} from './useEventListener';
import { useLatest } from './useLatest';

export interface UseMutationObserverOptions extends MutationObserverInit {
  enabled?: boolean;
}

const DEFAULT_OPTIONS: MutationObserverInit = {
  attributes: true,
  childList: true,
  subtree: false,
};

export function useMutationObserver(
  target: EventListenerTarget<Node>,
  callback: MutationCallback,
  options: UseMutationObserverOptions = DEFAULT_OPTIONS
): void {
  const {
    enabled = true,
    attributes,
    attributeFilter,
    attributeOldValue,
    characterData,
    characterDataOldValue,
    childList,
    subtree,
  } = options;

  const callbackRef = useLatest(callback);
  const attributeFilterKey = attributeFilter ? attributeFilter.join(',') : '';

  useEffect(() => {
    if (!enabled || typeof MutationObserver === 'undefined') {
      return;
    }

    const targetNode = resolveTargetElement(target);
    if (!targetNode) {
      return;
    }

    const hasImplicitAttributes =
      attributeFilter !== undefined || attributeOldValue === true;
    const hasImplicitCharacterData = characterDataOldValue === true;

    const resolvedAttributes =
      attributes ?? (hasImplicitAttributes ? true : undefined);
    const resolvedCharacterData =
      characterData ?? (hasImplicitCharacterData ? true : undefined);

    if (
      !resolvedAttributes &&
      !childList &&
      !resolvedCharacterData
    ) {
      return;
    }

    const observer = new MutationObserver((mutations, obs) => {
      callbackRef.current(mutations, obs);
    });

    const init: MutationObserverInit = {
      ...(resolvedAttributes !== undefined
        ? { attributes: resolvedAttributes }
        : {}),
      ...(attributeFilter !== undefined ? { attributeFilter } : {}),
      ...(attributeOldValue !== undefined ? { attributeOldValue } : {}),
      ...(resolvedCharacterData !== undefined
        ? { characterData: resolvedCharacterData }
        : {}),
      ...(characterDataOldValue !== undefined
        ? { characterDataOldValue }
        : {}),
      ...(childList !== undefined ? { childList } : {}),
      ...(subtree !== undefined ? { subtree } : {}),
    };

    observer.observe(targetNode, init);

    return () => {
      observer.disconnect();
    };
  }, [
    target,
    enabled,
    attributes,
    attributeFilterKey,
    attributeOldValue,
    characterData,
    characterDataOldValue,
    childList,
    subtree,
    callbackRef,
  ]);
}

export default useMutationObserver;
