import { useInterval } from '@/hooks/useInterval';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from 'vitest-browser-react';

describe('useInterval', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('calls latest callback repeatedly and pauses when delay is null', async () => {
    const fn1 = vi.fn();
    const fn2 = vi.fn();

    const { rerender, unmount } = await renderHook(
      (props: { cb: () => void; delay: number | null } = { cb: fn1, delay: 100 }) =>
        useInterval(props.cb, props.delay),
    );

    vi.advanceTimersByTime(100);
    expect(fn1).toHaveBeenCalledOnce();

    await rerender({ cb: fn2, delay: 100 });
    vi.advanceTimersByTime(200);
    expect(fn2).toHaveBeenCalledTimes(2);

    await rerender({ cb: fn2, delay: null });
    vi.advanceTimersByTime(300);
    expect(fn2).toHaveBeenCalledTimes(2);

    await unmount();
  });
});
