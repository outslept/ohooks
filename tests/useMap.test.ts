import { useMap } from '@/hooks/useMap';
import { describe, expect, it } from 'vitest';
import { renderHook } from 'vitest-browser-react';

describe('useMap', () => {
  it('manages entries and preserves reference on no-op mutations', async () => {
    const { result, act } = await renderHook(() =>
      useMap<string, number>([['a', 1]]),
    );

    expect(result.current[1].get('a')).toBe(1);
    expect(result.current[1].has('a')).toBe(true);

    const initialMap = result.current[0];
    await act(async () => {
      result.current[1].set('a', 1);
      result.current[1].remove('missing');
    });
    expect(result.current[0]).toBe(initialMap);

    await act(async () => {
      result.current[1].set('b', 2);
    });
    expect(result.current[1].get('b')).toBe(2);

    await act(async () => {
      result.current[1].remove('a');
    });
    expect(result.current[1].has('a')).toBe(false);

    await act(async () => {
      result.current[1].setAll([['x', 10]]);
    });
    expect(Array.from(result.current[0].entries())).toEqual([['x', 10]]);

    await act(async () => {
      result.current[1].clear();
    });
    expect(result.current[0].size).toBe(0);

    const emptyMap = result.current[0];
    await act(async () => {
      result.current[1].clear();
    });
    expect(result.current[0]).toBe(emptyMap);

    await act(async () => {
      result.current[1].reset();
    });
    expect(Array.from(result.current[0].entries())).toEqual([['a', 1]]);
  });
});
