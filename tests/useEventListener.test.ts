import { useEventListener } from "@/hooks/useEventListener";
import { createRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderHook } from "vitest-browser-react";

describe("useEventListener", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("listens to window events by default, invokes latest handler without re-subscribing, and cleans up on unmount", async () => {
    const addSpy = vi.spyOn(window, "addEventListener");
    const firstHandler = vi.fn();
    const secondHandler = vi.fn();

    const { rerender, unmount } = await renderHook(
      (props?: { fn: (e: Event) => void }) => useEventListener("resize", props?.fn ?? firstHandler),
      { initialProps: { fn: firstHandler } },
    );

    const resizeSubscriptionsAfterMount = addSpy.mock.calls.filter(
      ([type]) => type === "resize",
    ).length;

    window.dispatchEvent(new Event("resize"));
    expect(firstHandler).toHaveBeenCalledTimes(1);

    await rerender({ fn: secondHandler });
    expect(addSpy.mock.calls.filter(([type]) => type === "resize").length).toBe(
      resizeSubscriptionsAfterMount,
    );

    window.dispatchEvent(new Event("resize"));
    expect(firstHandler).toHaveBeenCalledTimes(1);
    expect(secondHandler).toHaveBeenCalledTimes(1);

    await unmount();
    window.dispatchEvent(new Event("resize"));
    expect(secondHandler).toHaveBeenCalledTimes(1);
  });

  it("attaches to HTMLElement, RefObject, or Document, switches targets on rerender, and respects listener options", async () => {
    const buttonA = document.createElement("button");
    const buttonB = document.createElement("button");
    const refA = { current: buttonA };
    const refB = { current: buttonB };
    const clickHandler = vi.fn();
    const docHandler = vi.fn();

    const { rerender } = await renderHook(
      (props?: { target: { readonly current: HTMLButtonElement | null } }) => {
        useEventListener("click", clickHandler, props?.target ?? refA, {
          once: true,
        });
        useEventListener("visibilitychange", docHandler, document, true);
      },
      { initialProps: { target: refA } },
    );

    buttonA.click();
    buttonA.click();
    expect(clickHandler).toHaveBeenCalledTimes(1);

    document.dispatchEvent(new Event("visibilitychange"));
    expect(docHandler).toHaveBeenCalledTimes(1);

    await rerender({ target: refB });
    buttonB.click();
    expect(clickHandler).toHaveBeenCalledTimes(2);
  });

  it("does not attach listener when target resolves to null", async () => {
    const handler = vi.fn();
    const emptyRef = createRef<HTMLDivElement>();

    await renderHook(() => useEventListener("click", handler, emptyRef));

    window.dispatchEvent(new MouseEvent("click"));
    expect(handler).not.toHaveBeenCalled();
  });
});
