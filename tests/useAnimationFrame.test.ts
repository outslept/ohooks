import { useAnimationFrame } from '@/hooks/useAnimationFrame';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from 'vitest-browser-react';

describe('useAnimationFrame', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('runs animation loop, respects fpsLimit, and supports start/stop/toggle', async () => {
    const cb = vi.fn();
    const { result, act } = await renderHook(() =>
      useAnimationFrame(cb, { immediate: true, fpsLimit: 30 }),
    );
    expect(result.current.isActive).toBe(true);

    await act(async () => {
      vi.advanceTimersToNextFrame();
    });
    expect(cb).toHaveBeenCalledTimes(1);
    expect(cb.mock.calls[0]?.[0]).toMatchObject({
      deltaTime: 0,
      elapsedTime: 0,
    });

    await act(async () => {
      vi.advanceTimersToNextFrame();
    });
    expect(cb).toHaveBeenCalledTimes(1);

    await act(async () => {
      vi.advanceTimersToNextFrame();
      vi.advanceTimersToNextFrame();
    });
    expect(cb).toHaveBeenCalledTimes(2);

    await act(async () => {
      result.current.toggle();
    });
    expect(result.current.isActive).toBe(false);

    await act(async () => {
      vi.advanceTimersToNextFrame();
    });
    expect(cb).toHaveBeenCalledTimes(2);

    await act(async () => {
      result.current.toggle();
    });
    expect(result.current.isActive).toBe(true);
  });
});
