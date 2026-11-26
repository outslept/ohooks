import { useBoolean } from "@/hooks/useBoolean";
import { describe, expect, it } from "vitest";
import { renderHook } from "vitest-browser-react";

describe("useBoolean", () => {
  it("defaults to false and updates state via setTrue, setFalse, toggle, and setValue", async () => {
    const { result, act } = await renderHook(() => useBoolean());

    expect(result.current.value).toBe(false);

    await act(async () => {
      result.current.setTrue();
    });
    expect(result.current.value).toBe(true);

    await act(async () => {
      result.current.setTrue();
    });
    expect(result.current.value).toBe(true);

    await act(async () => {
      result.current.setFalse();
    });
    expect(result.current.value).toBe(false);

    await act(async () => {
      result.current.setFalse();
    });
    expect(result.current.value).toBe(false);

    await act(async () => {
      result.current.toggle();
    });
    expect(result.current.value).toBe(true);

    await act(async () => {
      result.current.setValue(false);
    });
    expect(result.current.value).toBe(false);

    await act(async () => {
      result.current.setValue((prev) => !prev);
    });
    expect(result.current.value).toBe(true);
  });

  it("uses defaultValue on initial mount only and preserves state across rerenders", async () => {
    const { result, rerender } = await renderHook(
      (props?: { defaultValue?: boolean }) => useBoolean(props?.defaultValue),
      { initialProps: { defaultValue: true } },
    );

    expect(result.current.value).toBe(true);

    await rerender({ defaultValue: false });
    expect(result.current.value).toBe(true);
  });

  it("maintains stable handler references across state changes", async () => {
    const { result, act } = await renderHook(() => useBoolean());

    const initialHandlers = {
      setValue: result.current.setValue,
      setTrue: result.current.setTrue,
      setFalse: result.current.setFalse,
      toggle: result.current.toggle,
    };

    await act(async () => {
      result.current.toggle();
    });

    expect(result.current.setValue).toBe(initialHandlers.setValue);
    expect(result.current.setTrue).toBe(initialHandlers.setTrue);
    expect(result.current.setFalse).toBe(initialHandlers.setFalse);
    expect(result.current.toggle).toBe(initialHandlers.toggle);
  });
});
