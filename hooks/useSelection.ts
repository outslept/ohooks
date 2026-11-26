import { useCallback, useMemo } from "react";
import { useControllableState } from "./useControllableState";
import { useEventCallback } from "./useEventCallback";

/** Configuration options for `useSelection`. */
export interface UseSelectionOptions<T, TKey = T> {
  /** Extracts a unique key for each item (defaults to identity). */
  getKey?: ((item: T) => TKey) | undefined;
  /** Allow selecting multiple items simultaneously (default: `true`). */
  multiple?: boolean | undefined;
  /** Controlled array of selected keys. */
  value?: readonly TKey[] | undefined;
  /** Initial selected keys in uncontrolled mode (default: `[]`). */
  defaultValue?: readonly TKey[] | undefined;
  /** Callback fired whenever the selected keys change. */
  onChange?: ((selectedKeys: TKey[]) => void) | undefined;
}

/** Selection state and actions returned by `useSelection`. */
export interface UseSelectionReturn<T, TKey = T> {
  /** Array of currently selected item keys. */
  selectedKeys: readonly TKey[];
  /** `Set` of currently selected item keys for O(1) lookups. */
  selectedSet: ReadonlySet<TKey>;
  /** Array of items from `items` whose keys are currently selected. */
  selectedItems: T[];
  /** Returns `true` if `key` is currently selected. */
  isSelected: (key: TKey) => boolean;
  /** Whether every item in `items` is selected. */
  isAllSelected: boolean;
  /** Whether some, but not all, items in `items` are selected. */
  isPartiallySelected: boolean;
  /** Whether zero items in `items` are selected. */
  isNoneSelected: boolean;
  /** Selects the item with the given `key`. */
  select: (key: TKey) => void;
  /** Deselects the item with the given `key`. */
  deselect: (key: TKey) => void;
  /** Toggles selection for the given `key`. */
  toggle: (key: TKey) => void;
  /** Selects all items between `fromKey` and `toKey` inclusive. */
  selectRange: (fromKey: TKey, toKey: TKey) => void;
  /** Selects all items in `items` (when `multiple` is `true`). */
  selectAll: () => void;
  /** Clears all selected keys. */
  clear: () => void;
  /** Selects all items if not all are selected, otherwise clears the selection. */
  toggleAll: () => void;
  /** Replaces the entire selection with `keys`. */
  setSelectedKeys: (keys: TKey[]) => void;
}

/**
 * Manages single or multi-item selection state with range selection and bulk toggle helpers.
 *
 * @category State
 * @param items - Collection of selectable items
 * @param options - Key extractor, selection mode, and controlled/uncontrolled options
 * @returns Selected keys/items, status flags, and selection actions
 *
 * @example
 * ```tsx
 * const { isSelected, toggle, toggleAll, isAllSelected } = useSelection(users, {
 *   getKey: (u) => u.id,
 * });
 * ```
 */
export function useSelection<T, TKey = T>(
  items: readonly T[],
  options: UseSelectionOptions<T, TKey> = {},
): UseSelectionReturn<T, TKey> {
  const {
    getKey = (item: T) => item as unknown as TKey,
    multiple = true,
    value,
    defaultValue = [],
    onChange,
  } = options;

  const [selectedKeys = [], setSelectedKeysState] = useControllableState<TKey[]>({
    value: value ? [...value] : undefined,
    defaultValue: () => [...defaultValue],
    onChange,
  });

  const itemKeys = useMemo(() => items.map((item) => getKey(item)), [items, getKey]);

  const selectedSet = useMemo(() => new Set<TKey>(selectedKeys), [selectedKeys]);

  const selectedItems = useMemo(
    () => items.filter((item) => selectedSet.has(getKey(item))),
    [items, selectedSet, getKey],
  );

  const selectedItemCount = useMemo(
    () => itemKeys.filter((k) => selectedSet.has(k)).length,
    [itemKeys, selectedSet],
  );

  const isAllSelected = itemKeys.length > 0 && selectedItemCount === itemKeys.length;
  const isNoneSelected = selectedItemCount === 0;
  const isPartiallySelected = !isNoneSelected && !isAllSelected;

  const isSelected = useCallback(
    (key: TKey): boolean => {
      return selectedSet.has(key);
    },
    [selectedSet],
  );

  const select = useEventCallback((key: TKey) => {
    if (selectedSet.has(key)) {
      return;
    }
    if (!multiple) {
      setSelectedKeysState([key]);
      return;
    }
    setSelectedKeysState([...selectedKeys, key]);
  });

  const deselect = useEventCallback((key: TKey) => {
    if (!selectedSet.has(key)) {
      return;
    }
    setSelectedKeysState(selectedKeys.filter((k) => !Object.is(k, key)));
  });

  const toggle = useEventCallback((key: TKey) => {
    if (selectedSet.has(key)) {
      deselect(key);
    } else {
      select(key);
    }
  });

  const selectRange = useEventCallback((fromKey: TKey, toKey: TKey) => {
    if (!multiple) {
      select(toKey);
      return;
    }

    const startIndex = itemKeys.findIndex((k) => Object.is(k, fromKey));
    const endIndex = itemKeys.findIndex((k) => Object.is(k, toKey));

    if (startIndex === -1 || endIndex === -1) {
      return;
    }

    const low = Math.min(startIndex, endIndex);
    const high = Math.max(startIndex, endIndex);
    const rangeKeys = itemKeys.slice(low, high + 1);

    const nextSet = new Set<TKey>(selectedKeys);
    for (const k of rangeKeys) {
      nextSet.add(k);
    }
    setSelectedKeysState(Array.from(nextSet));
  });

  const selectAll = useEventCallback(() => {
    if (!multiple) {
      return;
    }
    setSelectedKeysState([...itemKeys]);
  });

  const clear = useEventCallback(() => {
    if (selectedKeys.length === 0) {
      return;
    }
    setSelectedKeysState([]);
  });

  const toggleAll = useEventCallback(() => {
    if (isAllSelected) {
      clear();
    } else {
      selectAll();
    }
  });

  const setSelectedKeys = useEventCallback((keys: TKey[]) => {
    setSelectedKeysState(multiple ? keys : keys.slice(0, 1));
  });

  return {
    selectedKeys,
    selectedSet,
    selectedItems,
    isSelected,
    isAllSelected,
    isPartiallySelected,
    isNoneSelected,
    select,
    deselect,
    toggle,
    selectRange,
    selectAll,
    clear,
    toggleAll,
    setSelectedKeys,
  };
}
