import { useRafCallback } from '@/hooks/useRafCallback';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from 'vitest-browser-react';

describe('useRafCallback', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('coalesces calls into a single animation frame and supports flush and cancel', async () => {
    const fn = vi.fn((x: number) => x * 3);
    const { result, unmount } = await renderHook(() => useRafCallback(fn));

    result.current(1);
    result.current(2);
    expect(result.current.isPending()).toBe(true);
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersToNextFrame();
    expect(fn).toHaveBeenCalledOnce();
    expect(fn).toHaveBeenCalledWith(2);
    expect(result.current.isPending()).toBe(false);

    result.current(4);
    expect(result.current.flush()).toBe(12);
    expect(result.current.isPending()).toBe(false);

    result.current(5);
    result.current.cancel();
    vi.advanceTimersToNextFrame();
    expect(fn).toHaveBeenCalledTimes(2);

    result.current(6);
    await unmount();
    vi.advanceTimersToNextFrame();
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
