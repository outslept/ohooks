import { useAnimationFrame, type AnimationFrameInfo } from "@/hooks/useAnimationFrame";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook } from "vitest-browser-react";

describe("useAnimationFrame", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("starts immediately by default and tracks deltaTime and elapsedTime across frames", async () => {
    const cb = vi.fn();
    const { result, act } = await renderHook(() => useAnimationFrame(cb));

    expect(result.current.isActive).toBe(true);
    expect(cb).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersToNextFrame();
    });

    expect(cb).toHaveBeenCalledTimes(1);
    const first = cb.mock.calls[0]?.[0] as AnimationFrameInfo;
    expect(first.timestamp).toBeGreaterThan(0);
    expect(first.deltaTime).toBe(0);
    expect(first.elapsedTime).toBe(0);

    await act(async () => {
      vi.advanceTimersToNextFrame();
    });

    expect(cb).toHaveBeenCalledTimes(2);
    const second = cb.mock.calls[1]?.[0] as AnimationFrameInfo;
    expect(second.timestamp).toBe(first.timestamp + 16);
    expect(second.deltaTime).toBe(16);
    expect(second.elapsedTime).toBe(16);
  });

  it("remains idle when immediate is false until start is called", async () => {
    const cb = vi.fn();
    const { result, act } = await renderHook(() => useAnimationFrame(cb, { immediate: false }));

    expect(result.current.isActive).toBe(false);

    await act(async () => {
      vi.advanceTimersToNextFrame();
      vi.advanceTimersToNextFrame();
    });
    expect(cb).not.toHaveBeenCalled();

    await act(async () => {
      result.current.start();
    });
    expect(result.current.isActive).toBe(true);

    await act(async () => {
      vi.advanceTimersToNextFrame();
    });
    expect(cb).toHaveBeenCalledTimes(1);
    expect(cb.mock.calls[0]?.[0]).toMatchObject({
      deltaTime: 0,
      elapsedTime: 0,
    });
  });

  it("ignores non-positive fpsLimit (0 or negative) and runs on every frame", async () => {
    const cb = vi.fn();
    const { act } = await renderHook(() => useAnimationFrame(cb, { fpsLimit: 0 }));

    await act(async () => {
      vi.advanceTimersToNextFrame();
      vi.advanceTimersToNextFrame();
    });

    expect(cb).toHaveBeenCalledTimes(2);
    expect(cb.mock.calls[1]?.[0]).toMatchObject({
      deltaTime: 16,
      elapsedTime: 16,
    });
  });

  it("stops, restarts via start or toggle, and resets timing counters on restart", async () => {
    const cb = vi.fn();
    const { result, act } = await renderHook(() => useAnimationFrame(cb));

    await act(async () => {
      vi.advanceTimersToNextFrame();
      vi.advanceTimersToNextFrame();
    });
    expect(cb).toHaveBeenCalledTimes(2);

    await act(async () => {
      result.current.stop();
    });
    expect(result.current.isActive).toBe(false);

    await act(async () => {
      vi.advanceTimersToNextFrame();
    });
    expect(cb).toHaveBeenCalledTimes(2);

    await act(async () => {
      result.current.toggle();
    });
    expect(result.current.isActive).toBe(true);

    await act(async () => {
      vi.advanceTimersToNextFrame();
    });
    expect(cb).toHaveBeenCalledTimes(3);
    expect(cb.mock.calls[2]?.[0]).toMatchObject({
      deltaTime: 0,
      elapsedTime: 0,
    });
  });

  it("cancels the pending animation frame on unmount", async () => {
    const cancelSpy = vi.spyOn(window, "cancelAnimationFrame");
    const cb = vi.fn();

    const { unmount, act } = await renderHook(() => useAnimationFrame(cb));

    await act(async () => {
      vi.advanceTimersToNextFrame();
    });
    expect(cb).toHaveBeenCalledTimes(1);

    await unmount();
    expect(cancelSpy).toHaveBeenCalledTimes(1);

    await act(async () => {
      vi.advanceTimersToNextFrame();
    });
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it("treats redundant start and stop calls as no-ops", async () => {
    const rafSpy = vi.spyOn(window, "requestAnimationFrame");
    const cancelSpy = vi.spyOn(window, "cancelAnimationFrame");
    const cb = vi.fn();

    const { result, act } = await renderHook(() => useAnimationFrame(cb));

    await act(async () => {
      vi.advanceTimersToNextFrame();
    });
    const rafCountAfterFirstFrame = rafSpy.mock.calls.length;

    await act(async () => {
      result.current.start();
    });
    expect(rafSpy.mock.calls.length).toBe(rafCountAfterFirstFrame);

    await act(async () => {
      vi.advanceTimersToNextFrame();
    });
    expect(cb.mock.calls[1]?.[0]).toMatchObject({
      deltaTime: 16,
      elapsedTime: 16,
    });

    await act(async () => {
      result.current.stop();
    });
    const cancelCountAfterStop = cancelSpy.mock.calls.length;

    await act(async () => {
      result.current.stop();
    });
    expect(cancelSpy.mock.calls.length).toBe(cancelCountAfterStop);
  });

  it("stopping from inside the frame callback prevents scheduling the next frame", async () => {
    const cb = vi.fn();
    let stopLoop = () => {};

    const { result, act } = await renderHook(() => {
      const controls = useAnimationFrame((info) => {
        cb(info);
        stopLoop();
      });
      stopLoop = controls.stop;
      return controls;
    });

    await act(async () => {
      vi.advanceTimersToNextFrame();
    });

    expect(cb).toHaveBeenCalledTimes(1);
    expect(result.current.isActive).toBe(false);

    await act(async () => {
      vi.advanceTimersToNextFrame();
      vi.advanceTimersToNextFrame();
    });

    expect(cb).toHaveBeenCalledTimes(1);
  });
});
