import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";
import { useLayoutEffect } from "react";
import { describe, expect, it } from "vitest";

describe("useIsomorphicLayoutEffect", () => {
  it("resolves to useLayoutEffect in browser environment", () => {
    expect(useIsomorphicLayoutEffect).toBe(useLayoutEffect);
  });
});
