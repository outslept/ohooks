import { useDebounceCallback } from '@/hooks/useDebounceCallback';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from 'vitest-browser-react';

describe('useDebounceCallback', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('debounces trailing calls and supports flush, cancel, and isPending', async () => {
    const fn = vi.fn((x: number) => x * 2);
    const { result } = await renderHook(() => useDebounceCallback(fn, 100));

    result.current(1);
    result.current(2);
    expect(result.current.isPending()).toBe(true);
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledOnce();
    expect(fn).toHaveBeenCalledWith(2);
    expect(result.current.isPending()).toBe(false);

    result.current(5);
    expect(result.current.flush()).toBe(10);
    expect(fn).toHaveBeenCalledTimes(2);

    result.current(9);
    result.current.cancel();
    expect(result.current.isPending()).toBe(false);
    vi.advanceTimersByTime(200);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('supports leading edge and maxWait options', async () => {
    const fn = vi.fn((v: string) => v);
    const { result } = await renderHook(() =>
      useDebounceCallback(fn, 100, {
        leading: true,
        trailing: true,
        maxWait: 150,
      }),
    );

    expect(result.current('first')).toBe('first');
    expect(fn).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(80);
    result.current('second');

    vi.advanceTimersByTime(80);
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenLastCalledWith('second');
  });
});
