import {
  useControllableState,
  type UseControllableStateOptions,
} from "@/hooks/useControllableState";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderHook } from "vitest-browser-react";

describe("useControllableState", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("manages state internally when uncontrolled, supports batched functional updates, and skips equal values", async () => {
    const onChange = vi.fn();
    const { result, act } = await renderHook(() =>
      useControllableState<number>({
        defaultValue: () => 1,
        onChange,
      }),
    );

    expect(result.current[0]).toBe(1);
    expect(result.current[2]).toBe(false);

    await act(async () => {
      result.current[1](1);
    });
    expect(onChange).not.toHaveBeenCalled();

    await act(async () => {
      result.current[1]((prev) => prev + 2);
      result.current[1]((prev) => prev * 10);
    });

    expect(result.current[0]).toBe(30);
    expect(onChange).toHaveBeenCalledTimes(2);
    expect(onChange).toHaveBeenNthCalledWith(1, 3);
    expect(onChange).toHaveBeenNthCalledWith(2, 30);
  });

  it("delegates state to parent when controlled and reflects updated value prop", async () => {
    const onChange = vi.fn();
    const { result, rerender, act } = await renderHook(
      (props?: { value: number }) =>
        useControllableState<number>({
          value: props?.value ?? 10,
          defaultValue: 0,
          onChange,
        }),
      { initialProps: { value: 10 } },
    );

    expect(result.current[0]).toBe(10);
    expect(result.current[2]).toBe(true);

    await act(async () => {
      result.current[1]((prev) => prev + 5);
    });
    expect(result.current[0]).toBe(10);
    expect(onChange).toHaveBeenCalledExactlyOnceWith(15);

    await rerender({ value: 15 });
    expect(result.current[0]).toBe(15);
  });

  it("respects a custom shouldUpdate comparator", async () => {
    const onChange = vi.fn();
    const { result, act } = await renderHook(() =>
      useControllableState<{ id: number; label: string }>({
        defaultValue: { id: 1, label: "initial" },
        onChange,
        shouldUpdate: (prev, next) => prev.id === next.id,
      }),
    );

    await act(async () => {
      result.current[1]({ id: 1, label: "changed-label" });
    });
    expect(result.current[0].label).toBe("initial");
    expect(onChange).not.toHaveBeenCalled();

    await act(async () => {
      result.current[1]({ id: 2, label: "updated" });
    });
    expect(result.current[0]).toEqual({ id: 2, label: "updated" });
    expect(onChange).toHaveBeenCalledExactlyOnceWith({
      id: 2,
      label: "updated",
    });
  });
});
