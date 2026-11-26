import { useFullscreen } from "@/hooks/useFullscreen";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderHook } from "vitest-browser-react";

describe("useFullscreen", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = "";
  });

  it("enters, exits, and toggles fullscreen on target and invokes lifecycle callbacks", async () => {
    const box = document.createElement("div");
    const otherBox = document.createElement("div");
    document.body.append(box, otherBox);

    let currentFsElement: Element | null = null;
    Object.defineProperty(document, "fullscreenEnabled", {
      value: true,
      configurable: true,
    });
    Object.defineProperty(document, "fullscreenElement", {
      get: () => currentFsElement,
      configurable: true,
    });

    box.requestFullscreen = async () => {
      currentFsElement = box;
      document.dispatchEvent(new Event("fullscreenchange"));
    };
    document.exitFullscreen = async () => {
      currentFsElement = null;
      document.dispatchEvent(new Event("fullscreenchange"));
    };

    const onEnter = vi.fn();
    const onExit = vi.fn();
    const onError = vi.fn();

    const { result, unmount, act } = await renderHook(() =>
      useFullscreen(box, { onEnter, onExit, onError }),
    );

    expect(result.current.isSupported).toBe(true);
    expect(result.current.isFullscreen).toBe(false);

    await act(async () => {
      await result.current.enter();
    });
    expect(result.current.isFullscreen).toBe(true);
    expect(onEnter).toHaveBeenCalledTimes(1);

    await act(async () => {
      await result.current.toggle();
    });
    expect(result.current.isFullscreen).toBe(false);
    expect(onExit).toHaveBeenCalledTimes(1);

    currentFsElement = otherBox;
    await act(async () => {
      await result.current.exit();
    });
    expect(currentFsElement).toBe(otherBox);

    const requestError = new Error("Fullscreen blocked");
    box.requestFullscreen = async () => {
      throw requestError;
    };
    await act(async () => {
      await result.current.enter();
    });
    expect(onError).toHaveBeenCalledExactlyOnceWith(requestError);

    await unmount();
    currentFsElement = box;
    document.dispatchEvent(new Event("fullscreenchange"));
    expect(onEnter).toHaveBeenCalledTimes(1);
  });
});
