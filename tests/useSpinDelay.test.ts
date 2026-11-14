import { useSpinDelay } from '@/hooks/useSpinDelay';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from 'vitest-browser-react';

describe('useSpinDelay', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('suppresses spinner for fast loads and enforces minDuration once shown', async () => {
    const { result, rerender, act } = await renderHook((loading: boolean = false) =>
      useSpinDelay(loading, { delay: 200, minDuration: 150, ssr: false }),
    );

    expect(result.current).toBe(false);

    await rerender(true);
    await act(async () => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current).toBe(false);

    await rerender(false);
    await act(async () => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current).toBe(false);

    await rerender(true);
    await act(async () => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current).toBe(true);

    await rerender(false);
    await act(async () => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current).toBe(true);

    await rerender(true);
    await act(async () => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current).toBe(true);

    await rerender(false);
    await act(async () => {
      vi.advanceTimersByTime(150);
    });
    expect(result.current).toBe(false);
  });

  it('displays immediately on mount when loading is true and ssr is enabled', async () => {
    const { result } = await renderHook(() =>
      useSpinDelay(true, { delay: 500, minDuration: 0, ssr: true }),
    );
    expect(result.current).toBe(true);
  });
});
