import { useWakeLock } from "@/hooks/useWakeLock";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderHook } from "vitest-browser-react";

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

class FakeWakeLockSentinel extends EventTarget {
  released = false;
  readonly type = "screen" as const;
  releaseCalls = 0;

  async release(): Promise<void> {
    this.releaseCalls += 1;
    this.released = true;
    this.dispatchEvent(new Event("release"));
  }
}

describe("useWakeLock", () => {
  const originalWakeLock = Object.getOwnPropertyDescriptor(navigator, "wakeLock");
  const originalVisibility = Object.getOwnPropertyDescriptor(document, "visibilityState");

  afterEach(() => {
    if (originalWakeLock) {
      Object.defineProperty(navigator, "wakeLock", originalWakeLock);
    } else {
      delete (navigator as unknown as Record<string, unknown>).wakeLock;
    }
    if (originalVisibility) {
      Object.defineProperty(document, "visibilityState", originalVisibility);
    } else {
      delete (document as unknown as Record<string, unknown>).visibilityState;
    }
  });

  it("acquires wake lock, reacquires on visibilitychange after release, and releases on disable", async () => {
    Object.defineProperty(document, "visibilityState", {
      value: "visible",
      configurable: true,
    });

    const sentinels: FakeWakeLockSentinel[] = [];
    Object.defineProperty(navigator, "wakeLock", {
      value: {
        request: async () => {
          const s = new FakeWakeLockSentinel();
          sentinels.push(s);
          return s;
        },
      },
      configurable: true,
    });

    const { result, rerender, act } = await renderHook((enabled: boolean = true) =>
      useWakeLock(enabled),
    );

    await expect.poll(() => result.current.isLocked).toBe(true);
    expect(result.current.isSupported).toBe(true);
    expect(sentinels).toHaveLength(1);

    await act(async () => {
      sentinels[0]!.dispatchEvent(new Event("release"));
    });
    expect(result.current.isLocked).toBe(false);

    await act(async () => {
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await expect.poll(() => result.current.isLocked).toBe(true);
    expect(sentinels).toHaveLength(2);

    await rerender(false);
    expect(result.current.isLocked).toBe(false);
    expect(sentinels[1]!.releaseCalls).toBe(1);
  });

  it("captures request errors via error state and onError callback, and handles unsupported API", async () => {
    Object.defineProperty(document, "visibilityState", {
      value: "visible",
      configurable: true,
    });
    Object.defineProperty(navigator, "wakeLock", {
      value: {
        request: async () => {
          throw new Error("NotAllowedError");
        },
      },
      configurable: true,
    });

    const onError = vi.fn();
    const { result } = await renderHook(() => useWakeLock(true, { onError }));

    await expect.poll(() => result.current.error?.message).toBe("NotAllowedError");
    expect(result.current.isLocked).toBe(false);
    expect(onError).toHaveBeenCalledTimes(1);

    Object.defineProperty(navigator, "wakeLock", {
      value: undefined,
      configurable: true,
    });
    const { result: unsupported } = await renderHook(() => useWakeLock(true));
    expect(unsupported.current.isSupported).toBe(false);
    expect(unsupported.current.isLocked).toBe(false);
  });
});
