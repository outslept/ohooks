import { usePreviousDistinct } from '@/hooks/usePreviousDistinct';
import { describe, expect, it } from 'vitest';
import { renderHook } from 'vitest-browser-react';

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

describe('usePreviousDistinct', () => {
  it('uses Object.is by default (including NaN) and retains previous value across equal rerenders', async () => {
    const { result, rerender } = await renderHook(
      (props?: { val: number }) => usePreviousDistinct(props ? props.val : 1),
      { initialProps: { val: 1 } }
    );

    expect(result.current).toBeUndefined();

    await rerender({ val: 1 });
    expect(result.current).toBeUndefined();

    await rerender({ val: 2 });
    expect(result.current).toBe(1);

    await rerender({ val: 2 });
    expect(result.current).toBe(1);

    await rerender({ val: Number.NaN });
    expect(result.current).toBe(2);

    await rerender({ val: Number.NaN });
    expect(result.current).toBe(2);
  });

  it('supports a custom equality comparator', async () => {
    const { result, rerender } = await renderHook(
      (props?: { item: { id: number; label: string } }) =>
        usePreviousDistinct(
          props?.item ?? { id: 1, label: 'one' },
          (a, b) => a.id === b.id
        ),
      { initialProps: { item: { id: 1, label: 'one' } } }
    );

    await rerender({ item: { id: 1, label: 'one-modified' } });
    expect(result.current).toBeUndefined();

    await rerender({ item: { id: 2, label: 'two' } });
    expect(result.current).toEqual({ id: 1, label: 'one' });

    await rerender({ item: { id: 2, label: 'two-modified' } });
    expect(result.current).toEqual({ id: 1, label: 'one' });
  });
});
