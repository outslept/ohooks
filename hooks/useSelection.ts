import { useMemo, useRef } from 'react';
import { useControllableState } from './useControllableState';
import { useEventCallback } from './useEventCallback';

export interface UseSelectionOptions<T, TKey = T> {
  getKey?: (item: T) => TKey;
  value?: ReadonlyArray<TKey>;
  defaultValue?: ReadonlyArray<TKey>;
  multiple?: boolean;
  onChange?: (selectedKeys: TKey[]) => void;
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
  toggleAll: () => void;
  selectRange: (toKey: TKey, fromKey?: TKey) => void;
  selectAll: () => void;
  clear: () => void;
  setSelectedKeys: (keys: ReadonlyArray<TKey>) => void;
}

const defaultGetKey = <T, TKey>(item: T): TKey => item as unknown as TKey;

export function useSelection<T, TKey = T>(
  items: ReadonlyArray<T>,
  options: UseSelectionOptions<T, TKey> = {},
): UseSelectionReturn<T, TKey> {
  const {
    getKey = defaultGetKey,
    value,
    defaultValue = [],
    multiple = true,
    onChange,
  } = options;

  const [selectedKeys, setInternalKeys] = useControllableState<
    ReadonlyArray<TKey>
  >({
    value,
    defaultValue,
    onChange: (next) => {
      onChange?.([...next]);
    },
  });

  const anchorKeyRef = useRef<TKey | null>(null);

  const selectedSet = useMemo<ReadonlySet<TKey>>(
    () => new Set(selectedKeys),
    [selectedKeys],
  );

  const itemKeys = useMemo<TKey[]>(() => {
    const seen = new Set<TKey>();
    const keys: TKey[] = [];
    for (const item of items) {
      const key = getKey(item);
      if (!seen.has(key)) {
        seen.add(key);
        keys.push(key);
      }
    }
    return keys;
  }, [items, getKey]);

  const selectedItems = useMemo<T[]>(
    () => items.filter((item) => selectedSet.has(getKey(item))),
    [items, selectedSet, getKey],
  );

  const selectedCountInItems = useMemo<number>(() => {
    let count = 0;
    for (const key of itemKeys) {
      if (selectedSet.has(key)) {
        count += 1;
      }
    }
    return count;
  }, [itemKeys, selectedSet]);

  const isAllSelected =
    multiple &&
    itemKeys.length > 0 &&
    selectedCountInItems === itemKeys.length;
  const isNoneSelected = selectedCountInItems === 0;
  const isPartiallySelected = !isNoneSelected && !isAllSelected;

  const isSelected = useEventCallback((key: TKey): boolean => {
    return selectedSet.has(key);
  });

  const setSelectedKeys = useEventCallback((keys: ReadonlyArray<TKey>) => {
    const deduplicated = Array.from(new Set(keys));
    const normalized = multiple ? deduplicated : deduplicated.slice(0, 1);
    setInternalKeys(normalized);
  });

  const select = useEventCallback((key: TKey) => {
    anchorKeyRef.current = key;

    if (!multiple) {
      if (selectedKeys.length === 1 && Object.is(selectedKeys[0], key)) {
        return;
      }
      setInternalKeys([key]);
      return;
    }

    if (selectedSet.has(key)) {
      return;
    }
    setInternalKeys([...selectedKeys, key]);
  });

  const deselect = useEventCallback((key: TKey) => {
    if (!selectedSet.has(key)) {
      return;
    }
    setInternalKeys(selectedKeys.filter((k) => !Object.is(k, key)));
  });

  const toggle = useEventCallback((key: TKey) => {
    if (selectedSet.has(key)) {
      deselect(key);
    } else {
      select(key);
    }
  });

  const selectRange = useEventCallback((toKey: TKey, fromKey?: TKey) => {
    if (!multiple) {
      select(toKey);
      return;
    }

    const startKey = fromKey !== undefined ? fromKey : anchorKeyRef.current;
    if (startKey === null) {
      select(toKey);
      return;
    }

    const startIdx = itemKeys.findIndex((k) => Object.is(k, startKey));
    const endIdx = itemKeys.findIndex((k) => Object.is(k, toKey));

    if (startIdx === -1 || endIdx === -1) {
      select(toKey);
      return;
    }

    const low = Math.min(startIdx, endIdx);
    const high = Math.max(startIdx, endIdx);
    const rangeKeys = itemKeys.slice(low, high + 1);

    const merged = new Set<TKey>(selectedKeys);
    let changed = false;
    for (const k of rangeKeys) {
      if (!merged.has(k)) {
        merged.add(k);
        changed = true;
      }
    }

    anchorKeyRef.current = toKey;
    if (changed) {
      setInternalKeys(Array.from(merged));
    }
  });

  const selectAll = useEventCallback(() => {
    if (!multiple || itemKeys.length === 0) {
      return;
    }
    const merged = new Set<TKey>(selectedKeys);
    let changed = false;
    for (const key of itemKeys) {
      if (!merged.has(key)) {
        merged.add(key);
        changed = true;
      }
    }
    if (changed) {
      setInternalKeys(Array.from(merged));
    }
  });

  const clear = useEventCallback(() => {
    anchorKeyRef.current = null;
    if (selectedKeys.length === 0) {
      return;
    }
    setInternalKeys([]);
  });

  const toggleAll = useEventCallback(() => {
    if (!multiple) {
      return;
    }
    if (isAllSelected) {
      const currentItemSet = new Set<TKey>(itemKeys);
      setInternalKeys(selectedKeys.filter((k) => !currentItemSet.has(k)));
    } else {
      selectAll();
    }
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
    toggleAll,
    selectRange,
    selectAll,
    clear,
    setSelectedKeys,
  };
}
