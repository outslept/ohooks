import { useLatest } from "@/hooks/useLatest";
import { describe, expect, it } from "vitest";
import { renderHook } from "vitest-browser-react";

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

describe("useLatest", () => {
  it("preserves ref object identity while updating .current on rerender", async () => {
    const { result, rerender } = await renderHook(
      (props?: { val: number }) => useLatest(props?.val ?? 1),
      { initialProps: { val: 1 } },
    );

    const initialRef = result.current;
    expect(initialRef.current).toBe(1);

    await rerender({ val: 2 });
    expect(result.current).toBe(initialRef);
    expect(result.current.current).toBe(2);
  });
});
