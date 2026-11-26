import { useFocus, type UseFocusOptions } from "@/hooks/useFocus";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderHook } from "vitest-browser-react";

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

describe("useFocus", () => {
  afterEach(() => {
    document.body.innerHTML = "";
    vi.restoreAllMocks();
  });

  it("tracks focus state, invokes onFocus/onBlur, updates when target changes, and cleans up on unmount", async () => {
    const inputA = document.createElement("input");
    const inputB = document.createElement("input");
    document.body.append(inputA, inputB);
    inputA.focus();

    const onFocus = vi.fn();
    const onBlur = vi.fn();

    const { result, rerender, unmount, act } = await renderHook(
      (props?: { el: HTMLInputElement }) => useFocus(props?.el ?? inputA, { onFocus, onBlur }),
    );

    expect(result.current.isFocused).toBe(true);

    await act(async () => {
      result.current.blur();
    });
    expect(result.current.isFocused).toBe(false);
    expect(onBlur).toHaveBeenCalledTimes(1);

    await act(async () => {
      result.current.focus();
    });
    expect(result.current.isFocused).toBe(true);
    expect(onFocus).toHaveBeenCalledTimes(1);

    await rerender({ el: inputB });
    expect(result.current.isFocused).toBe(false);

    await unmount();
    await act(async () => {
      inputB.focus();
    });
    expect(onFocus).toHaveBeenCalledTimes(1);
  });

  it("filters out non-focus-visible focus events when focusVisible is true", async () => {
    const btn = document.createElement("button");
    const input = document.createElement("input");
    document.body.append(btn, input);

    const onFocus = vi.fn();

    const { result, rerender, act } = await renderHook(
      (props?: { el: HTMLElement; options?: UseFocusOptions }) =>
        useFocus(props?.el ?? btn, props?.options ?? { focusVisible: true, onFocus }),
    );

    await act(async () => {
      btn.dispatchEvent(new FocusEvent("focus"));
    });
    expect(result.current.isFocused).toBe(false);
    expect(onFocus).not.toHaveBeenCalled();

    await rerender({ el: input, options: { focusVisible: true, onFocus } });
    await act(async () => {
      result.current.focus();
    });
    expect(result.current.isFocused).toBe(true);
    expect(onFocus).toHaveBeenCalledTimes(1);
  });
});
