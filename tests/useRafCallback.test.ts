import { useRafCallback } from '@/hooks/useRafCallback';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from 'vitest-browser-react';

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

describe('useRafCallback', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('coalesces calls into a single animation frame, uses latest callback, and supports flush, cancel, and unmount cleanup', async () => {
    const fn1 = vi.fn((x: number) => x * 2);
    const fn2 = vi.fn((x: number) => x * 3);

    const { result, rerender, unmount } = await renderHook(
      (props?: { fn: (x: number) => number }) =>
        useRafCallback(props?.fn ?? fn1),
      { initialProps: { fn: fn1 } }
    );

    result.current(1);
    result.current(2);
    expect(result.current.isPending()).toBe(true);


    await rerender({ fn: fn2 });
    vi.advanceTimersToNextFrame();

    expect(fn1).not.toHaveBeenCalled();
    expect(fn2).toHaveBeenCalledTimes(1);
    expect(fn2).toHaveBeenCalledWith(2);
    expect(result.current.isPending()).toBe(false);


    expect(result.current.flush()).toBe(6);
    expect(fn2).toHaveBeenCalledTimes(1);


    result.current(4);
    expect(result.current.flush()).toBe(12);
    expect(result.current.isPending()).toBe(false);
    vi.advanceTimersToNextFrame();
    expect(fn2).toHaveBeenCalledTimes(2);


    result.current(5);
    result.current.cancel();
    expect(result.current.isPending()).toBe(false);
    vi.advanceTimersToNextFrame();
    expect(fn2).toHaveBeenCalledTimes(2);


    result.current(6);
    await unmount();
    vi.advanceTimersToNextFrame();
    expect(fn2).toHaveBeenCalledTimes(2);
  });
});
