import { useCounter } from '@/hooks/useCounter';
import { act } from 'react';
import { describe, expect, it } from 'vitest';
import { renderHook } from 'vitest-browser-react';

describe('useCounter', () => {
  it('increments, decrements, sets, and resets without bounds', async () => {
    const { result } = await renderHook(() => useCounter());
    expect(result.current.count).toBe(0);

    act(() => result.current.inc());
    expect(result.current.count).toBe(1);

    act(() => result.current.inc(4));
    expect(result.current.count).toBe(5);

    act(() => result.current.dec());
    expect(result.current.count).toBe(4);

    act(() => result.current.dec(2));
    expect(result.current.count).toBe(2);

    act(() => result.current.set((prev) => prev * 10));
    expect(result.current.count).toBe(20);

    act(() => result.current.reset());
    expect(result.current.count).toBe(0);
  });

  it('clamps initial value and all updates within min and max', async () => {
    const { result } = await renderHook(() =>
      useCounter(50, { min: 0, max: 10 }),
    );
    expect(result.current.count).toBe(10);

    act(() => result.current.inc(5));
    expect(result.current.count).toBe(10);

    act(() => result.current.dec(25));
    expect(result.current.count).toBe(0);

    act(() => result.current.set(5));
    expect(result.current.count).toBe(5);

    act(() => result.current.reset());
    expect(result.current.count).toBe(10);
  });
});
