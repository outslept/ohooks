import { useScreenOrientation } from "@/hooks/useScreenOrientation";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderHook } from "vitest-browser-react";

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

describe("useScreenOrientation", () => {
  const originalOrientation = Object.getOwnPropertyDescriptor(window.screen, "orientation");

  afterEach(() => {
    if (originalOrientation) {
      Object.defineProperty(window.screen, "orientation", originalOrientation);
    } else {
      Reflect.deleteProperty(window.screen, "orientation");
    }
    vi.restoreAllMocks();
  });

  it("reads screen.orientation, preserves snapshot when unchanged, updates on change, and delegates lock/unlock", async () => {
    const lockedModes: string[] = [];
    let unlockedCount = 0;

    const fakeOrientation = Object.assign(new EventTarget(), {
      type: "landscape-primary" as OrientationType,
      angle: 90,
      lock: async (mode: string) => {
        lockedModes.push(mode);
      },
      unlock: () => {
        unlockedCount += 1;
      },
    });

    Object.defineProperty(window.screen, "orientation", {
      value: fakeOrientation,
      configurable: true,
    });

    const { result, act } = await renderHook(() => useScreenOrientation());

    expect(result.current.isSupported).toBe(true);
    expect(result.current.type).toBe("landscape-primary");
    expect(result.current.angle).toBe(90);

    await act(async () => {
      fakeOrientation.type = "portrait-primary";
      fakeOrientation.angle = 0;
      fakeOrientation.dispatchEvent(new Event("change"));
    });
    expect(result.current.type).toBe("portrait-primary");
    expect(result.current.angle).toBe(0);

    await act(async () => {
      await result.current.lock("portrait");
      result.current.unlock();
    });
    expect(lockedModes).toEqual(["portrait"]);
    expect(unlockedCount).toBe(1);
  });

  it("falls back to matchMedia when screen.orientation is unavailable and rejects lock()", async () => {
    Object.defineProperty(window.screen, "orientation", {
      value: undefined,
      configurable: true,
    });

    const { result } = await renderHook(() => useScreenOrientation());
    expect(result.current.isSupported).toBe(false);

    await expect(result.current.lock("portrait")).rejects.toThrow(
      "Screen Orientation lock API is not supported.",
    );
    expect(() => result.current.unlock()).not.toThrow();
  });
});
