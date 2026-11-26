import { useOnClickOutside, type UseOnClickOutsideOptions } from "@/hooks/useOnClickOutside";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderHook } from "vitest-browser-react";

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

describe("useOnClickOutside", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("triggers handler only when clicking outside all target elements and cleans up on unmount", async () => {
    const inside1 = document.createElement("div");
    const child1 = document.createElement("span");
    inside1.appendChild(child1);
    const inside2 = document.createElement("div");
    const outside = document.createElement("button");
    document.body.append(inside1, inside2, outside);

    const handler = vi.fn();
    const { unmount } = await renderHook(() =>
      useOnClickOutside([inside1, { current: inside2 }, null], handler),
    );

    child1.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
    inside2.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
    expect(handler).not.toHaveBeenCalled();

    outside.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
    expect(handler).toHaveBeenCalledTimes(1);

    await unmount();
    outside.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("respects enabled, custom events, and ignores targets removed from DOM during bubble", async () => {
    const target = document.createElement("div");
    const outside = document.createElement("div");
    const selfRemoving = document.createElement("button");
    selfRemoving.addEventListener("mousedown", () => {
      selfRemoving.remove();
    });
    document.body.append(target, outside, selfRemoving);

    const handler = vi.fn();
    const { rerender } = await renderHook(
      (props?: UseOnClickOutsideOptions) =>
        useOnClickOutside(target, handler, {
          events: ["mousedown"],
          capture: false,
          ...props,
        }),
      { initialProps: { enabled: false } },
    );

    outside.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    expect(handler).not.toHaveBeenCalled();

    await rerender({ enabled: true });
    outside.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    expect(handler).toHaveBeenCalledTimes(1);

    selfRemoving.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    expect(handler).toHaveBeenCalledTimes(1);
  });
});
