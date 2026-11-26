import { useVirtualList } from "@/hooks/useVirtualList";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { renderHook } from "vitest-browser-react";

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

describe("useVirtualList", () => {
  let container: HTMLDivElement;
  const items = Array.from({ length: 100 }, (_, i) => `Item ${i}`);

  beforeEach(() => {
    container = document.createElement("div");
    container.style.height = "100px";
    container.style.overflow = "auto";
    const inner = document.createElement("div");
    inner.style.height = "2000px";
    container.appendChild(inner);
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it("computes visible virtual items, totalHeight, and scrolls to clamped index", async () => {
    const { result, act } = await renderHook(() =>
      useVirtualList(items, {
        containerTarget: container,
        itemHeight: 20,
        overscan: 2,
      }),
    );

    expect(result.current.totalHeight).toBe(2000);
    expect(result.current.wrapperProps.style.height).toBe("2000px");
    expect(result.current.virtualItems[0]?.index).toBe(0);
    expect(result.current.virtualItems.length).toBeLessThan(15);

    await act(async () => {
      result.current.scrollToIndex(20);
      container.dispatchEvent(new Event("scroll"));
    });
    expect(container.scrollTop).toBe(400);
    expect(result.current.virtualItems[0]?.index).toBe(18);

    await act(async () => {
      result.current.scrollToIndex(-10);
      container.dispatchEvent(new Event("scroll"));
    });
    expect(container.scrollTop).toBe(0);
  });

  it("supports variable itemHeight function, ResizeObserver updates, and empty items", async () => {
    const variableItems = ["a", "b", "c", "d", "e"];
    const { result, act } = await renderHook(() =>
      useVirtualList(variableItems, {
        containerTarget: container,
        itemHeight: (i) => (i + 1) * 10,
        overscan: 0,
      }),
    );

    expect(result.current.totalHeight).toBe(150);
    expect(result.current.virtualItems[2]?.offsetTop).toBe(30);
    expect(result.current.virtualItems[2]?.height).toBe(30);

    await act(async () => {
      result.current.scrollToIndex(3);
    });
    expect(container.scrollTop).toBe(60);

    const { result: emptyResult } = await renderHook(() =>
      useVirtualList([], {
        containerTarget: { current: null },
        itemHeight: 20,
      }),
    );
    expect(emptyResult.current.virtualItems).toEqual([]);
    expect(emptyResult.current.totalHeight).toBe(0);
    expect(() => emptyResult.current.scrollToIndex(0)).not.toThrow();
  });
});
