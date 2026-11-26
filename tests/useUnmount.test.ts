import { useUnmount } from "@/hooks/useUnmount";
import { describe, expect, it, vi } from "vitest";
import { renderHook } from "vitest-browser-react";

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

describe("useUnmount", () => {
  it("invokes only the latest callback on unmount", async () => {
    const first = vi.fn();
    const second = vi.fn();
    const { rerender, unmount } = await renderHook((fn: () => void = first) => useUnmount(fn));

    await rerender(second);
    expect(first).not.toHaveBeenCalled();
    expect(second).not.toHaveBeenCalled();

    await unmount();
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledOnce();
  });
});
