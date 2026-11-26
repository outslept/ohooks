import { useHydrated } from "@/hooks/useHydrated";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { renderHook } from "vitest-browser-react";

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

describe("useHydrated", () => {
  it("returns false during SSR and true on the client across rerenders", async () => {
    const ServerProbe = () => createElement("span", null, String(useHydrated()));
    expect(renderToString(createElement(ServerProbe))).toBe("<span>false</span>");

    const { result, rerender } = await renderHook(() => useHydrated());
    expect(result.current).toBe(true);

    await rerender();
    expect(result.current).toBe(true);
  });
});
