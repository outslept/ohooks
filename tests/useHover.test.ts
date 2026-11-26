import { useHover } from "@/hooks/useHover";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderHook } from "vitest-browser-react";

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

describe("useHover", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("tracks immediate mouseenter and mouseleave events and resets when target changes", async () => {
    const el1 = document.createElement("div");
    const el2 = document.createElement("div");
    const onEnter = vi.fn();
    const onLeave = vi.fn();

    const { result, rerender, act } = await renderHook(
      (props?: { target: HTMLElement | null }) =>
        useHover(props?.target ?? null, { onEnter, onLeave }),
      { initialProps: { target: el1 as HTMLElement | null } },
    );

    expect(result.current).toBe(false);

    const enterEvent = new MouseEvent("mouseenter");
    await act(async () => {
      el1.dispatchEvent(enterEvent);
    });
    expect(result.current).toBe(true);
    expect(onEnter).toHaveBeenCalledWith(enterEvent);

    await rerender({ target: el2 });
    expect(result.current).toBe(false);

    await act(async () => {
      el2.dispatchEvent(new MouseEvent("mouseenter"));
    });
    expect(result.current).toBe(true);

    const leaveEvent = new MouseEvent("mouseleave");
    await act(async () => {
      el2.dispatchEvent(leaveEvent);
    });
    expect(result.current).toBe(false);
    expect(onLeave).toHaveBeenCalledWith(leaveEvent);

    await rerender({ target: null });
    expect(result.current).toBe(false);
  });

  it("supports enterDelay and leaveDelay, cancels opposite timers on rapid transitions, and clears pending timers on unmount", async () => {
    vi.useFakeTimers();
    const el = document.createElement("div");
    const onEnter = vi.fn();
    const onLeave = vi.fn();

    const { result, act, unmount } = await renderHook(() =>
      useHover(el, { enterDelay: 100, leaveDelay: 150, onEnter, onLeave }),
    );

    await act(async () => {
      el.dispatchEvent(new MouseEvent("mouseenter"));
      vi.advanceTimersByTime(50);
      el.dispatchEvent(new MouseEvent("mouseleave"));
      vi.advanceTimersByTime(200);
    });
    expect(result.current).toBe(false);
    expect(onEnter).not.toHaveBeenCalled();
    onLeave.mockClear();

    await act(async () => {
      el.dispatchEvent(new MouseEvent("mouseenter"));
      vi.advanceTimersByTime(100);
    });
    expect(result.current).toBe(true);
    expect(onEnter).toHaveBeenCalledTimes(1);

    await act(async () => {
      el.dispatchEvent(new MouseEvent("mouseleave"));
      vi.advanceTimersByTime(50);
      el.dispatchEvent(new MouseEvent("mouseenter"));
      vi.advanceTimersByTime(100);
    });
    expect(result.current).toBe(true);
    expect(onLeave).not.toHaveBeenCalled();

    await act(async () => {
      el.dispatchEvent(new MouseEvent("mouseleave"));
      vi.advanceTimersByTime(50);
    });
    await unmount();

    await act(async () => {
      vi.advanceTimersByTime(200);
    });
    expect(onLeave).not.toHaveBeenCalled();
  });
});
