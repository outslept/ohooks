import { useCounter } from '@/hooks/useCounter';
import { describe, expect, it } from 'vitest';
import { renderHook } from 'vitest-browser-react';

describe('useCounter', () => {
  it('increments, decrements, sets, and resets without bounds', async () => {
    const { result, act } = await renderHook(() => useCounter());
    expect(result.current.count).toBe(0);

    await act(async () => {
      result.current.inc();
    });
    expect(result.current.count).toBe(1);

    await act(async () => {
      result.current.inc(4);
    });
    expect(result.current.count).toBe(5);

    await act(async () => {
      result.current.dec();
    });
    expect(result.current.count).toBe(4);

    await act(async () => {
      result.current.dec(2);
    });
    expect(result.current.count).toBe(2);

    await act(async () => {
      result.current.set((prev) => prev * 10);
    });
    expect(result.current.count).toBe(20);

    await act(async () => {
      result.current.reset();
    });
    expect(result.current.count).toBe(0);
  });

  it('clamps initial value and all updates within min and max', async () => {
    const { result, act } = await renderHook(() =>
      useCounter(50, { min: 0, max: 10 }),
    );
    expect(result.current.count).toBe(10);

    await act(async () => {
      result.current.inc(5);
    });
    expect(result.current.count).toBe(10);

    await act(async () => {
      result.current.dec(25);
    });
    expect(result.current.count).toBe(0);

    await act(async () => {
      result.current.set(5);
    });
    expect(result.current.count).toBe(5);

    await act(async () => {
      result.current.reset();
    });
    expect(result.current.count).toBe(10);
  });
});
