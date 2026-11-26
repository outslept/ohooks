import { matchesHotkey, useHotkeys, type UseHotkeysOptions } from "@/hooks/useHotkeys";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderHook } from "vitest-browser-react";

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

describe("useHotkeys", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("matchesHotkey handles modifiers, mod platform switch, aliases, event.code fallback, and modifier-only combos", () => {
    const ctrlK = new KeyboardEvent("keydown", { key: "k", ctrlKey: true });
    expect(matchesHotkey("ctrl+k", ctrlK)).toBe(true);
    expect(matchesHotkey("ctrl+shift+k", ctrlK)).toBe(false);
    expect(matchesHotkey("", ctrlK)).toBe(false);

    const cmdS = new KeyboardEvent("keydown", { key: "s", metaKey: true });
    expect(matchesHotkey("mod+s", cmdS, true)).toBe(true);
    expect(matchesHotkey("mod+s", cmdS, false)).toBe(false);

    const esc = new KeyboardEvent("keydown", { key: "Escape" });
    expect(matchesHotkey("esc", esc)).toBe(true);

    const plusOnly = new KeyboardEvent("keydown", { key: "+" });
    expect(matchesHotkey("+", plusOnly)).toBe(true);

    const ctrlPlus = new KeyboardEvent("keydown", { key: "+", ctrlKey: true });
    expect(matchesHotkey("ctrl++", ctrlPlus)).toBe(true);

    const altKeyByCode = new KeyboardEvent("keydown", {
      key: "˚",
      code: "KeyK",
      altKey: true,
    });
    expect(matchesHotkey("alt+k", altKeyByCode)).toBe(true);

    const shiftDigitByCode = new KeyboardEvent("keydown", {
      key: "!",
      code: "Digit1",
      shiftKey: true,
    });
    expect(matchesHotkey("shift+1", shiftDigitByCode)).toBe(true);

    const modifierOnly = new KeyboardEvent("keydown", {
      key: "Shift",
      ctrlKey: true,
      shiftKey: true,
    });
    expect(matchesHotkey("ctrl+shift", modifierOnly)).toBe(true);
  });

  it("matches string or array combos, respects preventDefault and stopPropagation, and cleans up on unmount", async () => {
    const callback = vi.fn();
    const parentListener = vi.fn();
    const container = document.createElement("div");
    const child = document.createElement("button");
    container.appendChild(child);
    document.body.appendChild(container);
    container.addEventListener("keydown", parentListener);

    const { rerender, unmount } = await renderHook(
      (props?: UseHotkeysOptions) =>
        useHotkeys(["ctrl+k", "alt+enter"], callback, {
          target: child,
          ...props,
        }),
      {
        initialProps: {
          preventDefault: false,
          stopPropagation: true,
        },
      },
    );

    const ev1 = new KeyboardEvent("keydown", {
      key: "Enter",
      altKey: true,
      bubbles: true,
      cancelable: true,
    });
    child.dispatchEvent(ev1);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(ev1, "alt+enter");
    expect(ev1.defaultPrevented).toBe(false);
    expect(parentListener).not.toHaveBeenCalled();

    await rerender({ preventDefault: true, stopPropagation: false });

    const ev2 = new KeyboardEvent("keydown", {
      key: "k",
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    });
    child.dispatchEvent(ev2);

    expect(callback).toHaveBeenCalledTimes(2);
    expect(ev2.defaultPrevented).toBe(true);
    expect(parentListener).toHaveBeenCalledTimes(1);

    await unmount();

    child.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true }));
    expect(callback).toHaveBeenCalledTimes(2);
  });

  it("ignores form tags and contentEditable elements unless enableOnFormTags is true", async () => {
    const callback = vi.fn();
    const input = document.createElement("input");
    const editable = document.createElement("div");
    editable.contentEditable = "true";
    document.body.append(input, editable);

    const { rerender } = await renderHook(
      (props?: UseHotkeysOptions) => useHotkeys("ctrl+k", callback, props),
      { initialProps: { enableOnFormTags: false } },
    );

    input.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true }));
    editable.dispatchEvent(
      new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true }),
    );
    expect(callback).not.toHaveBeenCalled();

    await rerender({ enableOnFormTags: true });

    input.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true }));
    editable.dispatchEvent(
      new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true }),
    );
    expect(callback).toHaveBeenCalledTimes(2);
  });

  it("supports keyup events and disables listening when enabled is false", async () => {
    const callback = vi.fn();

    const { rerender } = await renderHook(
      (props?: UseHotkeysOptions) => useHotkeys("ctrl+b", callback, props),
      { initialProps: { event: "keyup", enabled: true } },
    );

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "b", ctrlKey: true }));
    expect(callback).not.toHaveBeenCalled();

    window.dispatchEvent(new KeyboardEvent("keyup", { key: "b", ctrlKey: true }));
    expect(callback).toHaveBeenCalledTimes(1);

    await rerender({ event: "keyup", enabled: false });

    window.dispatchEvent(new KeyboardEvent("keyup", { key: "b", ctrlKey: true }));
    expect(callback).toHaveBeenCalledTimes(1);
  });
});
