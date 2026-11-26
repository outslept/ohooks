import { useElementSize, type UseElementSizeOptions } from "@/hooks/useElementSize";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { renderHook } from "vitest-browser-react";

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

describe("useElementSize", () => {
  let boxEl: HTMLDivElement;

  beforeEach(() => {
    boxEl = document.createElement("div");
    boxEl.style.boxSizing = "content-box";
    boxEl.style.width = "110px";
    boxEl.style.height = "50px";
    boxEl.style.padding = "5px";
    boxEl.style.border = "2px solid black";
    document.body.appendChild(boxEl);
  });

  afterEach(() => {
    boxEl.remove();
  });

  it("measures content-box and border-box dimensions and updates on resize", async () => {
    const { result, rerender, act } = await renderHook((props?: UseElementSizeOptions) =>
      useElementSize(boxEl, props),
    );

    await expect.poll(() => result.current).toEqual({ width: 110, height: 50 });

    await rerender({ box: "border-box" });
    await expect.poll(() => result.current).toEqual({ width: 124, height: 64 });

    await act(async () => {
      boxEl.style.width = "200px";
      boxEl.style.height = "80px";
    });
    await expect.poll(() => result.current).toEqual({ width: 214, height: 94 });
  });

  it("returnsinitial dimensions when target is null", async () => {
    const nullRef = { current: null };
    const { result } = await renderHook(() =>
      useElementSize(nullRef, { initialWidth: 15, initialHeight: 25 }),
    );

    expect(result.current).toEqual({ width: 15, height: 25 });
  });
});
