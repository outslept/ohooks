import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from 'vitest-browser-react';
import { useIdle } from '@/hooks/useIdle';

describe('useIdle', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('marks user as idle after timeout and resets on activity or visibilitychange', async () => {
    vi.useFakeTimers();

    const { result, act } = await renderHook(() =>
      useIdle(1000, { throttleMs: 100 })
    );

    expect(result.current).toBe(false);

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current).toBe(true);

    await act(async () => {
      window.dispatchEvent(new Event('mousemove'));
    });
    expect(result.current).toBe(false);

    await act(async () => {
      vi.advanceTimersByTime(600);
      window.dispatchEvent(new Event('keydown'));
      vi.advanceTimersByTime(600);
    });
    expect(result.current).toBe(false);

    await act(async () => {
      vi.advanceTimersByTime(400);
    });
    expect(result.current).toBe(true);

    vi.spyOn(document, 'hidden', 'get').mockReturnValue(false);
    await act(async () => {
      vi.advanceTimersByTime(200);
      document.dispatchEvent(new Event('visibilitychange'));
    });
    expect(result.current).toBe(false);
  });
});
