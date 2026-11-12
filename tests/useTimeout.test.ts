import { useTimeout } from '@/hooks/useTimeout';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from 'vitest-browser-react';

describe('useTimeout', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('invokes latest callback after delay and skips when delay is null', async () => {
    const fn1 = vi.fn();
    const fn2 = vi.fn();

    const { rerender } = await renderHook(
      (props: { cb: () => void; delay: number | null } = { cb: fn1, delay: 100 }) =>
        useTimeout(props.cb, props.delay),
    );

    await rerender({ cb: fn2, delay: 100 });
    vi.advanceTimersByTime(99);
    expect(fn2).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(fn1).not.toHaveBeenCalled();
    expect(fn2).toHaveBeenCalledOnce();

    await rerender({ cb: fn2, delay: null });
    vi.advanceTimersByTime(500);
    expect(fn2).toHaveBeenCalledOnce();
  });

  it('clears pending timeout on unmount', async () => {
    const fn = vi.fn();
    const { unmount } = await renderHook(() => useTimeout(fn, 100));

    await unmount();
    vi.advanceTimersByTime(200);
    expect(fn).not.toHaveBeenCalled();
  });
});
