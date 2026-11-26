import { useCounter, type UseCounterOptions } from '@/hooks/useCounter';
import { describe, expect, it } from 'vitest';
import { renderHook } from 'vitest-browser-react';

describe('useCounter', () => {
  it('increments, decrements, sets, and resets without bounds', async () => {
    const { result, act } = await renderHook(() => useCounter());

    expect(result.current.count).toBe(0);

    await act(async () => {
      result.current.inc();
      result.current.inc(4);
    });
    expect(result.current.count).toBe(5);

    await act(async () => {
      result.current.dec();
      result.current.dec(2);
    });
    expect(result.current.count).toBe(2);

    await act(async () => {
      result.current.set((prev) => prev * -10);
    });
    expect(result.current.count).toBe(-20);

    await act(async () => {
      result.current.reset();
    });
    expect(result.current.count).toBe(0);
  });

  it('clamps initialValue, inc, dec, functional set, and reset within min and max bounds', async () => {
    const { result, rerender, act } = await renderHook(
      (props?: { initialValue: number; options: UseCounterOptions }) =>
        useCounter(props?.initialValue ?? -10, props?.options ?? { min: 0, max: 10 }),
      { initialProps: { initialValue: -10, options: { min: 0, max: 10 } } },
    );


    expect(result.current.count).toBe(0);

    await act(async () => {
      result.current.dec(5);
    });
    expect(result.current.count).toBe(0);

    await act(async () => {
      result.current.inc(25);
    });
    expect(result.current.count).toBe(10);


    await act(async () => {
      result.current.set((prev) => prev - 50);
    });
    expect(result.current.count).toBe(0);

    await act(async () => {
      result.current.set(6);
    });
    expect(result.current.count).toBe(6);


    await rerender({ initialValue: 50, options: { min: 0, max: 20 } });

    await act(async () => {
      result.current.reset();
    });
    expect(result.current.count).toBe(20);
  });
});
