import { type SpinDelayOptions, useSpinDelay } from '@/hooks/useSpinDelay';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from 'vitest-browser-react';

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

describe('useSpinDelay', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('suppresses spinner for fast loads and enforces minDuration once shown', async () => {
    const { result, rerender, act } = await renderHook(
      (loading: boolean = false) =>
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

  it('respects ssr option on initial mount when loading is true', async () => {
    const { result: ssrTrue } = await renderHook(() =>
      useSpinDelay(true, { delay: 500, minDuration: 0, ssr: true }),
    );
    expect(ssrTrue.current).toBe(true);

    const { result: ssrFalse, act } = await renderHook(() =>
      useSpinDelay(true, { delay: 300, minDuration: 0, ssr: false }),
    );
    expect(ssrFalse.current).toBe(false);

    await act(async () => {
      vi.advanceTimersByTime(300);
    });
    expect(ssrFalse.current).toBe(true);
  });

  it('transitions immediately when delay or minDuration is 0', async () => {
    const { result, rerender } = await renderHook(
      (props?: { loading?: boolean; options?: SpinDelayOptions }) =>
        useSpinDelay(props?.loading ?? false, props?.options),
      {
        initialProps: {
          loading: false,
          options: { delay: 0, minDuration: 0, ssr: false },
        },
      },
    );

    expect(result.current).toBe(false);

    await rerender({
      loading: true,
      options: { delay: 0, minDuration: 0, ssr: false },
    });
    expect(result.current).toBe(true);

    await rerender({
      loading: false,
      options: { delay: 0, minDuration: 0, ssr: false },
    });
    expect(result.current).toBe(false);
  });
});
