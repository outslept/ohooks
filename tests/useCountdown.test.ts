import { useCountdown } from '@/hooks/useCountdown';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from 'vitest-browser-react';

describe('useCountdown', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('counts down, pauses, resets, and fires onTick and onComplete', async () => {
    const onTick = vi.fn();
    const onComplete = vi.fn();
    const { result, act } = await renderHook(() =>
      useCountdown({
        countStart: 3,
        countStop: 1,
        intervalMs: 100,
        onTick,
        onComplete,
      }),
    );

    expect(result.current.count).toBe(3);
    expect(result.current.isRunning).toBe(false);

    await act(async () => {
      result.current.start();
    });
    expect(result.current.isRunning).toBe(true);

    await act(async () => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current.count).toBe(2);
    expect(onTick).toHaveBeenCalledWith(2);

    await act(async () => {
      result.current.pause();
    });
    await act(async () => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current.count).toBe(2);

    await act(async () => {
      result.current.start();
    });
    await act(async () => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current.count).toBe(1);
    expect(result.current.isRunning).toBe(false);
    expect(onComplete).toHaveBeenCalledOnce();

    await act(async () => {
      result.current.start();
    });
    expect(result.current.isRunning).toBe(false);

    await act(async () => {
      result.current.reset();
    });
    expect(result.current.count).toBe(3);
    expect(result.current.isRunning).toBe(false);
  });

  it('supports autoStart and increment mode', async () => {
    const onComplete = vi.fn();
    const { result, act } = await renderHook(() =>
      useCountdown({
        countStart: 0,
        countStop: 2,
        intervalMs: 50,
        isIncrement: true,
        autoStart: true,
        onComplete,
      }),
    );

    expect(result.current.isRunning).toBe(true);

    await act(async () => {
      vi.advanceTimersByTime(50);
    });
    await act(async () => {
      vi.advanceTimersByTime(50);
    });
    expect(result.current.count).toBe(2);
    expect(result.current.isRunning).toBe(false);
    expect(onComplete).toHaveBeenCalledOnce();
  });
});
