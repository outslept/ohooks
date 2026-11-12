import {
  type FocusEvent as ReactFocusEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  useCallback,
  useRef,
  useState,
} from 'react';
import { useControllableState } from './useControllableState';
import { useEventCallback } from './useEventCallback';
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';

export type RovingOrientation = 'horizontal' | 'vertical' | 'both';

export interface UseRovingTabIndexOptions {
  count?: number | undefined;
  activeIndex?: number | undefined;
  defaultActiveIndex?: number | undefined;
  orientation?: RovingOrientation | undefined;
  loop?: boolean | undefined;
  rtl?: boolean | undefined;
  onActiveIndexChange?: ((index: number) => void) | undefined;
}

export interface RovingItemOptions<T extends HTMLElement = HTMLElement> {
  disabled?: boolean | undefined;
  onKeyDown?: ((event: ReactKeyboardEvent<T>) => void) | undefined;
  onFocus?: ((event: ReactFocusEvent<T>) => void) | undefined;
}

export interface RovingTabIndexItemProps<T extends HTMLElement = HTMLElement> {
  ref: (node: T | null) => void;
  tabIndex: number;
  onKeyDown: (event: ReactKeyboardEvent<T>) => void;
  onFocus: (event: ReactFocusEvent<T>) => void;
}

export interface UseRovingTabIndexReturn {
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  focusItem: (index: number) => void;
  getItemProps: <T extends HTMLElement = HTMLElement>(
    index: number,
    options?: RovingItemOptions<T>,
  ) => RovingTabIndexItemProps<T>;
}

interface RegisteredItem {
  element: HTMLElement;
  disabled: boolean;
}

export function useRovingTabIndex(
  options: UseRovingTabIndexOptions = {},
): UseRovingTabIndexReturn {
  const {
    count,
    activeIndex: controlledIndex,
    defaultActiveIndex = 0,
    orientation = 'horizontal',
    loop = true,
    rtl = false,
    onActiveIndexChange,
  } = options;

  const [activeIndex = 0, setActiveIndexState] = useControllableState<number>({
    value: controlledIndex,
    defaultValue: defaultActiveIndex,
    onChange: onActiveIndexChange,
  });

  const [fallbackIndex, setFallbackIndex] = useState<number | null>(null);
  const itemsRef = useRef<Map<number, RegisteredItem>>(new Map());

  const getTotalCount = (): number => {
    if (count !== undefined) {
      return count;
    }
    let maxIdx = -1;
    for (const idx of itemsRef.current.keys()) {
      if (idx > maxIdx) {
        maxIdx = idx;
      }
    }
    return maxIdx + 1;
  };

  const isIndexDisabled = (index: number): boolean => {
    const entry = itemsRef.current.get(index);
    if (!entry) {
      return false;
    }
    if (entry.disabled) {
      return true;
    }
    return (
      entry.element.hasAttribute('disabled') ||
      entry.element.getAttribute('aria-disabled') === 'true'
    );
  };

  const findBoundaryEnabledIndex = (fromStart: boolean): number | null => {
    const total = getTotalCount();
    if (total <= 0) {
      return null;
    }

    if (fromStart) {
      for (let i = 0; i < total; i++) {
        if (itemsRef.current.has(i) && !isIndexDisabled(i)) {
          return i;
        }
      }
    } else {
      for (let i = total - 1; i >= 0; i--) {
        if (itemsRef.current.has(i) && !isIndexDisabled(i)) {
          return i;
        }
      }
    }

    return null;
  };

  const findNextEnabledIndex = (
    currentIndex: number,
    step: 1 | -1,
  ): number => {
    const total = getTotalCount();
    if (total <= 0) {
      return currentIndex;
    }

    let candidate = currentIndex;
    for (let i = 0; i < total; i++) {
      candidate += step;

      if (candidate >= total) {
        if (!loop) return currentIndex;
        candidate = 0;
      } else if (candidate < 0) {
        if (!loop) return currentIndex;
        candidate = total - 1;
      }

      if (!isIndexDisabled(candidate)) {
        return candidate;
      }
    }

    return currentIndex;
  };

  useIsomorphicLayoutEffect(() => {
    if (itemsRef.current.size === 0) {
      return;
    }

    if (isIndexDisabled(activeIndex)) {
      const firstEnabled = findBoundaryEnabledIndex(true);
      setFallbackIndex((prev) =>
        prev === firstEnabled ? prev : firstEnabled,
      );
    } else if (fallbackIndex !== null) {
      setFallbackIndex(null);
    }
  });

  const focusItem = useEventCallback((index: number) => {
    setActiveIndexState(index);
    const entry = itemsRef.current.get(index);
    entry?.element.focus();
  });

  const handleKeyNavigation = useEventCallback(
    (index: number, event: ReactKeyboardEvent<HTMLElement>) => {
      const isHorizontal =
        orientation === 'horizontal' || orientation === 'both';
      const isVertical =
        orientation === 'vertical' || orientation === 'both';

      const nextKey = rtl ? 'ArrowLeft' : 'ArrowRight';
      const prevKey = rtl ? 'ArrowRight' : 'ArrowLeft';

      let targetIndex: number | null = null;

      if (
        (isHorizontal && event.key === nextKey) ||
        (isVertical && event.key === 'ArrowDown')
      ) {
        targetIndex = findNextEnabledIndex(index, 1);
      } else if (
        (isHorizontal && event.key === prevKey) ||
        (isVertical && event.key === 'ArrowUp')
      ) {
        targetIndex = findNextEnabledIndex(index, -1);
      } else if (event.key === 'Home') {
        targetIndex = findBoundaryEnabledIndex(true);
      } else if (event.key === 'End') {
        targetIndex = findBoundaryEnabledIndex(false);
      }

      if (targetIndex !== null && targetIndex !== index) {
        event.preventDefault();
        focusItem(targetIndex);
      }
    },
  );

  const tabbableIndex = fallbackIndex ?? activeIndex;

  const getItemProps = useCallback(
    <T extends HTMLElement = HTMLElement>(
      index: number,
      itemOptions: RovingItemOptions<T> = {},
    ): RovingTabIndexItemProps<T> => {
      const { disabled = false, onKeyDown, onFocus } = itemOptions;

      return {
        ref: (node: T | null) => {
          if (node) {
            itemsRef.current.set(index, { element: node, disabled });
          } else {
            itemsRef.current.delete(index);
          }
        },
        tabIndex: !disabled && tabbableIndex === index ? 0 : -1,
        onFocus: (event: ReactFocusEvent<T>) => {
          if (!disabled && activeIndex !== index) {
            setActiveIndexState(index);
          }
          onFocus?.(event);
        },
        onKeyDown: (event: ReactKeyboardEvent<T>) => {
          onKeyDown?.(event);
          if (event.defaultPrevented || disabled) {
            return;
          }
          handleKeyNavigation(index, event);
        },
      };
    },
    [activeIndex, tabbableIndex, setActiveIndexState, handleKeyNavigation],
  );

  return {
    activeIndex,
    setActiveIndex: setActiveIndexState,
    focusItem,
    getItemProps,
  };
}
