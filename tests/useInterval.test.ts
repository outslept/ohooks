import { useInterval } from "@/hooks/useInterval";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook } from "vitest-browser-react";

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

describe("useInterval", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("invokes latest callback on interval, updates frequency, pauses on null, and clears active timer on unmount", async () => {
    const fn1 = vi.fn();
    const fn2 = vi.fn();

    const { rerender, unmount } = await renderHook(
      (props?: { cb: () => void; delay: number | null }) =>
        useInterval(props?.cb ?? fn1, props !== undefined ? props.delay : 100),
      { initialProps: { cb: fn1, delay: 100 as number | null } },
    );

    vi.advanceTimersByTime(100);
    expect(fn1).toHaveBeenCalledTimes(1);

    await rerender({ cb: fn2, delay: 100 });
    vi.advanceTimersByTime(200);
    expect(fn2).toHaveBeenCalledTimes(2);

    await rerender({ cb: fn2, delay: null });
    vi.advanceTimersByTime(300);
    expect(fn2).toHaveBeenCalledTimes(2);

    await rerender({ cb: fn2, delay: 50 });
    vi.advanceTimersByTime(50);
    expect(fn2).toHaveBeenCalledTimes(3);

    await unmount();
    vi.advanceTimersByTime(200);
    expect(fn2).toHaveBeenCalledTimes(3);
  });
});
