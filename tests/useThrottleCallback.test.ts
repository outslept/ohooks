import { useThrottleCallback } from "@/hooks/useThrottleCallback";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook } from "vitest-browser-react";

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

describe("useThrottleCallback", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("throttles with leading and trailing edges, supports cancel/flush, and cleans up on unmount", async () => {
    const fn = vi.fn((n: number) => n * 2);
    const { result, unmount } = await renderHook(() => useThrottleCallback(fn, 100));

    expect(result.current(1)).toBe(2);
    expect(fn).toHaveBeenCalledTimes(1);

    expect(result.current.flush()).toBe(2);
    expect(fn).toHaveBeenCalledTimes(1);

    result.current(2);
    result.current(3);
    expect(result.current.isPending()).toBe(true);
    expect(fn).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenLastCalledWith(3);

    result.current(4);
    expect(result.current.flush()).toBe(8);
    expect(fn).toHaveBeenCalledTimes(3);

    result.current(5);
    result.current.cancel();
    expect(result.current.isPending()).toBe(false);

    result.current(6);
    result.current(7);
    expect(result.current.isPending()).toBe(true);
    await unmount();
    vi.advanceTimersByTime(200);
    expect(fn).toHaveBeenLastCalledWith(6);
  });

  it("respects leading: false and trailing: false options", async () => {
    const leadingFalseFn = vi.fn((n: number) => n);
    const { result: leadingFalse } = await renderHook(() =>
      useThrottleCallback(leadingFalseFn, 100, {
        leading: false,
        trailing: true,
      }),
    );

    leadingFalse.current(10);
    expect(leadingFalseFn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(100);
    expect(leadingFalseFn).toHaveBeenCalledOnce();
    expect(leadingFalseFn).toHaveBeenCalledWith(10);

    const trailingFalseFn = vi.fn((n: number) => n);
    const { result: trailingFalse } = await renderHook(() =>
      useThrottleCallback(trailingFalseFn, 100, {
        leading: true,
        trailing: false,
      }),
    );

    trailingFalse.current(1);
    trailingFalse.current(2);
    expect(trailingFalse.current.isPending()).toBe(false);
    expect(trailingFalseFn).toHaveBeenCalledOnce();

    vi.advanceTimersByTime(100);
    expect(trailingFalseFn).toHaveBeenCalledOnce();

    trailingFalse.current(3);
    expect(trailingFalseFn).toHaveBeenCalledTimes(2);
    expect(trailingFalseFn).toHaveBeenLastCalledWith(3);
  });
});
