import { useWindowScroll } from "@/hooks/useWindowScroll";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook } from "vitest-browser-react";

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

describe("useWindowScroll", () => {
  let spacer: HTMLDivElement;

  beforeEach(() => {
    spacer = document.createElement("div");
    spacer.style.height = "3000px";
    spacer.style.width = "3000px";
    document.body.appendChild(spacer);
    window.scrollTo(0, 0);
  });

  afterEach(() => {
    vi.useRealTimers();
    window.scrollTo(0, 0);
    spacer.remove();
  });

  it("tracks window scroll coordinates and scrolls via scrollTo overloads", async () => {
    const { result, act } = await renderHook(() => useWindowScroll({ throttleMs: 0 }));

    expect(result.current.x).toBe(0);
    expect(result.current.y).toBe(0);

    await act(async () => {
      result.current.scrollTo(40, 120);
      window.dispatchEvent(new Event("scroll"));
    });
    expect(result.current.x).toBe(40);
    expect(result.current.y).toBe(120);

    await act(async () => {
      result.current.scrollTo(90);
      window.dispatchEvent(new Event("scroll"));
    });
    expect(result.current.x).toBe(90);
    expect(result.current.y).toBe(120);

    await act(async () => {
      result.current.scrollTo({ top: 0, left: 0 });
      window.dispatchEvent(new Event("scroll"));
    });
    expect(result.current.x).toBe(0);
    expect(result.current.y).toBe(0);
  });

  it("throttles scroll updates when throttleMs > 0", async () => {
    vi.useFakeTimers();
    const { result, act } = await renderHook(() => useWindowScroll({ throttleMs: 100 }));

    await act(async () => {
      window.scrollTo(0, 50);
      window.dispatchEvent(new Event("scroll"));
    });
    expect(result.current.y).toBe(50);

    await act(async () => {
      window.scrollTo(0, 180);
      window.dispatchEvent(new Event("scroll"));
    });
    expect(result.current.y).toBe(50);

    await act(async () => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current.y).toBe(180);
  });
});
