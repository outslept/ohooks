import { useCallback, useMemo } from 'react';
import { useControllableState } from './useControllableState';
import { useEventCallback } from './useEventCallback';

export interface UseSelectionOptions<T, TKey = T> {
  getKey?: ((item: T) => TKey) | undefined;
  multiple?: boolean | undefined;
  value?: readonly TKey[] | undefined;
  defaultValue?: readonly TKey[] | undefined;
  onChange?: ((selectedKeys: TKey[]) => void) | undefined;
}

export interface UseSelectionReturn<T, TKey = T> {
  selectedKeys: readonly TKey[];
  selectedSet: ReadonlySet<TKey>;
  selectedItems: T[];
  isSelected: (key: TKey) => boolean;
  isAllSelected: boolean;
  isPartiallySelected: boolean;
  isNoneSelected: boolean;
  select: (key: TKey) => void;
  deselect: (key: TKey) => void;
  toggle: (key: TKey) => void;
  selectRange: (fromKey: TKey, toKey: TKey) => void;
  selectAll: () => void;
  clear: () => void;
  toggleAll: () => void;
  setSelectedKeys: (keys: TKey[]) => void;
}

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

  const [selectedKeys = [], setSelectedKeysState] = useControllableState<
    TKey[]
  >({
    value: value ? [...value] : undefined,
    defaultValue: () => [...defaultValue],
    onChange,
  });

  const itemKeys = useMemo(
    () => items.map((item) => getKey(item)),
    [items, getKey],
  );

  const selectedSet = useMemo(
    () => new Set<TKey>(selectedKeys),
    [selectedKeys],
  );

  const selectedItems = useMemo(
    () => items.filter((item) => selectedSet.has(getKey(item))),
    [items, selectedSet, getKey],
  );

  const selectedItemCount = useMemo(
    () => itemKeys.filter((k) => selectedSet.has(k)).length,
    [itemKeys, selectedSet],
  );

  const isAllSelected =
    itemKeys.length > 0 && selectedItemCount === itemKeys.length;
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
