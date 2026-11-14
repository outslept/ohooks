import { useHistoryState } from '@/hooks/useHistoryState';
import { describe, expect, it } from 'vitest';
import { renderHook } from 'vitest-browser-react';

describe('useHistoryState', () => {
  it('tracks undo/redo history, ignores identical sets, and respects capacity', async () => {
    const { result, act } = await renderHook(() => useHistoryState(() => 'a', 2));

    expect(result.current.state).toBe('a');
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);

    await act(async () => {
      result.current.undo();
      result.current.redo();
    });
    expect(result.current.state).toBe('a');

    await act(async () => {
      result.current.set('a');
    });
    expect(result.current.past).toEqual([]);

    await act(async () => {
      result.current.set('b');
      result.current.set('c');
      result.current.set((prev) => `${prev}d`);
    });
    expect(result.current.state).toBe('cd');
    expect(result.current.past).toEqual(['b', 'c']);

    await act(async () => {
      result.current.undo();
    });
    expect(result.current.state).toBe('c');
    expect(result.current.future).toEqual(['cd']);
    expect(result.current.canRedo).toBe(true);

    await act(async () => {
      result.current.redo();
    });
    expect(result.current.state).toBe('cd');
    expect(result.current.future).toEqual([]);

    await act(async () => {
      result.current.undo();
      result.current.set('e');
    });
    expect(result.current.state).toBe('e');
    expect(result.current.future).toEqual([]);

    await act(async () => {
      result.current.clear();
    });
    expect(result.current.state).toBe('e');
    expect(result.current.past).toEqual([]);

    await act(async () => {
      result.current.reset();
    });
    expect(result.current.state).toBe('a');

    await act(async () => {
      result.current.reset('z');
    });
    expect(result.current.state).toBe('z');

    await act(async () => {
      result.current.set('y');
      result.current.reset();
    });
    expect(result.current.state).toBe('z');
  });
});
