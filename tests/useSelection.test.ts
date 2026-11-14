import { useSelection } from '@/hooks/useSelection';
import { describe, expect, it } from 'vitest';
import { renderHook } from 'vitest-browser-react';

const ITEMS = [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }];

describe('useSelection', () => {
  it('handles multi-selection, range selection, and toggleAll', async () => {
    const { result, act } = await renderHook(() =>
      useSelection(ITEMS, { getKey: (item) => item.id }),
    );

    expect(result.current.isNoneSelected).toBe(true);

    await act(async () => {
      result.current.select('a');
    });
    expect(result.current.isSelected('a')).toBe(true);
    expect(result.current.isPartiallySelected).toBe(true);

    await act(async () => {
      result.current.selectRange('d', 'b');
    });
    expect(result.current.selectedKeys).toEqual(['a', 'b', 'c', 'd']);
    expect(result.current.isAllSelected).toBe(true);
    expect(result.current.selectedItems).toHaveLength(4);

    await act(async () => {
      result.current.toggleAll();
    });
    expect(result.current.isNoneSelected).toBe(true);

    await act(async () => {
      result.current.toggleAll();
    });
    expect(result.current.isAllSelected).toBe(true);

    await act(async () => {
      result.current.toggle('b');
    });
    expect(result.current.isSelected('b')).toBe(false);
  });

  it('enforces single selection when multiple is false', async () => {
    const { result, act } = await renderHook(() =>
      useSelection(['x', 'y', 'z'], { multiple: false, defaultValue: ['x'] }),
    );

    expect(result.current.selectedKeys).toEqual(['x']);

    await act(async () => {
      result.current.select('y');
    });
    expect(result.current.selectedKeys).toEqual(['y']);

    await act(async () => {
      result.current.selectRange('x', 'z');
    });
    expect(result.current.selectedKeys).toEqual(['z']);

    await act(async () => {
      result.current.selectAll();
    });
    expect(result.current.selectedKeys).toEqual(['z']);

    await act(async () => {
      result.current.setSelectedKeys(['x', 'y']);
    });
    expect(result.current.selectedKeys).toEqual(['x']);
  });
});
