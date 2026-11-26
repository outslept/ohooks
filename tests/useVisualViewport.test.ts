import { useVisualViewport } from "@/hooks/useVisualViewport";
import { afterEach, describe, expect, it } from "vitest";
import { renderHook } from "vitest-browser-react";

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

describe("useVisualViewport", () => {
  const originalVisualViewport = Object.getOwnPropertyDescriptor(window, "visualViewport");

  afterEach(() => {
    if (originalVisualViewport) {
      Object.defineProperty(window, "visualViewport", originalVisualViewport);
    }
  });

  it("tracks visualViewport resize/scroll events and caches unchanged snapshots", async () => {
    const fakeVv = Object.assign(new EventTarget(), {
      width: 1024,
      height: 768,
      offsetLeft: 0,
      offsetTop: 0,
      pageLeft: 0,
      pageTop: 0,
      scale: 1,
    });
    Object.defineProperty(window, "visualViewport", {
      value: fakeVv,
      configurable: true,
    });

    const { result, act } = await renderHook(() => useVisualViewport());

    expect(result.current.isSupported).toBe(true);
    expect(result.current.width).toBe(1024);
    expect(result.current.scale).toBe(1);

    const prevSnapshot = result.current;
    await act(async () => {
      fakeVv.dispatchEvent(new Event("scroll"));
    });
    expect(result.current).toBe(prevSnapshot);

    await act(async () => {
      fakeVv.width = 512;
      fakeVv.scale = 2;
      fakeVv.dispatchEvent(new Event("resize"));
    });
    expect(result.current.width).toBe(512);
    expect(result.current.scale).toBe(2);
  });

  it("falls back to window dimensions and updates on window resize when visualViewport is unavailable", async () => {
    Object.defineProperty(window, "visualViewport", {
      value: null,
      configurable: true,
    });
    const originalWidth = window.innerWidth;

    const { result, act } = await renderHook(() => useVisualViewport());

    expect(result.current.isSupported).toBe(false);
    expect(result.current.width).toBe(window.innerWidth);
    expect(result.current.height).toBe(window.innerHeight);

    Object.defineProperty(window, "innerWidth", {
      value: 777,
      configurable: true,
      writable: true,
    });
    await act(async () => {
      window.dispatchEvent(new Event("resize"));
    });
    expect(result.current.width).toBe(777);

    Object.defineProperty(window, "innerWidth", {
      value: originalWidth,
      configurable: true,
      writable: true,
    });
  });
});
