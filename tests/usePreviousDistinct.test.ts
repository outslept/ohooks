import { usePreviousDistinct } from '@/hooks/usePreviousDistinct';
import { describe, expect, it } from 'vitest';
import { renderHook } from 'vitest-browser-react';

describe('usePreviousDistinct', () => {
  it('uses Object.is by default (including NaN) and retains previous across equal rerenders', async () => {
    const { result, rerender } = await renderHook((val: number = 1) =>
      usePreviousDistinct(val),
    );
    expect(result.current).toBeUndefined();

    await rerender(1);
    expect(result.current).toBeUndefined();

    await rerender(2);
    expect(result.current).toBe(1);

    await rerender(2);
    expect(result.current).toBe(1);

    await rerender(Number.NaN);
    expect(result.current).toBe(2);

    await rerender(Number.NaN);
    expect(result.current).toBe(2);
  });

  it('supports custom comparator', async () => {
    const { result, rerender } = await renderHook(
      (v: { id: number; label: string } = { id: 1, label: 'one' }) =>
        usePreviousDistinct(v, (a, b) => a.id === b.id),
    );
    await rerender({ id: 1, label: 'one-modified' });
    expect(result.current).toBeUndefined();

    await rerender({ id: 2, label: 'two' });
    expect(result.current).toEqual({ id: 1, label: 'one' });

    await rerender({ id: 2, label: 'two-modified' });
    expect(result.current).toEqual({ id: 1, label: 'one' });
  });
});
