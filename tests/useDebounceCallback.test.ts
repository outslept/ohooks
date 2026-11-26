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
    expect(fn).toHaveBeenCalledExactlyOnceWith(2);
    expect(result.current.isPending()).toBe(false);


    expect(result.current.flush()).toBe(4);
    expect(fn).toHaveBeenCalledTimes(1);

    result.current(5);
    expect(result.current.flush()).toBe(10);
    expect(fn).toHaveBeenCalledTimes(2);
    expect(result.current.isPending()).toBe(false);

    result.current(9);
    result.current.cancel();
    expect(result.current.isPending()).toBe(false);

    vi.advanceTimersByTime(200);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('supports leading edge, trailing: false, and maxWait options', async () => {
    const fn = vi.fn((v: string) => v);
    const { result } = await renderHook(() =>
      useDebounceCallback(fn, 100, {
        leading: true,
        trailing: true,
        maxWait: 150,
      }),
    );


    expect(result.current('only-once')).toBe('only-once');
    expect(fn).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);


    result.current('a');
    expect(fn).toHaveBeenCalledTimes(2);

    vi.advanceTimersByTime(80);
    result.current('b');

    vi.advanceTimersByTime(70);
    expect(fn).toHaveBeenCalledTimes(3);
    expect(fn).toHaveBeenLastCalledWith('b');

    result.current('c');
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(4);
    expect(fn).toHaveBeenLastCalledWith('c');


    const leadingOnlyFn = vi.fn((v: string) => v);
    const { result: leadingOnly } = await renderHook(() =>
      useDebounceCallback(leadingOnlyFn, 100, {
        leading: true,
        trailing: false,
      }),
    );

    leadingOnly.current('first');
    leadingOnly.current('dropped');
    vi.advanceTimersByTime(100);
    expect(leadingOnlyFn).toHaveBeenCalledExactlyOnceWith('first');
  });

  it('calls the latest callback on rerender and cancels pending timer on unmount', async () => {
    const firstFn = vi.fn();
    const secondFn = vi.fn();

    const { result, rerender, unmount } = await renderHook(
      (props?: { cb: (val: string) => void }) =>
        useDebounceCallback(props?.cb ?? firstFn, 100),
      { initialProps: { cb: firstFn } },
    );

    result.current('updated-fn');
    await rerender({ cb: secondFn });

    vi.advanceTimersByTime(100);
    expect(firstFn).not.toHaveBeenCalled();
    expect(secondFn).toHaveBeenCalledExactlyOnceWith('updated-fn');

    result.current('unmounted');
    await unmount();

    vi.advanceTimersByTime(100);
    expect(secondFn).toHaveBeenCalledTimes(1);
  });
});
