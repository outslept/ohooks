import { useThrottleCallback } from '@/hooks/useThrottleCallback';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from 'vitest-browser-react';

describe('useThrottleCallback', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('throttles with leading and trailing edges and supports cancel/flush', async () => {
    const fn = vi.fn((n: number) => n);
    const { result } = await renderHook(() => useThrottleCallback(fn, 100));

    expect(result.current(1)).toBe(1);
    expect(fn).toHaveBeenCalledTimes(1);

    result.current(2);
    result.current(3);
    expect(result.current.isPending()).toBe(true);
    expect(fn).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenLastCalledWith(3);

    result.current(4);
    expect(result.current.flush()).toBe(4);

    result.current(5);
    result.current.cancel();
    expect(result.current.isPending()).toBe(false);
  });

  it('respects leading: false option', async () => {
    const fn = vi.fn((n: number) => n);
    const { result } = await renderHook(() =>
      useThrottleCallback(fn, 100, { leading: false, trailing: true }),
    );

    result.current(10);
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledOnce();
    expect(fn).toHaveBeenCalledWith(10);
  });
});
