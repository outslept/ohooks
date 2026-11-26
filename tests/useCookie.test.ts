import { useCookie } from "@/hooks/useCookie";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderHook } from "vitest-browser-react";

describe("useCookie", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    for (const name of ["test_cookie", "special cookie=name", "raw_cookie"]) {
      document.cookie = `${encodeURIComponent(name)}=; path=/; max-age=0`;
    }
  });

  it("defaults to null or custom defaultValue, syncs updates across hook instances, and deletes cookie", async () => {
    const { result: hookDefault } = await renderHook(() => useCookie("test_cookie"));
    expect(hookDefault.current[0]).toBeNull();

    const { result: hookA, act } = await renderHook(() =>
      useCookie("test_cookie", { defaultValue: "fallback", sameSite: "lax" }),
    );
    const { result: hookB } = await renderHook(() =>
      useCookie("test_cookie", { defaultValue: "fallback" }),
    );

    expect(hookA.current[0]).toBe("fallback");

    await act(async () => {
      hookA.current[1]("hello world", { maxAge: 3600 });
    });

    expect(hookA.current[0]).toBe("hello world");
    expect(hookB.current[0]).toBe("hello world");
    expect(hookDefault.current[0]).toBe("hello world");

    await act(async () => {
      hookA.current[2]();
    });

    expect(hookA.current[0]).toBe("fallback");
    expect(hookB.current[0]).toBe("fallback");
    expect(hookDefault.current[0]).toBeNull();
  });

  it("encodes special characters in name and value and falls back to raw string on malformed URI encoding", async () => {
    const { result, act } = await renderHook(() => useCookie("special cookie=name"));

    await act(async () => {
      result.current[1]("a=1; b=2 & 100%");
    });

    expect(result.current[0]).toBe("a=1; b=2 & 100%");

    document.cookie = "raw_cookie=%E0%A4%A; path=/";

    const { result: malformed } = await renderHook(() => useCookie("raw_cookie"));
    expect(malformed.current[0]).toBe("%E0%A4%A");
  });

  it("serializes default and overridden cookie attributes on write and delete", async () => {
    const cookieSetterSpy = vi.spyOn(document, "cookie", "set");

    const { result, act } = await renderHook(() =>
      useCookie("test_cookie", {
        path: "/app",
        sameSite: "strict",
        secure: true,
      }),
    );

    const fixedDate = new Date("2030-01-01T00:00:00.000Z");

    await act(async () => {
      result.current[1]("token", {
        maxAge: 60.9,
        expires: fixedDate,
        sameSite: "lax",
      });
    });

    expect(cookieSetterSpy).toHaveBeenLastCalledWith(
      `test_cookie=token; path=/app; max-age=60; expires=${fixedDate.toUTCString()}; secure; samesite=lax`,
    );

    await act(async () => {
      result.current[1]("short", { expires: 1 });
    });
    expect(cookieSetterSpy.mock.calls.at(-1)?.[0]).toContain("expires=");

    await act(async () => {
      result.current[2]({ path: "/custom" });
    });
    expect(cookieSetterSpy).toHaveBeenLastCalledWith(
      `test_cookie=; path=/custom; max-age=0; expires=${new Date(0).toUTCString()}; secure; samesite=strict`,
    );
  });
});
