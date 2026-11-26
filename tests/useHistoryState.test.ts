import { useHistoryState } from "@/hooks/useHistoryState";
import { describe, expect, it } from "vitest";
import { renderHook } from "vitest-browser-react";

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

describe("useHistoryState", () => {
  it("initializes with a value or lazy initializer and empty history", async () => {
    const { result } = await renderHook(() => useHistoryState(() => "initial"));

    expect(result.current.state).toBe("initial");
    expect(result.current.past).toEqual([]);
    expect(result.current.future).toEqual([]);
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  it("tracks undo/redo transitions, clears future on new set, and ignores identical values via Object.is", async () => {
    const { result, act } = await renderHook(() => useHistoryState("a"));

    await act(async () => {
      result.current.undo();
      result.current.redo();
      result.current.set("a");
    });
    expect(result.current.state).toBe("a");
    expect(result.current.past).toEqual([]);

    await act(async () => {
      result.current.set("b");
      result.current.set((prev) => `${prev}c`);
    });
    expect(result.current.state).toBe("bc");
    expect(result.current.past).toEqual(["a", "b"]);
    expect(result.current.canUndo).toBe(true);

    await act(async () => {
      result.current.undo();
    });
    expect(result.current.state).toBe("b");
    expect(result.current.past).toEqual(["a"]);
    expect(result.current.future).toEqual(["bc"]);
    expect(result.current.canRedo).toBe(true);

    await act(async () => {
      result.current.redo();
    });
    expect(result.current.state).toBe("bc");
    expect(result.current.past).toEqual(["a", "b"]);
    expect(result.current.future).toEqual([]);
    expect(result.current.canRedo).toBe(false);

    await act(async () => {
      result.current.undo();
      result.current.set("d");
    });
    expect(result.current.state).toBe("d");
    expect(result.current.past).toEqual(["a", "b"]);
    expect(result.current.future).toEqual([]);
  });

  it("enforces capacity limit and clamps non-positive capacity to 1", async () => {
    const { result, act } = await renderHook(() => useHistoryState(0, 0));

    await act(async () => {
      result.current.set(1);
      result.current.set(2);
      result.current.set(3);
    });

    expect(result.current.state).toBe(3);
    expect(result.current.past).toEqual([2]);
  });

  it("clears both past and future while preserving current state", async () => {
    const { result, act } = await renderHook(() => useHistoryState("a"));

    await act(async () => {
      result.current.set("b");
      result.current.set("c");
      result.current.undo();
    });
    expect(result.current.past).toEqual(["a"]);
    expect(result.current.future).toEqual(["c"]);

    await act(async () => {
      result.current.clear();
    });
    expect(result.current.state).toBe("b");
    expect(result.current.past).toEqual([]);
    expect(result.current.future).toEqual([]);
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  it("resets to initial value or a new explicit baseline (including undefined) and clears history", async () => {
    const { result, act } = await renderHook(() => useHistoryState<string | undefined>("a"));

    await act(async () => {
      result.current.set("b");
      result.current.set("c");
      result.current.undo();
      result.current.reset();
    });
    expect(result.current.state).toBe("a");
    expect(result.current.past).toEqual([]);
    expect(result.current.future).toEqual([]);

    await act(async () => {
      result.current.reset("z");
      result.current.set("y");
      result.current.reset();
    });
    expect(result.current.state).toBe("z");

    await act(async () => {
      result.current.reset(undefined);
    });
    expect(result.current.state).toBeUndefined();
  });
});
