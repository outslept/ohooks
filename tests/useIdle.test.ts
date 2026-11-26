import { useIdle } from "@/hooks/useIdle";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderHook } from "vitest-browser-react";

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

describe("useIdle", () => {
  afterEach(() => {
    vi.useRealTimers();
    Reflect.deleteProperty(document, "hidden");
  });

  it("marks user as idle after timeout, resets on throttled activity or visible visibilitychange, and cleans up on unmount", async () => {
    vi.useFakeTimers();

    const { result, act, unmount } = await renderHook(() => useIdle(1000, { throttleMs: 100 }));

    expect(result.current).toBe(false);

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current).toBe(true);

    await act(async () => {
      window.dispatchEvent(new Event("mousemove"));
    });
    expect(result.current).toBe(false);

    await act(async () => {
      vi.advanceTimersByTime(600);
      window.dispatchEvent(new Event("keydown"));
      vi.advanceTimersByTime(600);
    });
    expect(result.current).toBe(false);

    await act(async () => {
      vi.advanceTimersByTime(400);
    });
    expect(result.current).toBe(true);

    Object.defineProperty(document, "hidden", { value: true, configurable: true });
    await act(async () => {
      vi.advanceTimersByTime(200);
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(result.current).toBe(true);

    Object.defineProperty(document, "hidden", { value: false, configurable: true });
    await act(async () => {
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(result.current).toBe(false);

    await unmount();
    await act(async () => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current).toBe(false);
  });

  it("supports initialState, custom events list, and unthrottled mode (throttleMs: 0)", async () => {
    vi.useFakeTimers();

    const { result, act } = await renderHook(() =>
      useIdle(500, {
        initialState: true,
        events: ["click"],
        throttleMs: 0,
      }),
    );

    expect(result.current).toBe(true);

    await act(async () => {
      window.dispatchEvent(new Event("mousemove"));
    });
    expect(result.current).toBe(true);

    await act(async () => {
      window.dispatchEvent(new Event("click"));
    });
    expect(result.current).toBe(false);

    await act(async () => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current).toBe(true);
  });
});
