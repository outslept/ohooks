import {
  type FocusEvent as ReactFocusEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  useCallback,
  useRef,
  useState,
} from "react";
import { useControllableState } from "./useControllableState";
import { useEventCallback } from "./useEventCallback";
import { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect";

/** Keyboard navigation orientation for roving tabindex groups. */
export type RovingOrientation = "horizontal" | "vertical" | "both";

/** Configuration options for `useRovingTabIndex`. */
export interface UseRovingTabIndexOptions {
  /** Total number of items (inferred automatically from registered refs if omitted). */
  count?: number | undefined;
  /** Controlled active item index. */
  activeIndex?: number | undefined;
  /** Initial active item index in uncontrolled mode (default: `0`). */
  defaultActiveIndex?: number | undefined;
  /** Arrow key navigation orientation (default: `'horizontal'`). */
  orientation?: RovingOrientation | undefined;
  /** Whether arrow navigation wraps around at the ends (default: `true`). */
  loop?: boolean | undefined;
  /** Flip horizontal arrow keys for right-to-left layouts (default: `false`). */
  rtl?: boolean | undefined;
  /** Callback fired when the active index changes. */
  onActiveIndexChange?: ((index: number) => void) | undefined;
}

/** Per-item options passed to `getItemProps`. */
export interface RovingItemOptions<T extends HTMLElement = HTMLElement> {
  /** Whether this specific item is disabled and skipped during navigation. */
  disabled?: boolean | undefined;
  /** Custom `onKeyDown` handler composed with roving keyboard navigation. */
  onKeyDown?: ((event: ReactKeyboardEvent<T>) => void) | undefined;
  /** Custom `onFocus` handler composed with active index synchronization. */
  onFocus?: ((event: ReactFocusEvent<T>) => void) | undefined;
}

/** Props returned by `getItemProps` to spread onto each focusable item. */
export interface RovingTabIndexItemProps<T extends HTMLElement = HTMLElement> {
  /** Ref callback that registers the item's DOM node. */
  ref: (node: T | null) => void;
  /** `0` for the active tabbable item, `-1` for all other items. */
  tabIndex: number;
  /** Keyboard handler managing arrow, Home, and End navigation. */
  onKeyDown: (event: ReactKeyboardEvent<T>) => void;
  /** Focus handler that updates the active index when focused. */
  onFocus: (event: ReactFocusEvent<T>) => void;
}

/** Return value of `useRovingTabIndex`. */
export interface UseRovingTabIndexReturn {
  /** Currently active item index. */
  activeIndex: number;
  /** Updates the active index without moving DOM focus. */
  setActiveIndex: (index: number) => void;
  /** Updates the active index and moves DOM focus to the item. */
  focusItem: (index: number) => void;
  /** Generates `ref`, `tabIndex`, `onKeyDown`, and `onFocus` props for an item at `index`. */
  getItemProps: <T extends HTMLElement = HTMLElement>(
    index: number,
    options?: RovingItemOptions<T>,
  ) => RovingTabIndexItemProps<T>;
}

interface RegisteredItem {
  element: HTMLElement;
  disabled: boolean;
}

/**
 * Implements the WAI-ARIA roving `tabIndex` keyboard navigation pattern for composite widgets.
 *
 * @category DOM
 * @param options - Orientation, looping, RTL, and controlled/uncontrolled index options
 * @returns Active index state, focus helpers, and `getItemProps` prop getter
 *
 * @example
 * ```tsx
 * const { getItemProps } = useRovingTabIndex({ orientation: 'horizontal' });
 * return (
 *   <div role="toolbar">
 *     {items.map((item, i) => (
 *       <button key={item.id} {...getItemProps(i)}>{item.label}</button>
 *     ))}
 *   </div>
 * );
 * ```
 */
export function useRovingTabIndex(options: UseRovingTabIndexOptions = {}): UseRovingTabIndexReturn {
  const {
    count,
    activeIndex: controlledIndex,
    defaultActiveIndex = 0,
    orientation = "horizontal",
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
      entry.element.hasAttribute("disabled") ||
      entry.element.getAttribute("aria-disabled") === "true"
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

  const findNextEnabledIndex = (currentIndex: number, step: 1 | -1): number => {
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
      setFallbackIndex((prev) => (prev === firstEnabled ? prev : firstEnabled));
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
      const isHorizontal = orientation === "horizontal" || orientation === "both";
      const isVertical = orientation === "vertical" || orientation === "both";

      const nextKey = rtl ? "ArrowLeft" : "ArrowRight";
      const prevKey = rtl ? "ArrowRight" : "ArrowLeft";

      let targetIndex: number | null = null;

      if ((isHorizontal && event.key === nextKey) || (isVertical && event.key === "ArrowDown")) {
        targetIndex = findNextEnabledIndex(index, 1);
      } else if (
        (isHorizontal && event.key === prevKey) ||
        (isVertical && event.key === "ArrowUp")
      ) {
        targetIndex = findNextEnabledIndex(index, -1);
      } else if (event.key === "Home") {
        targetIndex = findBoundaryEnabledIndex(true);
      } else if (event.key === "End") {
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
