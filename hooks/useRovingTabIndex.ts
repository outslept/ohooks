import {
  type FocusEvent as ReactFocusEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  useRef,
} from 'react';
import { useControllableState } from './useControllableState';
import { useEventCallback } from './useEventCallback';

export type RovingOrientation = 'horizontal' | 'vertical' | 'both';

export interface UseRovingTabIndexOptions {
  count?: number;
  activeIndex?: number;
  defaultActiveIndex?: number;
  orientation?: RovingOrientation;
  loop?: boolean;
  rtl?: boolean;
  onActiveIndexChange?: (index: number) => void;
}

export interface RovingItemOptions<T extends HTMLElement = HTMLElement> {
  disabled?: boolean;
  onKeyDown?: (event: ReactKeyboardEvent<T>) => void;
  onFocus?: (event: ReactFocusEvent<T>) => void;
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

  const itemsRef = useRef<Map<number, HTMLElement>>(new Map());
  const disabledMapRef = useRef<Map<number, boolean>>(new Map());

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
    if (disabledMapRef.current.get(index)) {
      return true;
    }
    const el = itemsRef.current.get(index);
    if (!el) {
      return false;
    }
    return (
      el.hasAttribute('disabled') ||
      el.getAttribute('aria-disabled') === 'true'
    );
  };

  const focusItem = useEventCallback((index: number) => {
    setActiveIndexState(index);
    const element = itemsRef.current.get(index);
    element?.focus();
  });

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

  const findBoundaryEnabledIndex = (fromStart: boolean): number => {
    const total = getTotalCount();
    if (total <= 0) {
      return activeIndex;
    }

    if (fromStart) {
      for (let i = 0; i < total; i++) {
        if (!isIndexDisabled(i)) return i;
      }
    } else {
      for (let i = total - 1; i >= 0; i--) {
        if (!isIndexDisabled(i)) return i;
      }
    }

    return activeIndex;
  };

  const getItemProps = useEventCallback(
    <T extends HTMLElement = HTMLElement>(
      index: number,
      itemOptions: RovingItemOptions<T> = {},
    ): RovingTabIndexItemProps<T> => {
      const { disabled = false, onKeyDown, onFocus } = itemOptions;
      disabledMapRef.current.set(index, disabled);

      return {
        ref: (node: T | null) => {
          if (node) {
            itemsRef.current.set(index, node);
          } else {
            itemsRef.current.delete(index);
          }
        },
        tabIndex: !disabled && activeIndex === index ? 0 : -1,
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
      };
    },
  );

  return {
    activeIndex,
    setActiveIndex: setActiveIndexState,
    focusItem,
    getItemProps,
  };
}
