import { useUpdateEffect } from "@/hooks/useUpdateEffect";
import { describe, expect, it, vi } from "vitest";
import { renderHook } from "vitest-browser-react";

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

describe("useUpdateEffect", () => {
  it("skips mount, runs on dep change, and cleans up before next run and unmount", async () => {
    const cleanup = vi.fn();
    const effect = vi.fn(() => cleanup);
    const { rerender, unmount } = await renderHook((dep: number = 1) =>
      useUpdateEffect(effect, [dep]),
    );

    expect(effect).not.toHaveBeenCalled();
    await rerender(1);
    expect(effect).not.toHaveBeenCalled();

    await rerender(2);
    expect(effect).toHaveBeenCalledTimes(1);
    expect(cleanup).not.toHaveBeenCalled();

    await rerender(3);
    expect(cleanup).toHaveBeenCalledTimes(1);
    expect(effect).toHaveBeenCalledTimes(2);

    await unmount();
    expect(cleanup).toHaveBeenCalledTimes(2);
  });

  it("runs on every re-render after mount when deps are omitted", async () => {
    const effect = vi.fn();
    const { rerender } = await renderHook(() => useUpdateEffect(effect));

    expect(effect).not.toHaveBeenCalled();
    await rerender();
    await rerender();
    expect(effect).toHaveBeenCalledTimes(2);
  });
});
