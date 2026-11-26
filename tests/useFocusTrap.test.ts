import { useFocusTrap, type UseFocusTrapOptions } from "@/hooks/useFocusTrap";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderHook } from "vitest-browser-react";

describe("useFocusTrap", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("focuses initial target, wraps Tab/Shift+Tab at boundaries while allowing internal Tab, handles Escape, and restores focus", async () => {
    const trigger = document.createElement("button");
    trigger.textContent = "Trigger";

    const container = document.createElement("div");
    const disabledBtn = document.createElement("button");
    disabledBtn.disabled = true;
    const hiddenBtn = document.createElement("button");
    hiddenBtn.setAttribute("aria-hidden", "true");
    const btn1 = document.createElement("button");
    btn1.id = "first";
    btn1.textContent = "First";
    const btn2 = document.createElement("button");
    btn2.id = "second";
    btn2.textContent = "Second";

    container.append(disabledBtn, hiddenBtn, btn1, btn2);
    document.body.append(trigger, container);

    trigger.focus();
    expect(document.activeElement).toBe(trigger);

    const onEscape = vi.fn();
    const { unmount } = await renderHook(() =>
      useFocusTrap(container, {
        initialFocus: "#second",
        restoreFocus: true,
        onEscape,
      }),
    );

    expect(document.activeElement).toBe(btn2);

    const tabAtLast = new KeyboardEvent("keydown", {
      key: "Tab",
      bubbles: true,
      cancelable: true,
    });
    document.dispatchEvent(tabAtLast);
    expect(tabAtLast.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(btn1);

    const tabAtFirst = new KeyboardEvent("keydown", {
      key: "Tab",
      bubbles: true,
      cancelable: true,
    });
    document.dispatchEvent(tabAtFirst);
    expect(tabAtFirst.defaultPrevented).toBe(false);

    const shiftTabAtFirst = new KeyboardEvent("keydown", {
      key: "Tab",
      shiftKey: true,
      bubbles: true,
      cancelable: true,
    });
    document.dispatchEvent(shiftTabAtFirst);
    expect(shiftTabAtFirst.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(btn2);

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(onEscape).toHaveBeenCalledTimes(1);

    await unmount();
    expect(document.activeElement).toBe(trigger);
  });

  it("respects enabled=false, restoreFocus=false, and falls back to container tabindex=-1 when empty", async () => {
    const trigger = document.createElement("button");
    trigger.textContent = "Trigger";
    const emptyContainer = document.createElement("div");
    document.body.append(trigger, emptyContainer);
    trigger.focus();

    const { rerender, unmount } = await renderHook(
      (props?: UseFocusTrapOptions) => useFocusTrap(emptyContainer, props),
      { initialProps: { enabled: false, restoreFocus: false } },
    );

    expect(document.activeElement).toBe(trigger);

    await rerender({ enabled: true, restoreFocus: false });
    expect(emptyContainer.getAttribute("tabindex")).toBe("-1");
    expect(document.activeElement).toBe(emptyContainer);

    const tabEvent = new KeyboardEvent("keydown", {
      key: "Tab",
      bubbles: true,
      cancelable: true,
    });
    document.dispatchEvent(tabEvent);
    expect(tabEvent.defaultPrevented).toBe(true);

    await unmount();
    expect(document.activeElement).toBe(emptyContainer);
  });
});
