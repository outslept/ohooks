import { useUrlSearchParams } from "@/hooks/useUrlSearchParams";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { renderHook } from "vitest-browser-react";

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

describe("useUrlSearchParams", () => {
  beforeEach(() => {
    window.history.replaceState(null, "", window.location.pathname);
  });

  afterEach(() => {
    window.history.replaceState(null, "", window.location.pathname);
  });

  it("initializes from object, updates URL query via all init formats, and syncs across hooks", async () => {
    const { result: hookA, act } = await renderHook(() =>
      useUrlSearchParams({
        initialValue: { page: 1, filter: "all", omitted: null, undef: undefined },
      }),
    );
    const { result: hookB } = await renderHook(() => useUrlSearchParams());

    expect(hookA.current[0].get("page")).toBe("1");
    expect(hookA.current[0].get("filter")).toBe("all");
    expect(hookA.current[0].has("omitted")).toBe(false);

    await act(async () => {
      hookA.current[1](
        (prev) => {
          prev.set("page", "2");
          return prev;
        },
        { historyMode: "push" },
      );
    });
    expect(window.location.search).toBe("?page=2&filter=all");
    expect(hookA.current[0].get("page")).toBe("2");
    expect(hookB.current[0].get("page")).toBe("2");

    await act(async () => {
      hookA.current[1]([["sort", "asc"]]);
    });
    expect(window.location.search).toBe("?sort=asc");
    expect(hookB.current[0].get("sort")).toBe("asc");

    await act(async () => {
      hookA.current[1]("q=vitest");
    });
    expect(window.location.search).toBe("?q=vitest");

    await act(async () => {
      hookA.current[1]({});
    });
    expect(window.location.search).toBe("");
    expect(hookB.current[0].toString()).toBe("");
  });

  it("prefers existing window.location.search over initialValue and syncs on popstate", async () => {
    window.history.replaceState(null, "", `${window.location.pathname}?existing=true`);

    const { result, act } = await renderHook(() =>
      useUrlSearchParams({ initialValue: new URLSearchParams("fallback=1") }),
    );

    expect(result.current[0].get("existing")).toBe("true");
    expect(result.current[0].has("fallback")).toBe(false);

    await act(async () => {
      window.history.replaceState(null, "", `${window.location.pathname}?navigated=1`);
      window.dispatchEvent(new PopStateEvent("popstate"));
    });

    expect(result.current[0].get("navigated")).toBe("1");
  });
});
