import { useSelection, type UseSelectionOptions } from "@/hooks/useSelection";
import { describe, expect, it, vi } from "vitest";
import { renderHook } from "vitest-browser-react";

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

const ITEMS = [{ id: "a" }, { id: "b" }, { id: "c" }, { id: "d" }];

describe("useSelection", () => {
  it("handles multi-selection, range selection, toggleAll, clear, and no-op guards", async () => {
    const onChange = vi.fn();
    const { result, act } = await renderHook(() =>
      useSelection(ITEMS, { getKey: (item) => item.id, onChange }),
    );

    expect(result.current.isNoneSelected).toBe(true);
    expect(result.current.isPartiallySelected).toBe(false);
    expect(result.current.isAllSelected).toBe(false);

    await act(async () => {
      result.current.clear();
      result.current.deselect("a");
      result.current.selectRange("a", "unknown");
    });
    expect(onChange).not.toHaveBeenCalled();

    await act(async () => {
      result.current.select("a");
    });
    expect(result.current.isSelected("a")).toBe(true);
    expect(result.current.isPartiallySelected).toBe(true);
    expect(onChange).toHaveBeenCalledTimes(1);

    await act(async () => {
      result.current.select("a");
    });
    expect(onChange).toHaveBeenCalledTimes(1);

    await act(async () => {
      result.current.selectRange("d", "b");
    });
    expect(result.current.selectedKeys).toEqual(["a", "b", "c", "d"]);
    expect(result.current.isAllSelected).toBe(true);
    expect(result.current.selectedItems).toEqual(ITEMS);

    await act(async () => {
      result.current.toggleAll();
    });
    expect(result.current.isNoneSelected).toBe(true);

    await act(async () => {
      result.current.toggleAll();
    });
    expect(result.current.isAllSelected).toBe(true);

    await act(async () => {
      result.current.toggle("b");
    });
    expect(result.current.isSelected("b")).toBe(false);
    expect(result.current.isPartiallySelected).toBe(true);
  });

  it("enforces single selection when multiple is false", async () => {
    const { result, act } = await renderHook(() =>
      useSelection(["x", "y", "z"], { multiple: false, defaultValue: ["x"] }),
    );

    expect(result.current.selectedKeys).toEqual(["x"]);

    await act(async () => {
      result.current.select("y");
    });
    expect(result.current.selectedKeys).toEqual(["y"]);

    await act(async () => {
      result.current.selectRange("x", "z");
    });
    expect(result.current.selectedKeys).toEqual(["z"]);

    await act(async () => {
      result.current.selectAll();
    });
    expect(result.current.selectedKeys).toEqual(["z"]);

    await act(async () => {
      result.current.setSelectedKeys(["x", "y"]);
    });
    expect(result.current.selectedKeys).toEqual(["x"]);
  });

  it("supports controlled value mode and handles empty items list", async () => {
    const onChange = vi.fn();
    const { result, rerender, act } = await renderHook((props?: UseSelectionOptions<string>) =>
      useSelection(["a", "b"], {
        value: props?.value ?? ["a"],
        onChange,
      }),
    );

    expect(result.current.selectedKeys).toEqual(["a"]);

    await act(async () => {
      result.current.toggle("b");
    });
    expect(onChange).toHaveBeenCalledWith(["a", "b"]);
    expect(result.current.selectedKeys).toEqual(["a"]);

    await rerender({ value: ["a", "b"] });
    expect(result.current.isAllSelected).toBe(true);

    const { result: emptyResult } = await renderHook(() => useSelection<string>([]));
    expect(emptyResult.current.isAllSelected).toBe(false);
    expect(emptyResult.current.isNoneSelected).toBe(true);
    expect(emptyResult.current.isPartiallySelected).toBe(false);
  });
});
