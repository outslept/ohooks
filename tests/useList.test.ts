import { useList } from '@/hooks/useList';
import { describe, expect, it } from 'vitest';
import { renderHook } from 'vitest-browser-react';

describe('useList', () => {
  it('supports push, updateAt, insertAt, removeAt, filter, sort, clear, reset, and negative indices', async () => {
    const { result, act } = await renderHook(() => useList(() => [3, 1]));
    expect(result.current[0]).toEqual([3, 1]);

    const refBeforeNoop = result.current[0];
    await act(async () => {
      result.current[1].push();
      result.current[1].updateAt(99, 0);
      result.current[1].updateAt(0, 3);
      result.current[1].removeAt(-99);
    });
    expect(result.current[0]).toBe(refBeforeNoop);

    await act(async () => {
      result.current[1].push(2);
    });
    expect(result.current[0]).toEqual([3, 1, 2]);

    await act(async () => {
      result.current[1].updateAt(-1, 4);
    });
    expect(result.current[0]).toEqual([3, 1, 4]);

    await act(async () => {
      result.current[1].insertAt(-1, 9);
    });
    expect(result.current[0]).toEqual([3, 1, 9, 4]);

    await act(async () => {
      result.current[1].removeAt(-2);
    });
    expect(result.current[0]).toEqual([3, 1, 4]);

    await act(async () => {
      result.current[1].sort((a, b) => a - b);
    });
    expect(result.current[0]).toEqual([1, 3, 4]);

    await act(async () => {
      result.current[1].filter((n) => n > 1);
    });
    expect(result.current[0]).toEqual([3, 4]);

    await act(async () => {
      result.current[1].clear();
    });
    expect(result.current[0]).toEqual([]);

    const emptyRef = result.current[0];
    await act(async () => {
      result.current[1].clear();
    });
    expect(result.current[0]).toBe(emptyRef);

    await act(async () => {
      result.current[1].reset();
    });
    expect(result.current[0]).toEqual([3, 1]);
  });
});
