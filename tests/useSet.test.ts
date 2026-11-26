import { useSet } from '@/hooks/useSet';
import { describe, expect, it } from 'vitest';
import { renderHook } from 'vitest-browser-react';

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

describe('useSet', () => {
  it('manages values, preserves reference on no-ops, and resets to initial iterable', async () => {
    const { result, act } = await renderHook(() => useSet(['a']));

    expect(result.current[1].has('a')).toBe(true);
    const initialSet = result.current[0];

    await act(async () => {
      result.current[1].add('a');
      result.current[1].remove('missing');
    });
    expect(result.current[0]).toBe(initialSet);

    await act(async () => {
      result.current[1].add('b');
    });
    expect(result.current[1].has('b')).toBe(true);

    await act(async () => {
      result.current[1].toggle('a');
    });
    expect(result.current[1].has('a')).toBe(false);

    await act(async () => {
      result.current[1].toggle('a');
    });
    expect(result.current[1].has('a')).toBe(true);

    await act(async () => {
      result.current[1].remove('b');
    });
    expect(result.current[1].has('b')).toBe(false);

    await act(async () => {
      result.current[1].clear();
    });
    expect(result.current[0].size).toBe(0);

    const emptySet = result.current[0];
    await act(async () => {
      result.current[1].clear();
    });
    expect(result.current[0]).toBe(emptySet);

    await act(async () => {
      result.current[1].reset();
    });
    expect(Array.from(result.current[0])).toEqual(['a']);
  });

  it('defaults to an empty set when initialValue is omitted', async () => {
    const { result, act } = await renderHook(() => useSet<number>());

    expect(result.current[0].size).toBe(0);

    await act(async () => {
      result.current[1].add(1);
    });
    expect(result.current[1].has(1)).toBe(true);

    await act(async () => {
      result.current[1].reset();
    });
    expect(result.current[0].size).toBe(0);
  });
});
