import { useKeyPress } from "@/hooks/useKeyPress";
import { describe, expect, it } from "vitest";
import { renderHook } from "vitest-browser-react";

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

describe("useKeyPress", () => {
  it("tracks keydown/keyup for array and string filters, resets on modifier release or blur, and ignores unrelated keys", async () => {
    const { result, act } = await renderHook(() =>
      useKeyPress(["Enter", "a"], { preventDefault: true }),
    );

    expect(result.current).toBe(false);

    await act(async () => {
      window.dispatchEvent(new Event("keydown"));
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    });
    expect(result.current).toBe(false);

    let keydownEvent!: KeyboardEvent;
    await act(async () => {
      keydownEvent = new KeyboardEvent("keydown", { key: "A", cancelable: true });
      window.dispatchEvent(keydownEvent);
    });
    expect(keydownEvent.defaultPrevented).toBe(true);
    expect(result.current).toBe(true);

    await act(async () => {
      window.dispatchEvent(new KeyboardEvent("keyup", { key: "b" }));
    });
    expect(result.current).toBe(true);

    await act(async () => {
      window.dispatchEvent(new KeyboardEvent("keyup", { key: "a" }));
    });
    expect(result.current).toBe(false);

    await act(async () => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
    });
    expect(result.current).toBe(true);

    await act(async () => {
      window.dispatchEvent(new KeyboardEvent("keyup", { key: "Meta" }));
    });
    expect(result.current).toBe(false);

    await act(async () => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
    });
    expect(result.current).toBe(true);

    await act(async () => {
      window.dispatchEvent(new Event("blur"));
    });
    expect(result.current).toBe(false);
  });

  it("supports predicate filter and custom target element with default preventDefault: false", async () => {
    const input = document.createElement("input");
    document.body.appendChild(input);

    const { result, act } = await renderHook(() =>
      useKeyPress((e) => e.shiftKey && e.key === "Z", { target: input }),
    );

    let event!: KeyboardEvent;
    await act(async () => {
      event = new KeyboardEvent("keydown", {
        key: "Z",
        shiftKey: true,
        cancelable: true,
      });
      input.dispatchEvent(event);
    });

    expect(result.current).toBe(true);
    expect(event.defaultPrevented).toBe(false);

    input.remove();
  });
});
