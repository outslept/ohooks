import { useCountdown } from '@/hooks/useCountdown';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from 'vitest-browser-react';

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

describe('useCountdown', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('counts down to default countStop (0), invokes onTick/onComplete, pauses, and resets', async () => {
    const onTick = vi.fn();
    const onComplete = vi.fn();
    const { result, act } = await renderHook(() =>
      useCountdown({ countStart: 3, onTick, onComplete }),
    );

    expect(result.current.count).toBe(3);
    expect(result.current.isRunning).toBe(false);

    await act(async () => {
      result.current.start();
    });
    expect(result.current.isRunning).toBe(true);

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.count).toBe(2);
    expect(onTick).toHaveBeenLastCalledWith(2);

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.count).toBe(1);
    expect(onTick).toHaveBeenLastCalledWith(1);


    await act(async () => {
      result.current.pause();
    });
    expect(result.current.isRunning).toBe(false);

    await act(async () => {
      vi.advanceTimersByTime(3000);
    });
    expect(result.current.count).toBe(1);
    expect(onComplete).not.toHaveBeenCalled();


    await act(async () => {
      result.current.start();
    });
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.count).toBe(0);
    expect(result.current.isRunning).toBe(false);
    expect(onComplete).toHaveBeenCalledTimes(1);


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

  it('supports count-up mode (isIncrement: true) and autoStart: true', async () => {
    const onComplete = vi.fn();
    const { result, act } = await renderHook(() =>
      useCountdown({
        countStart: 0,
        countStop: 2,
        intervalMs: 500,
        isIncrement: true,
        autoStart: true,
        onComplete,
      }),
    );

    expect(result.current.isRunning).toBe(true);

    await act(async () => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current.count).toBe(1);

    await act(async () => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current.count).toBe(2);
    expect(result.current.isRunning).toBe(false);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});
