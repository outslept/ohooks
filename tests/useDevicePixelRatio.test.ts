import { useDevicePixelRatio } from "@/hooks/useDevicePixelRatio";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderHook } from "vitest-browser-react";

describe("useDevicePixelRatio", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("reads devicePixelRatio, re-subscribes to the updated resolution query on change, and cleans up on unmount", async () => {
    const dprSpy = vi.spyOn(window, "devicePixelRatio", "get").mockReturnValue(1);
    const matchMediaSpy = vi.spyOn(window, "matchMedia");

    const { result, unmount, act } = await renderHook(() =>
      useDevicePixelRatio({ defaultValue: 1.5 }),
    );

    expect(result.current).toBe(1);
    expect(matchMediaSpy).toHaveBeenCalledExactlyOnceWith("(resolution: 1dppx)");

    const firstMql = matchMediaSpy.mock.results[0]?.value as MediaQueryList;
    const removeFirstListenerSpy = vi.spyOn(firstMql, "removeEventListener");

    await act(async () => {
      dprSpy.mockReturnValue(2);
      firstMql.dispatchEvent(new Event("change"));
    });

    expect(result.current).toBe(2);
    expect(removeFirstListenerSpy).toHaveBeenCalledOnce();
    expect(matchMediaSpy).toHaveBeenLastCalledWith("(resolution: 2dppx)");

    const secondMql = matchMediaSpy.mock.results[1]?.value as MediaQueryList;
    const removeSecondListenerSpy = vi.spyOn(secondMql, "removeEventListener");

    await unmount();
    expect(removeSecondListenerSpy).toHaveBeenCalledOnce();
  });

  it("falls back to defaultValue when window.devicePixelRatio is 0", async () => {
    vi.spyOn(window, "devicePixelRatio", "get").mockReturnValue(0);

    const { result } = await renderHook(() => useDevicePixelRatio({ defaultValue: 2 }));

    expect(result.current).toBe(2);
  });
});
